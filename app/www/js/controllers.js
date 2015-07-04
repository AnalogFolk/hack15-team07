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



      if(query.destination === '') {

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

.directive('hyperlapse', function($timeout, queryData) {

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



      
      routes.getWayPoints(data.origin, data.destination).then(function (wayPoints) {
        var deferreds = [];
        for (var wayPointIndex = 0; wayPointIndex < wayPoints.length; wayPointIndex++) {
          var wayPoint = wayPoints[wayPointIndex];
          
var lat = wayPoint.lat;
        }



var el = element[0];

var hyperlapse = new Hyperlapse(el, {
    lookat: new google.maps.LatLng(37.81409525128964,-122.4775045005249),
    zoom: 1,
    use_lookat: true,
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

var route = {
    request:{
        origin: new google.maps.LatLng(37.816480000000006,-122.47825,37),
        destination: new google.maps.LatLng(37.81195,-122.47773000000001),
        travelMode: google.maps.DirectionsTravelMode.DRIVING
    }
};

directions_service.route(route.request, function(response, status) {
    if (status == google.maps.DirectionsStatus.OK) {
        hyperlapse.generate( {route:response} );
    } else {
        console.log(status);
    }
});










  
      });
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

.controller('RouteCtrl', function ($scope, $location, $ionicSlideBoxDelegate, $q, routes, what3words, queryData) {
	$scope.$on('$ionicView.enter', function(e) {
		var data = queryData.getQueryData();
		if (data.origin && data.destination) {
			routes.getWayPoints(data.origin, data.destination).then(function (wayPoints) {
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
