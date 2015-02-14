var app = angular.module('teritorymgmt.controllers', []);
app.controller('mainCtrl', function($scope,userLogin) {
  userLogin.validLogin();
});
app.controller('menuCtrl', function($scope, userLogin) {
  
	userLogin.validLogin();
	
	$scope.actLogOut = function(){
		userLogin.logout();
	}
});

app.controller('homeCtrl', function($scope,$rootScope,$ionicLoading,userLogin,API) {
	$rootScope.hideBack = false;
  userLogin.validLogin();
	
	$ionicLoading.show({template: 'Loading...'});
	API.sumStock().then(function(data){
		$ionicLoading.hide();
		$scope.dataStock = data.data;
	});
});

app.controller('entryCtrl', function($scope,$rootScope,$ionicPopup,$ionicLoading,$location,API,geoLoc) {
	$scope.txtNm 		= "";
	$scope.txtType	= "";
	$scope.txtSize 	= "";
	$scope.txtAddr 	= "";
	$scope.txtPic 	= "";
	$scope.txtPhone = "";
	$scope.txtPos 	= "";
	
  $scope.actEntry = function(){
		var txtUsrNm= encodeURIComponent($scope.txtUsrNm);
		var txtNm 	= encodeURIComponent($scope.txtNm);
		var txtType = $scope.txtType;
		var txtSize	= $scope.txtSize;
		var txtAddr	= encodeURIComponent($scope.txtAddr);
		var txtPic	= encodeURIComponent($scope.txtPic);
		var txtPhone= encodeURIComponent($scope.txtPhone);
		var txtPos	= encodeURIComponent($scope.txtPos);
		var dealerId= encodeURIComponent(window.localStorage['userData.dealer_id']);
		
		
		if(txtNm==''||txtType==''||txtSize==''||txtAddr==''||txtPic==''||txtPhone==''||txtPos==''||txtUsrNm==''){
			$ionicPopup.alert({
				title: 'Warning!',
				template: "Please check input form!"
			});
		}else{
			jParams = "?txtNm="+txtNm+"&txtType="+txtType+"&txtSize="+txtSize+"&txtAddr="+txtAddr+"&txtPic="+txtPic+"&txtPhone="+txtPhone+"&txtPos="+txtPos+"&dealerId="+dealerId+"&txtUsrNm="+txtUsrNm;
			$ionicLoading.show({
				template: 'Saving...'
			});
			API.saveOutlet(jParams).then(function(data){
				$ionicLoading.hide();
				if(data.status){
					$rootScope.outletInfo = data.data;
					assignLocEnt(data.data.id);
				}else{
					$ionicPopup.alert({
						title: 'Warning!',
						template: data.message
					});
				}
			});
			
		}
		
	}
	
	function assignLocEnt(idOutlet){
		var watchID	= navigator.geolocation.watchPosition(geoLoc.onSuccess, geoLoc.onError,{ enableHighAccuracy: true });
		$ionicLoading.show({
			template: 'Assign location...'
		});
		geoLoc.getCurrent().then(function(data){
			var curLat 	= data.coords.latitude;
			var curLong = data.coords.longitude;
			
			var latLong	= curLat+","+curLong;
			//console.log(latLong);
			API.assignLoc(idOutlet,latLong).then(function(data){
				navigator.geolocation.clearWatch(watchID);
				$ionicLoading.hide();
				if(data.status){
					$rootScope.outletInfo.location = data.data;
					$location.path('/app/info');
				}else{
					$ionicPopup.alert({
						title: 'Warning!',
						template: data.message
					});
				}
			});
		})
	}
});

app.controller('infoCtrl', function($scope,$rootScope,$location) {
  var outletDat	= $rootScope.outletInfo;
	
	$scope.latLong	= outletDat.location;
	$scope.name			= outletDat.outlet;
	$scope.address	= outletDat.alamat;
	$scope.pic			= outletDat.pic;
	$scope.phone		= outletDat.phone;
	
	$scope.actEntry	= function(){
		$location.path('/app/stockopt');
	}
});

app.controller('stockOptCtrl', function($scope, $rootScope,$location) {
	$scope.vChoice = '';
	$scope.actDetail	= function(){
		$rootScope.stockOpt =	$scope.vChoice;
		$location.path('/app/stocklist');
	}
});

app.controller('stockListCtrl', function($scope, $rootScope,$ionicLoading,$ionicPopup,API) {
	var type 	= $rootScope.stockOpt;
	var limitNow	= 10;
	function load(vSrc,typeSrc,limitRow){
		if(typeSrc=='SIM'){
			loadSim(vSrc,limitRow);
		}else{
			loadVoucher(vSrc,typeSrc,limitRow);
		}
	}
	
	function loadSim(ccid,limitRows){
		$ionicLoading.show({template: 'Loading...'});
		API.simList(ccid,limitRows).then(function(data){
			$ionicLoading.hide();
			$scope.dataList	= data.data;
		});
	}
	
	function loadVoucher(vsn,vType,limitRows){
		$ionicLoading.show({template: 'Loading...'});
		API.voucherList(vsn,vType,limitRows).then(function(data){
			$ionicLoading.hide();
			$scope.dataList	= data.data;
		});
	}
	
	load('',type,limitNow);
	$scope.actSearch = function(){
		limitNow	= 10;
		load($scope.inpSearch,type,limitNow);
	}
	
	$scope.actLoadMore = function(){
		limitNow	= limitNow + 10;
		load($scope.inpSearch,type,limitNow);
	}
	
	function setPurchase(invId){
		var outletId	= $rootScope.outletInfo.id;
		$ionicLoading.show({template: 'Saving...'});
		API.purchase(outletId,$rootScope.stockOpt,invId).then(function(data){
			$ionicLoading.hide();
			load('',type,10);
			$ionicPopup.alert({
				title: 'Warning!',
				template: data.message
			});
		})
	}
	
	$scope.actAlloc = function(inventory){
		var confirmPopup = $ionicPopup.confirm({
		 	title: 'Warning',
		 	template: 'Add PO to '+$rootScope.outletInfo.outlet+' ?'
		});

	 	confirmPopup.then(function(res) {
		 if(res) {
			 setPurchase(inventory);
		 }
		});
		
	}
});

app.controller('maintenanceCtrl', function($scope, $ionicPopup,$ionicModal,$rootScope,$location,$ionicLoading,API,QRScanService) {
  $scope.optMain	= '';
	
	$ionicModal.fromTemplateUrl('entryId.html', function($ionicModal) {
		$scope.modal = $ionicModal;
	}, {
		scope: $scope,
		animation: 'slide-in-up'
	});
	
  $scope.actSubmit	= function(){
		if($scope.optMain==''){
			$ionicPopup.alert({
				title: 'Warning!',
				template: 'Please choose an option!'
			});
		}
		
		if($scope.optMain=='scan'){
			scanQrCode();
		}
		
		if($scope.optMain=='entry'){
			$scope.modal.show();
		}

	}
	
	$scope.actCheck = function(outId){
		$ionicLoading.show({
			template: 'Checking...'
		});
		API.checkOutlet(outId).then(function(data){
			$ionicLoading.hide();
			if(data.status){
				$rootScope.outletInfo = data.data
				$scope.modal.hide();
				$location.path('/app/info');
			}else{
				$ionicPopup.alert({
					title: 'Warning!',
					template: data.message
				});
			}
		});
	}
	
	function scanQrCode(){
		QRScanService.scan(function(result) {
			if (result.cancelled) {
				$ionicLoading.hide();
				$ionicModal.fromTemplate('').show().then(function() {
					$ionicPopup.alert({
						title: 'QR Scan Cancelled',
						template: 'You cancelled it!'
					});
				});
			}else{
				var outletId		= result.text;
				$scope.actCheck(outletId);
			}
		});
	}
});

app.controller('loginCtrl', function($scope,$rootScope,$location,$ionicPopup,$ionicLoading,sessionData, userLogin) {
  userLogin.validLogin();
	$scope.pPass = '';
	$scope.pUser = '';
	$scope.version = '';
	$scope.actLogin = function() {
		var pPass	= $scope.pPass;
		var pUser	= $scope.pUser;
		$ionicLoading.show({
			template: 'Sign in...'
		});
		userLogin.login(pUser,pPass).then(function(data){
			$ionicLoading.hide();
			if(data.status){
				$rootScope.isLoggedIn = true;
				localStorage.setItem("isLoggedIn", true);
				window.location.replace('#/app/home');
				sessionData.setOn(data);
			}else{
				$ionicPopup.alert({
					title: 'Warning!',
					template: data.message
				});
				$rootScope.isLoggedIn = false;
				localStorage.setItem("isLoggedIn", false);
				sessionData.clear();
				$location.path('/app/login');
			}
		});
	}
});