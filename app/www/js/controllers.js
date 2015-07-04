angular.module('starter.controllers', [])

    .controller('DashCtrl', function ($scope, $state, routes) {
      routes.getWayPoints('37.7738571,-122.4102823', '37.7891231,-122.4173545').then(function(wayPoints) {
        $scope.wayPoints = wayPoints;
        $scope.locationsForStreetView = [];
        for (var i = 0; i < $scope.wayPoints.length; i++) {
          $scope.locationsForStreetView.push($scope.wayPoints[i].lon + "," + $scope.wayPoints[i].lat);
        }
      });
    })

.controller('ChatsCtrl', function ($scope, Chats) {
	// With the new view caching in Ionic, Controllers are only called
	// when they are recreated or on app start, instead of every page change.
	// To listen for when this page is active (for example, to refresh data),
	// listen for the $ionicView.enter event:
	//
	//$scope.$on('$ionicView.enter', function(e) {
	//});

	$scope.chats = Chats.all();
	$scope.remove = function (chat) {
		Chats.remove(chat);
	}
})

.controller('ChatDetailCtrl', function ($scope, $stateParams, Chats) {
	$scope.chat = Chats.get($stateParams.chatId);
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

.controller('RouteCtrl', function($scope, $ionicSlideBoxDelegate, $q, routes, what3words) {
  routes.getWayPoints('37.7738571,-122.4102823', '37.7891231,-122.4173545').then(function(wayPoints) {
    var deferreds = [];
    for (var wayPointIndex = 0; wayPointIndex < wayPoints.length; wayPointIndex++) {
      var wayPoint = wayPoints[wayPointIndex];
      deferreds.push(what3words.getWords(WHAT3WORDS_API_KEY, wayPoint.lat, wayPoint.lon));
    }
    
    $q.all(deferreds).then(function(wordLists) {
      console.log(wayPoints);
      console.log(wordLists);
      $scope.data = {};
      $scope.data.wayPoints = [];
      for (var wayPointIndex = 0; wayPointIndex < wayPoints.length; wayPointIndex++) {
        var wayPoint = wayPoints[wayPointIndex];
        var words = wordLists[wayPointIndex];
        $scope.data.wayPoints.push({lat: wayPoint.lat,
                                    lon: wayPoint.lon,
                                    words: words});
      }
      console.log($scope.data.wayPoints);
      $ionicSlideBoxDelegate.update();
    });
  });
})

.controller('AccountCtrl', function($scope) {
  $scope.settings = {
    enableFriends: true
  };
});
