var appServ = angular.module('teritorymgmt.services', [])

appServ.factory("postData",function(){function n(n,t){var e=t();return e["Content-type"]="application/x-www-form-urlencoded; charset=utf-8",r(n)}function r(n){if(!angular.isObject(n))return null==n?"":n.toString();var r=[];for(var t in n)if(n.hasOwnProperty(t)){var e=n[t];r.push(encodeURIComponent(t)+"="+encodeURIComponent(null==e?"":e))}var o=r.join("&").replace(/%20/g,"+");return o}return n});

appServ.factory('geoLoc',function($rootScope,$location,$q){
	function distanceLoc(lat1, lon1, lat2, lon2, unit){
		var radlat1 = Math.PI * lat1/180;
		var radlat2 = Math.PI * lat2/180;
		var radlon1 = Math.PI * lon1/180;
		var radlon2 = Math.PI * lon2/180;
		var theta = lon1-lon2;
		var radtheta = Math.PI * theta/180;
		var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
		dist = Math.acos(dist);
		dist = dist * 180/Math.PI;
		dist = dist * 60 * 1.1515;
		if (unit=="K") { dist = dist * 1.609344 }
		if (unit=="N") { dist = dist * 0.8684 }
		return dist.toFixed(2) * 1000;
	}
	
	return{
		
		onError:function(error){
			console.log('code: '    + error.code    + '\n' +
						'message: ' + error.message + '\n'
			);
		},
		
		onSuccess:function(position){
			var dist = distanceLoc($rootScope.qrLat, $rootScope.qrLong,position.coords.latitude,position.coords.longitude,'K');
			$rootScope.rangeDistance = dist;
			$rootScope.curLat 	= position.coords.latitude;
			$rootScope.curLong 	= position.coords.longitude;
			
		},
		getCurrent:function(){
			var deferred = $q.defer();
			navigator.geolocation.getCurrentPosition(function(position){
				deferred.resolve(position);
			},function(error){
				console.log('code: '    + error.code    + '\n' +
							'message: ' + error.message + '\n'
				);
				deferred.reject(error);
			});
			return deferred.promise;
		}
	}
});

appServ.factory('QRScanService', [function () {

  return {
    scan: function(success, fail) {
      cordova.plugins.barcodeScanner.scan(
        function (result) { success(result); },
        function (error) { fail(error); }
      );
    }
  };

}]);

appServ.factory('sessionData',function ($http,$rootScope) {
	return {
    setOn: function(data) {
			localStorage.setItem("userData.id", data.data.id);
			localStorage.setItem("userData.alamat", data.data.alamat);
			localStorage.setItem("userData.dealer_id", data.data.dealer_id);
			localStorage.setItem("userData.name", data.data.name);
			localStorage.setItem("userData.username", data.data.username);
			
    },
		clear:function(){
			localStorage.setItem("userData.id", '');
			localStorage.setItem("userData.alamat", '');
			localStorage.setItem("userData.dealer_id", '');
			localStorage.setItem("userData.name", '');
			localStorage.setItem("userData.username", '');
		}
  };

});

appServ.factory('userLogin',function($rootScope, $location,$http,sessionData,$q) {
  $rootScope.isLoggedIn = false;
	$rootScope.isLoggedIn = window.localStorage['isLoggedIn'];
	//localStorage.setItem("isLoggedIn", false);
	$rootScope.$on('user.logout', function() {
		
    $rootScope.isLoggedIn = false;
		localStorage.setItem("isLoggedIn", $rootScope.isLoggedIn);
		sessionData.clear();
   	$location.path('/app/login');
  });
	
		
  return {
    isLoggedIn: function() { return $rootScope.isLoggedIn; },
    login: function(user, pass) {
			var deferred = $q.defer();
			$http.get('http://106.186.19.105:8000/api/signIn?user='+user+'&pass='+pass).
			success(function(data, status, headers, config) {
				deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
    },
    logout: function() {
			$rootScope.$broadcast('user.logout');
    },
		validLogin: function(){
			var anu = window.localStorage['isLoggedIn'];
			
			if($rootScope.isLoggedIn==true||$rootScope.isLoggedIn=='true'){
				location.href ='#/app/home';
			}else{
				location.href ='#/app/login';
			}
			
		}
  }
});

appServ.factory('API',function($rootScope, $location,$http,$q,postData) {
	return {
		saveOutlet: function(params) {
			var deferred = $q.defer();
			$http.get('http://106.186.19.105:8000/api/saveOutlet'+params).
			success(function(data, status, headers, config) {
				deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},
		assignLoc: function(idOutlet,latLong){
			var deferred = $q.defer();
			$http.get('http://106.186.19.105:8000/api/assignLoc?idOutlet='+idOutlet+'&latLong='+latLong).
			success(function(data, status, headers, config) {
				deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},
		checkOutlet : function(outId){
			var deferred = $q.defer();
			$http.get('http://106.186.19.105:8000/api/checkOutlet?idOutlet='+outId).
			success(function(data, status, headers, config) {
				deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},
		sumStock : function(){
			var dlrID			=	window.localStorage['userData.dealer_id'];
			var deferred 	= $q.defer();
			$http.get('http://106.186.19.105:8000/api/sumStock?dealerId='+dlrID).
			success(function(data, status, headers, config) {
				deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},
		simList : function(ccid,limitRows){
			var dlrID			=	window.localStorage['userData.dealer_id'];
			var deferred 	= $q.defer();
			$http.get('http://106.186.19.105:8000/api/simList?dealerId='+dlrID+'&ccid='+ccid+'&limit='+limitRows).
			success(function(data, status, headers, config) {
				deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},
		voucherList : function(vsn,vType,limitRows){
			var dlrID			=	window.localStorage['userData.dealer_id'];
			var deferred 	= $q.defer();
			$http.get('http://106.186.19.105:8000/api/voucherList?dealerId='+dlrID+'&vsn='+vsn+'&type='+vType+'&limit='+limitRows).
			success(function(data, status, headers, config) {
				deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		},
		purchase : function(outletId,type,invId){
			var canvas			=	window.localStorage['userData.id'];
			var deferred 	= $q.defer();
			$http.get('http://106.186.19.105:8000/api/purchase?canvas='+canvas+'&outletId='+outletId+'&type='+type+'&invId='+invId).
			success(function(data, status, headers, config) {
				deferred.resolve(data);
			}).error(function(data, status, headers, config) {
				deferred.reject(status);
			});
			return deferred.promise;
		}
	}
});