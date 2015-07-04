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

.controller('RouteCtrl', function ($scope, $location, $ionicSlideBoxDelegate, $q, routes, what3words, queryData) {
	$scope.$on('$ionicView.enter', function(e) {
		var data = queryData.getQueryData();
		if (data.origin && data.destination) {
			function getRoutes(origin, destination, transportMode) {
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
								words: words
							});
						}
						console.log($scope.data.wayPoints);
						$ionicSlideBoxDelegate.update();
					});
				});
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
				deferreds.push(what3words.getLocation(WHAT3WORDS_API_KEY, [destinationWords[1], destinationWords[2], destinationWords[3]]).then(function(lat, lon) {
					destination = latLon.lat + "," + latLon.lon;
					return null;
                                }));
			}
			if (deferreds.length > 0) {
				$q.all(deferreds).finally(function() {
					console.log("All done!");
					getRoutes(origin, destination, null);
				});
			} else {
				getRoutes(origin, destination, null);
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
