angular.module('starter.controllers', [])

.controller('IntroCtrl', function () {})

.controller('DashCtrl', function ($scope, $location, queryData, geolocation, getPostcode) {

	$scope.noFields = false;

	$scope.searchLocation = function (startLocation, targetLocation, transportMode) {

		console.log(startLocation);
		console.log(targetLocation);

		if (startLocation === undefined ||
			startLocation === '' ||
			targetLocation === undefined ||
			targetLocation === '') {
			$scope.noFields = true;
		} else {
			$scope.noFields = false;


      var query = queryData.getQueryData();



      if (query.destination === '') {

          startLocation= query.origin;

         

      } 

         queryData.setQueryData(startLocation, targetLocation, transportMode);
                        $location.path('/tab/route');
		}

	};

	$scope.getCurrentLocation = function () {

var start = '';
    geolocation.getLocation().then(function(data){



getPostcode.get(data.coords.latitude, data.coords.longitude).success(function(data) {

  start = data.address.postcode;
 queryData.setQueryData(start, '', '');
    
       $scope.startLocation = start;
});

});

};





})

.controller('HyperCtrl', function() {

  
})

.directive('hyperlapse', function($timeout, $location, $q, what3words, queryData) {

  return {
    scope: {
      lat: '@',
      long: '@'
    },
    template: '<div id="hyperlapse"></div>',
    link: function(scope, element) {
      $timeout(function() {
        var data = queryData.getQueryData();
        if (data.origin && data.destination) {
          function doHyperlapse(origin, destination, transportMode) {
            var el = element[0];
    
            var hyperlapse = new Hyperlapse(el, {
                zoom: 1,
                elevation: 50
            });
            
            hyperlapse.onError = function(e) {
                console.log(e);
            };
            
            hyperlapse.onRouteComplete = function(e) {
                hyperlapse.load();
            };
            
            hyperlapse.onLoadComplete = function(e) {
                hyperlapse.play();
            };
            
            // Google Maps API stuff here...
            var directions_service = new google.maps.DirectionsService();
            
            var travelModes = {
              walking: google.maps.TravelMode.WALKING,
              cycle: google.maps.TravelMode.BICYCLING,
            };
            var route = {
              request:{
                origin: origin,
                destination: destination,
                travelMode: travelModes[transportMode] || google.maps.TravelMode.WALKING
              }
            };
            
            directions_service.route(route.request, function(response, status) {
                if (status == google.maps.DirectionsStatus.OK) {
                    hyperlapse.generate( {route:response} );
                } else {
                    console.log(status);
                }
            });
          };

			var origin = data.origin;
			var destination = data.destination;
			var deferreds = [];
			var originWords = /^(\w+) (\w+) (\w+)$/.exec(origin);
			if (originWords && (originWords.length == 4)) {
				deferreds.push(what3words.getLocation(WHAT3WORDS_API_KEY, [originWords[1], originWords[2], originWords[3]]).then(function(latLon) {
					origin = latLon.lat + "," + latLon.lon;
					return null;
                                }));
			}
			var destinationWords = /^(\w+) (\w+) (\w+)$/.exec(destination);
			if (destinationWords && (destinationWords.length == 4)) {
				deferreds.push(what3words.getLocation(WHAT3WORDS_API_KEY, [destinationWords[1], destinationWords[2], destinationWords[3]]).then(function(latLon) {
					destination = latLon.lat + "," + latLon.lon;
					return null;
                                }));
			}
			if (deferreds.length > 0) {
				$q.all(deferreds).finally(function() {
					console.log("All done!");
					doHyperlapse(origin, destination, data.transportMode);
				});
			} else {
				doHyperlapse(origin, destination, data.transportMode);
			}

        } else {
          $location.path('/tab/dash');
        }
      }, 10);
    }
  };
})

.directive('imageSearch', function (imageSeachFactory) {
	return {
		scope: {
			keyword: '@keyword'
		},
		link: function (scope, element) {
			var keyword = scope.keyword;
			imageSeachFactory.getImage(keyword)
				.success(function (data, status, headers, config) {
					element.append('<img src="' + data.items[0].link + '" style="width: 100%; height: auto" />');
				})
		},
		template: '<div></div>'
	}
})

.controller('RouteCtrl', function ($scope, $location, $ionicSlideBoxDelegate, $q, routes, what3words, queryData, $timeout) {
	$scope.$on('$ionicView.enter', function(e) {
		var data = queryData.getQueryData();
		function doMap(origin, destination, transportMode) {
			// Map

			var map;
			var directionsDisplay;
			var directionsService;
			var stepDisplay;
			var myRoute;
			var markerArray = [];

			function initializeMap() {
				console.log('map load');
			  // Instantiate a directions service.
			  directionsService = new google.maps.DirectionsService();

			  // Create a map and center it on Manhattan.
			  var manhattan = new google.maps.LatLng(origin);
			  var mapOptions = {
			    zoom: 15,
			    center: manhattan
			  }
			  map = new google.maps.Map(document.getElementById('map-canvas'), mapOptions);

			  // Create a renderer for directions and bind it to the map.
			  var rendererOptions = {
			    map: map
			  }
			  directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions)

			  // Instantiate an info window to hold step text.
			 	stepDisplay = new google.maps.InfoWindow();
			 	calcRoute();
			}

			function calcRoute() {
				console.log('calc route', origin, destination);
			  // First, remove any existing markers from the map.
			  for (var i = 0; i < markerArray.length; i++) {
			    markerArray[i].setMap(null);
			  }

			  // Now, clear the array itself.
			  markerArray = [];

			  // Retrieve the start and end locations and create
			  // a DirectionsRequest using WALKING directions.
				var travelModes = {
					walking: google.maps.TravelMode.WALKING,
					cycle: google.maps.TravelMode.BICYCLING,
				};

				var travelMode = travelModes[travelMode] || google.maps.TravelMode.WALKING;


			 console.log(transportMode);
			  var request = {
			      origin: origin,
			      destination: destination,
			      travelMode: travelMode
			  };

			  // Route the directions and pass the response to a
			  // function to create markers for each step.
			  directionsService.route(request, function(response, status) {
			    if (status == google.maps.DirectionsStatus.OK) {
			      //var warnings = document.getElementById('warnings_panel');
			      //warnings.innerHTML = '<b>' + response.routes[0].warnings + '</b>';
			      directionsDisplay.setDirections(response);
			      showSteps(response);
			    }
			  });


			}

			function showSteps(directionResult) {
			  // For each step, place a marker, and add the text to the marker's
			  // info window. Also attach the marker to an array so we
			  // can keep track of it and remove it when calculating new
			  // routes.
			  myRoute = directionResult.routes[0].legs[0];

			  for (var i = 0; i < myRoute.steps.length; i++) {
			  	console.log('adding marker for ', myRoute.steps[i].start_location);
			    var marker = new google.maps.Marker({
			      position: myRoute.steps[i].start_location,
			      map: map
			    });
			    attachInstructionText(marker, myRoute.steps[i].instructions);
			    markerArray[i] = marker;
			  }

			   //Set map to first marker
			   $timeout(function() {
			  	 updateMapDisplay(markerArray[0], myRoute.steps[0].instructions);
				 }, 500);

			}

			function attachInstructionText(marker, text) {

			  google.maps.event.addListener(marker, 'click', function() {
			    // Open an info window when the marker is clicked on,
			    // containing the text of the step.
			    stepDisplay.setContent(text);
			    stepDisplay.open(map, marker);
    			map.setCenter(marker.getPosition());
					map.setZoom(15);
			  });
			}
			
			initializeMap();

			$scope.slideHasChanged = function(index) {
				console.log('slide has changed');
			    updateMapDisplay(markerArray[index], myRoute.steps[index].instructions);

			}

			function updateMapDisplay(marker, text) {
				 	stepDisplay.setContent(text);
			    stepDisplay.open(map, marker);
    			map.setCenter(marker.getPosition());
					map.setZoom(20);
			}

		}
		if (data.origin && data.destination) {
			function getRoutes(origin, destination, transportMode) {
				console.log(origin, destination, transportMode);
				routes.getWayPoints(origin, destination, transportMode).then(function (wayPoints) {
					var deferreds = [];
					for (var wayPointIndex = 0; wayPointIndex < wayPoints.length; wayPointIndex++) {
						var wayPoint = wayPoints[wayPointIndex];
						deferreds.push(what3words.getWords(WHAT3WORDS_API_KEY, wayPoint.lat, wayPoint.lon));
					}
		
					$q.all(deferreds).then(function (wordLists) {
						console.log(wayPoints);
						console.log(wordLists);
						$scope.data = {key: GOOGLE_API_KEY};
						$scope.data.wayPoints = [];
						for (var wayPointIndex = 0; wayPointIndex < wayPoints.length; wayPointIndex++) {
							var wayPoint = wayPoints[wayPointIndex];
							var words = wordLists[wayPointIndex];
							$scope.data.wayPoints.push({
								lat: wayPoint.lat,
								lon: wayPoint.lon,
								bearing: wayPoint.bearing,
								directions: wayPoint.directions,
								words: words
							});
						}
						console.log($scope.data.wayPoints);
						$ionicSlideBoxDelegate.update();
					});
				});
				doMap(origin, destination, transportMode);
			}
			var origin = data.origin;
			var destination = data.destination;
			var deferreds = [];
			var originWords = /^(\w+) (\w+) (\w+)$/.exec(origin);
			if (originWords && (originWords.length == 4)) {
				deferreds.push(what3words.getLocation(WHAT3WORDS_API_KEY, [originWords[1], originWords[2], originWords[3]]).then(function(latLon) {
					origin = latLon.lat + "," + latLon.lon;
					return null;
                                }));
			}
			var destinationWords = /^(\w+) (\w+) (\w+)$/.exec(destination);
			if (destinationWords && (destinationWords.length == 4)) {
				deferreds.push(what3words.getLocation(WHAT3WORDS_API_KEY, [destinationWords[1], destinationWords[2], destinationWords[3]]).then(function(latLon) {
					destination = latLon.lat + "," + latLon.lon;
					return null;
                                }));
			}
			if (deferreds.length > 0) {
				$q.all(deferreds).finally(function() {
					console.log("All done!");
					getRoutes(origin, destination, data.transportMode);
				});
			} else {
				getRoutes(origin, destination, data.transportMode);
			}
		} else {
			$location.path('/tab/dash');
		}


	});
})


.controller('WelcomeController', function ($scope, $state) {

	$scope.hide = function () {
		$scope.hideIntro = true;
	}

});
