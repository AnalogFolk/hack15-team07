angular.module('starter.services', [])

.factory('Chats', function () {
	// Might use a resource here that returns a JSON array

	// Some fake testing data
	var chats = [{
		id: 0,
		name: 'Ben Sparrow',
		lastText: 'You on your way?',
		face: 'https://pbs.twimg.com/profile_images/514549811765211136/9SgAuHeY.png'
	}, {
		id: 1,
		name: 'Max Lynx',
		lastText: 'Hey, it\'s me',
		face: 'https://avatars3.githubusercontent.com/u/11214?v=3&s=460'
	}, {
		id: 2,
		name: 'Adam Bradleyson',
		lastText: 'I should buy a boat',
		face: 'https://pbs.twimg.com/profile_images/479090794058379264/84TKj_qa.jpeg'
	}, {
		id: 3,
		name: 'Perry Governor',
		lastText: 'Look at my mukluks!',
		face: 'https://pbs.twimg.com/profile_images/598205061232103424/3j5HUXMY.png'
	}, {
		id: 4,
		name: 'Mike Harrington',
		lastText: 'This is wicked good ice cream.',
		face: 'https://pbs.twimg.com/profile_images/578237281384841216/R3ae1n61.png'
	}];

	return {
		all: function () {
			return chats;
		},
		remove: function (chat) {
			chats.splice(chats.indexOf(chat), 1);
		},
		get: function (chatId) {
			for (var i = 0; i < chats.length; i++) {
				if (chats[i].id === parseInt(chatId)) {
					return chats[i];
				}
			}
			return null;
		}
	};
})

.factory('routes', ['$rootScope', '$q',
	function ($rootScope, $q) {
		function getWayPoints(origin, destination, travelMode) {
			var request = {
				origin: origin,
				destination: destination,
				travelMode: travelMode || google.maps.TravelMode.WALKING
			};
			var deferred = $q.defer();

			function callback(result, status) {
				if (status == google.maps.DirectionsStatus.OK) {
					var route = result.routes[0];
					var wayPoints = [];
					for (var legIndex = 0; legIndex < route.legs.length; legIndex++) {
						var leg = route.legs[legIndex];
						for (var stepIndex = 0; stepIndex < leg.steps.length; stepIndex++) {
							var step = leg.steps[stepIndex];
							var startLat = step.start_location.A * Math.PI / 180;
							var startLon = step.start_location.F * Math.PI / 180;
							var endLat = step.end_location.A * Math.PI / 180;
							var endLon = step.end_location.F * Math.PI / 180;
							var dy = Math.sin(endLon - startLon) * Math.cos(endLat);
							var dx = Math.cos(startLat) * Math.sin(endLat) - Math.sin(startLat) * Math.cos(endLat) * Math.cos(endLon - startLon);
							var bearing = Math.atan2(dy, dx) * 180 / Math.PI;
							wayPoints.push({
								lat: step.end_location.A,
								lon: step.end_location.F,
								bearing: bearing
							});
						}
					}
					$rootScope.$apply(function () {
						return deferred.resolve(wayPoints);
					});
				} else {
					$rootScope.$apply(function () {
						return deferred.reject(status);
					});
				}
			}

			var directionsService = new google.maps.DirectionsService();
			directionsService.route(request, callback);
			return deferred.promise;
		}

		return {
			getWayPoints: getWayPoints
		}
	}
])

.factory('what3words', ['$rootScope', '$q', '$http',
	function ($rootScope, $q, $http) {
		var BASE_W3W_URL = 'https://api.what3words.com/w3w';
		var BASE_LOCATION_URL = 'https://api.what3words.com/position';

		function getWords(key, lat, lon) {
			var deferred = $q.defer();

			var config = {
				params: {
					key: key,
					position: lat + "," + lon
				}
			};

			$http.get(BASE_LOCATION_URL, config)
				.success(function (data, status, headers, config) {
					var obj = angular.fromJson(data);
					return deferred.resolve(obj.words);
				})
				.error(function (data, status, headers, config) {
					return deferred.reject(status);
				});

			return deferred.promise;
		}

		function getLocation(key, words) {
			var deferred = $q.defer();

			var config = {
				params: {
					key: key,
					string: words[0] + "." + words[1] + "." + words[2]
				}
			};

			$http.get(BASE_W3W_URL, config)
				.success(function (data, status, headers, config) {
					var obj = angular.fromJson(data);
					if (obj.position) {
						return deferred.resolve({lat: obj.position[0], lon: obj.position[1]});
					} else {
						return deferred.reject(status);
					}
				})
				.error(function (data, status, headers, config) {
					return deferred.reject(status);
				});

			return deferred.promise;
		}

		return {
			getWords: getWords,
			getLocation: getLocation
		}
	}
])

.factory('queryData', function() {
	var data = {
		origin: null, 
		destination: null, 
		transportMode: null
	};
	
	return {
		getQueryData: function() {
			return data;
		},
		
		setQueryData: function(origin, destination, transportMode) {
			data.origin = origin;
			data.destination = destination;
			data.transportMode = transportMode;
		}
	};
})

.factory('imageSeachFactory', function ($http) {
	return {
		getImage: function (keyword) {
			var url = 'https://www.googleapis.com/customsearch/v1?key=AIzaSyB_YLmll7jz5Zf1k5AASrUCRRBd0hv8Y1E&cx=011460730493878415394%3Avqnl6h9war8&searchType=image&imgSize=small&q=' + keyword;
			return $http.get(url)
		}
	}
})

.factory('getPostcode', function($http) {

return {
	get: function(latitude, longitude) {

		return $http.get('http://nominatim.openstreetmap.org/reverse?format=json&lat=' + latitude + '&lon=' + longitude + '&zoom=18&addressdetails=1');


	}
}

});
