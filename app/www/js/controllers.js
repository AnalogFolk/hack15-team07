angular.module('starter.controllers', [])

.controller('IntroCtrl', function () {})

.controller('DashCtrl', function ($scope, $location, queryData) {

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
			queryData.setQueryData(startLocation, targetLocation, transportMode);
                        $location.path('/tab/route');
		}

	};

	$scope.getCurrentLocation = function () {


		console.log('hello');

		//geolocation.getLocation().then(function(data){
		//     $scope.startLocation = {lat:data.coords.latitude, long:data.coords.longitude};
		//   });



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

.controller('RouteCtrl', function ($scope, $ionicSlideBoxDelegate, $q, routes, what3words, queryData) {
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
					$scope.data = {};
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
	});
})


.controller('WelcomeController', function ($scope, $state) {

	$scope.hide = function () {
		$scope.hideIntro = true;
	}

});
