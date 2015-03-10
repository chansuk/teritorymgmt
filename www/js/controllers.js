var app = angular.module('teritorymgmt.controllers', []);
app.controller('mainCtrl', function($scope,userLogin,$ionicPlatform,$ionicLoading,$ionicPopup,$rootScope,API) {
  userLogin.validLogin();
	$rootScope.lastAppVersion = '';
	$ionicPlatform.ready(function() {
    cordova.getAppVersion(function(version) {
			$rootScope.lastAppVersion = 'v'+version;
			getLastVersion(version);
		});
	});
	
	function getLastVersion(versionCode){
		API.getVersionCode().then(function(data){
			if(versionCode!=data.version_name){
				var confirmPopup = $ionicPopup.confirm({
					title: 'Warning',
					template: 'Please download for a new version '+data.version_name
				});

				confirmPopup.then(function(res) {
				 if(res) {
					 window.open('http://128.199.118.199:8000/TeritoryManagement.apk', '_system');
					 //download();
				 }
				});
			}
		});
	}

	function download(){
		
		$ionicLoading.show({template: 'Downloading...'});
    var fileTransfer = new FileTransfer();
		fileTransfer.download(
    "http://developer.android.com/assets/images/home/ics-android.png",
    "file://mnt/sdcard/Download/ics-android.png",
    function(entry) {
        alert("download complete: " + entry.toURL());
    },
    function(error) {
        alert("download error source " + error.source);
        alert("download error target " + error.target);
        alert("upload error code" + error.code);
    });
	}
	
	/*function download(){
		var fileTransfer = new FileTransfer();
		var fileURL	= 'file:///mnt/sdcard/Download/';
		var uri = encodeURI("http://128.199.118.199:8000/TeritoryManagement.apk");
		$ionicLoading.show({template: 'Downloading...'});
		fileTransfer.download(
				uri,
				fileURL,
				function(entry) {
					$ionicLoading.hide();
						console.log("download complete: " + entry.toURL());
					alert(entry.toURL());
				},
				function(error) {
					$ionicLoading.hide();
					alert(error.source);
						console.log("download error source " + error.source);
						console.log("download error target " + error.target);
						console.log("upload error code" + error.code);
				}
		);
		
	}*/
});

app.controller('menuCtrl', function($scope, $location,$state,$ionicLoading,$ionicSlideBoxDelegate,$interval,$timeout,$rootScope,API,userLogin) {
  
	userLogin.validLogin();
	
	$scope.actLogOut = function(){
		userLogin.logout();
	}
	
	$scope.openStock = function(){
		$location.path('/stockdealer');
	}
	
	$scope.openMaintenance= function(){
		$location.path('/maintenance');
	}
	
	$scope.openNew = function(){
		$location.path('/entry');
	}
	
	$ionicSlideBoxDelegate.update();

	$ionicLoading.show({template: 'Loading...'});
	API.getNews().then(function(data){
		$ionicLoading.hide();
		$scope.newsList = data;
		$ionicSlideBoxDelegate.update();
		$interval(function() {
			var count = $ionicSlideBoxDelegate.slidesCount();
			var chgIdx= count-1;
			
			if($ionicSlideBoxDelegate.currentIndex()==chgIdx){
				$scope.slideIndex = 0;
				$ionicSlideBoxDelegate.update();
				$timeout(function(){ 
					$ionicSlideBoxDelegate.slide($scope.slideIndex);
					$ionicSlideBoxDelegate.start();
				},3000);
			}
		}, 3000);
	});
	
	$scope.menuVersion = $rootScope.lastAppVersion;
});

app.controller('stockDealerCtrl', function($scope,$rootScope,$ionicLoading,$window,$state,userLogin,camera,API){
	$scope.backView = function(){
		$state.go('menu');
	}
	
	function load(){
		$ionicLoading.show({template: 'Loading...'});
		API.sumStock().then(function(data){
			$ionicLoading.hide();
			$scope.dataStock = data.data;
		});
	}
	
	load();
	
});

app.controller('homeCtrl', function($scope,$rootScope,$ionicLoading,$window,userLogin,API) {
	$rootScope.hideBack = false;
  userLogin.validLogin();
	//$window.location.reload(true);
	function load(){
		$ionicLoading.show({template: 'Loading...'});
		API.sumStock().then(function(data){
			$ionicLoading.hide();
			$scope.dataStock = data.data;
		});
	}
	
	load();
});

app.controller('entryAllCtrl', function($scope,$state) {
	$scope.backView = function(){
		$state.go('menu');
	}
});

app.controller('entryCtrl', function($scope,$rootScope,$ionicPopup,$ionicLoading,$location,$state,$timeout,camera,API,geoLoc) {
	$scope.txtNm 		= "";
	$scope.txtType	= "";
	$scope.txtSize 	= "";
	$scope.txtAddr 	= "";
	$scope.txtPic 	= "";
	$scope.txtPhone = "";
	$scope.txtPos 	= "";
	$scope.txtPass 	= "";
	$scope.urlImg 	= "";
	$scope.btnImg 	= true;
	$rootScope.outletInfo	= {};
	
  $scope.actEntry = function(){
		var txtUsrNm= encodeURIComponent($scope.txtUsrNm);
		var txtPass	= encodeURIComponent($scope.txtPass);
		var txtNm 	= encodeURIComponent($scope.txtNm);
		var txtType = $scope.txtType;
		var txtSize	= $scope.txtSize;
		var txtAddr	= encodeURIComponent($scope.txtAddr);
		var txtPic	= encodeURIComponent($scope.txtPic);
		var txtPhone= encodeURIComponent($scope.txtPhone);
		var txtPos	= encodeURIComponent($scope.txtPos);
		var dealerId= encodeURIComponent(window.localStorage['userData.dealer_id']);
		
		
		if(txtNm==''||txtType==''||txtSize==''||txtAddr==''||txtPic==''||txtPhone==''||txtPos==''||txtUsrNm==''||txtPass==''){
			var popAlert = $ionicPopup.alert({
				title: 'Warning!',
				template: "Please check input form!"
			});
			
			$timeout(function() {
				 popAlert.close();
			}, 3000);
		}else{
			jParams = "?txtNm="+txtNm+"&txtType="+txtType+"&txtSize="+txtSize+"&txtAddr="+txtAddr+"&txtPic="+txtPic+"&txtPhone="+txtPhone+"&txtPos="+txtPos+"&dealerId="+dealerId+"&txtUsrNm="+txtUsrNm+"&txtPass="+txtPass;
			$ionicLoading.show({
				template: 'Saving...'
			});
			API.saveOutlet(jParams).then(function(data){
				$ionicLoading.hide();
				if(data.status){
					$rootScope.outletInfo = data.data;
					assignLocEnt(data.data.id);
				}else{
					var popSave = $ionicPopup.alert({
						title: 'Warning!',
						template: data.message
					});
					
					$timeout(function() {
						 popSave.close();
					}, 3000);
				}
			});
			
		}
		
	}
	
	$scope.getPhoto = function() {
		camera.take().then(function(data){
			$scope.urlImg = data;
			$scope.btnImg = false;
		});
	};
	
	function onUploadSuccess(r) {
		$ionicLoading.hide();
		var dataOut	= angular.fromJson(r.response);
		$rootScope.outletInfo.urlimg = 'http://128.199.118.199:8000/upload/outlet/'+dataOut.data;
		$location.path('/info');
	}

	function onUploadFail(error) {
		$ionicLoading.hide();
		var popUpload = $ionicPopup.alert({
			title: 'Warning!',
			template: "upload error source " + error.source
		});

		$timeout(function() {
			 popUpload.close();
		}, 3000);
		$location.path('/info');
	}
	
	function uploadImg(idoutlet) {   
		var myImg 	= $scope.urlImg;
		var options = new FileUploadOptions();
		options.fileKey			= "post";
		options.chunkedMode = false;
		var params 			= {};
		params.idoutlet = idoutlet;
		options.params 	= params;
		var ft = new FileTransfer();
		$ionicLoading.show({
			template: 'Uploading image...'
		});
		ft.upload(myImg, encodeURI("http://128.199.118.199:8000/api/uploadImg"), onUploadSuccess, onUploadFail, options);
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
					if($scope.urlImg==""){
						$rootScope.outletInfo.urlimg = '';
						$location.path('/info');
					}else{
						uploadImg(idOutlet);
					}
				}else{
					var popAssign = $ionicPopup.alert({
						title: 'Warning!',
						template: data.message
					});
					
					$timeout(function() {
						 popAssign.close();
					}, 3000);
				}
			});
		})
	}
});

app.controller('infoCtrl', function($scope,$rootScope,$location,$ionicHistory) {
	function pad(n, width, z) {
		z = z || '0';
		n = n + '';
		return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
	}
	
	var outletDat	= $rootScope.outletInfo;
	
	$scope.latLong	= outletDat.location;
	$scope.name			= outletDat.outlet;
	$scope.address	= outletDat.alamat;
	$scope.pic			= outletDat.pic;
	$scope.phone		= outletDat.phone;
	$scope.urlImg		= outletDat.urlimg;
		
	var idLogin			= outletDat.login_id;
	idLogin			= pad(idLogin, 5); 
	
	$scope.idOutlet	= outletDat.dealer_id+idLogin;
	$scope.actEntry	= function(){
		$location.path('/stockopt');
	}
	//console.log($scope.urlImg);
	if($scope.urlImg == ''){
		$scope.imgShow = false;
	}else{
		$scope.imgShow = true;
	}
	
});

app.controller('stockOptAllCtrl', function($scope, $state) {
	$scope.backView = function(){
		$state.go('info');
	}
	
});

app.controller('stockOptCtrl', function($scope, $rootScope,$ionicPopup,$location,$timeout,$state) {
	$scope.isSim 	= false;
	$scope.is50 	= false;
	$scope.is20 	= false;
	$scope.is10 	= false;
	$scope.is5 		= false;
	$rootScope.stockOpt = {};
	
	$scope.actDetail	= function(){
		var select		= false;
		$rootScope.stockOpt.sim =	$scope.isSim;
		$rootScope.stockOpt.v50 =	$scope.is50;
		$rootScope.stockOpt.v20 =	$scope.is20;
		$rootScope.stockOpt.v10 =	$scope.is10;
		$rootScope.stockOpt.v5 	=	$scope.is5;
		
		if($rootScope.stockOpt.sim){
				select		= true;
		}

		if($rootScope.stockOpt.v50){
			select		= true;
		}

		if($rootScope.stockOpt.v20){
			select		= true;
		}

		if($rootScope.stockOpt.v10){
			select		= true;
		}

		if($rootScope.stockOpt.v5){
			select		= true;
		}
		
		if(select){
			$location.path('/stocklist');
		}else{
			var popSelect = $ionicPopup.alert({
				title: 'Warning!',
				template: "Please select first!"
			});
			
			$timeout(function() {
				 popSelect.close();
			}, 3000);
		}
		
	}
	
	
});

app.controller('stockListCtrl', function($scope, $rootScope,$ionicLoading,$ionicPopup,$state,$timeout,API) {
	
	$scope.backView = function(){
		$state.go('stockopt');
	}
	
	var limitNow	= 10;
	
	var type	= '';
	if($rootScope.stockOpt.sim){
		type	= type+'sim;';
	}
	
	if($rootScope.stockOpt.v50){
		type	= type+'50;';
	}
	
	if($rootScope.stockOpt.v20){
		type	= type+'20;';
	}
	
	if($rootScope.stockOpt.v10){
		type	= type+'10;';
	}
	
	if($rootScope.stockOpt.v5){
		type	= type+'5;';
	}
	
	$scope.inpSearch = '';
	
	function load(codeId,type,limitRows){
		$ionicLoading.show({template: 'Loading...'});
		API.stockList(codeId,type,limitRows).then(function(data){
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
	
	$scope.actAlloc = function(invId,typeStock){
		var confirmPopup = $ionicPopup.confirm({
		 	title: 'Warning',
		 	template: 'Add PO to '+$rootScope.outletInfo.outlet+' ?'
		});

	 	confirmPopup.then(function(res) {
		 if(res) {
			 setPurchase(invId,typeStock);
		 }
		});
		
	}
	
	function setPurchase(invId,typeStock){
		var outletId	= $rootScope.outletInfo.id;
		$ionicLoading.show({template: 'Saving...'});
		API.purchase(outletId,typeStock,invId).then(function(data){
			$ionicLoading.hide();
			load('',type,10);
			var popPurc = $ionicPopup.alert({
				title: 'Warning!',
				template: data.message
			});
			
			$timeout(function() {
				 popPurc.close();
			}, 3000);
		})
	}
});

app.controller('maintenanceAllCtrl', function($scope, $state) {
	$scope.backView = function(){
		$state.go('menu');
	}
})
app.controller('maintenanceCtrl', function($scope, $ionicPopup,$ionicModal,$rootScope,$location,$ionicLoading,$timeout,API,QRScanService) {
  $scope.optMain	= '';
	
	$ionicModal.fromTemplateUrl('entryId.html', function($ionicModal) {
		$scope.modal = $ionicModal;
	}, {
		scope: $scope,
		animation: 'slide-in-up'
	});
	
  $scope.actSubmit	= function(){
		if($scope.optMain==''){
			var popMain = $ionicPopup.alert({
				title: 'Warning!',
				template: 'Please choose an option!'
			});
			$timeout(function() {
				 popMain.close();
			}, 3000);
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
				$rootScope.outletInfo = data.data;
				
				if(data.data.urlimg==null){
					$rootScope.outletInfo.urlimg = '';
				}else{
					$rootScope.outletInfo.urlimg = 'http://128.199.118.199:8000/upload/outlet/'+$rootScope.outletInfo.urlimg;
				}
				
				$scope.modal.hide();
				$location.path('/info');
			}else{
				var popCheck = $ionicPopup.alert({
					title: 'Warning!',
					template: data.message
				});
				
				$timeout(function() {
					 popCheck.close();
				}, 3000);
			}
		});
	}
	
	function scanQrCode(){
		QRScanService.scan(function(result) {
			if (result.cancelled) {
				$ionicLoading.hide();
				$ionicModal.fromTemplate('').show().then(function() {
					var popCancel = $ionicPopup.alert({
						title: 'QR Scan Cancelled',
						template: 'You cancelled it!'
					});
					
					$timeout(function() {
						 popCancel.close();
					}, 3000);
				});
			}else{
				var outletId		= result.text;
				$scope.actCheck(outletId);
			}
		});
	}
});

app.controller('loginCtrl', function($scope,$rootScope,$location,$ionicPopup,$ionicLoading,$timeout,sessionData, userLogin) {
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
				window.location.replace('#/menu');
				sessionData.setOn(data);
			}else{
				var popLogin = $ionicPopup.alert({
					title: 'Warning!',
					template: data.message
				});
				
				$timeout(function() {
					 popLogin.close();
				}, 3000);
				
				$rootScope.isLoggedIn = false;
				localStorage.setItem("isLoggedIn", false);
				sessionData.clear();
				$location.path('/login');
			}
		});
	}
});