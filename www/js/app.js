// Ionic Starter App

// angular.module is a global place for creating, registering and retrieving Angular modules
// 'starter' is the name of this angular module example (also set in a <body> attribute in index.html)
// the 2nd parameter is an array of 'requires'
// 'starter.controllers' is found in controllers.js
angular.module('teritorymgmt', ['ionic', 'teritorymgmt.controllers','teritorymgmt.services'])

.run(function($ionicPlatform,$ionicPopup) {
  $ionicPlatform.ready(function() {
    // Hide the accessory bar by default (remove this to show the accessory bar above the keyboard
    // for form inputs)
    if (window.cordova && window.cordova.plugins.Keyboard) {
      cordova.plugins.Keyboard.hideKeyboardAccessoryBar(true);
    }
    if (window.StatusBar) {
      // org.apache.cordova.statusbar required
      StatusBar.styleDefault();
    }
  });
	
	$ionicPlatform.registerBackButtonAction(function () {
		if(true) { // your check here
				$ionicPopup.confirm({
					title: 'System warning',
					template: 'are you sure you want to exit?'
				}).then(function(res){
					if( res ){
						navigator.app.exitApp();
					}
				})
		}
	}, 100);
})

.config(function($stateProvider, $urlRouterProvider) {
	
  $stateProvider

  .state('app', {
    url: "/app",
    abstract: true,
    templateUrl: "templates/menu.html"
  })
	.state('app.home', {
		url: "/home",
		views: {
      'menuContent': {
        templateUrl: "templates/home.html"
      }
    }
	})
	.state('app.entry', {
		url: "/entry",
		views: {
      'menuContent': {
        templateUrl: "templates/entry_outlet.html"
      }
    }
	})
	.state('app.info', {
		url: "/info",
		views: {
      'menuContent': {
        templateUrl: "templates/info_outlet.html"
      }
    }
	})
	.state('app.stockopt', {
		url: "/stockopt",
		views: {
      'menuContent': {
        templateUrl: "templates/stock_option.html"
      }
    }
	})
	.state('app.stocklist', {
		url: "/stocklist",
		views: {
      'menuContent': {
        templateUrl: "templates/stock_list.html"
      }
    }
	})
	.state('app.maintenance', {
		url: "/maintenance",
		views: {
      'menuContent': {
        templateUrl: "templates/maintenance_outlet.html"
      }
    }
	})
	
	.state('app.login', {
		url: "/login",
		views: {
      'menuContent': {
        templateUrl: "templates/login.html"
      }
    }
	})
	;

  // if none of the above states are matched, use this as the fallback
  $urlRouterProvider.otherwise('/app/home');
});
