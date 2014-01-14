var app = angular.module('MyTutorialApp',[]);
app.controller("MainController", function($scope,$interval){
	$scope.Aralik = Math.floor(Math.random() * 9) + 0;
	$scope.mol = "Cevabı görmek için qqq yazın. ip ucu içinse www";
	$scope.people = [
		  {
			  id: 0,
			  code: 'merhaba',
			  decode : 'hello'
			  
		  },
		  {
			  id: 1,
			  code: 'görmek',
			  decode : 'see'
		  },
		  {
			  id: 2,
			  code: 'asmak',
			  decode : 'hang'
		  },
		  {
			  id: 3,
			  code: 'detay',
			  decode : 'detail'
		  },
		  {
			  id: 4,
			  code: 'uyumak',
			  decode : 'sleep'
		  },
		  {
			  id: 5,
			  code: 'seyehat',
			  decode : 'travel'
		  },
		  {
			  id: 6,
			  code: 'bakmak',
			  decode : 'look'
		  },
		  {
			  id: 7,
			  code: 'çağırmak',
			  decode : 'call'
		  },
		  {
			  id: 8,
			  code: 'sevmek',
			  decode : 'love'
		  }
		  
		  
	  ];
    $scope.nmbr = $scope.people[$scope.Aralik].decode.length;
    $interval(function() {
        var x = $scope.people[$scope.Aralik];
	switch ($scope.google) {
		case x.decode:
			$scope.Aralik = Math.floor(Math.random() * 9) + 0;
			$scope.google = "";
			$scope.result = "";
			break;
		case "qqq":
			$scope.result = x.code +"<=>"+ x.decode;
			$scope.Aralik = Math.floor(Math.random() * 9) + 0;
			$scope.google = "";
			break;
		case "www":
			var xnxxl = $scope.people[$scope.Aralik].decode.length;
			$scope.result = $scope.people[$scope.Aralik].decode.charAt(0)+"***"+ $scope.people[$scope.Aralik].decode.charAt(xnxxl-1);
			
		default:
			var GirilenHarfSayisi =$scope.google.length;
			var KelimeninHarfSayisi = x.decode.length;
			var SonucRakam = KelimeninHarfSayisi - GirilenHarfSayisi;
			$scope.nmbr = SonucRakam;
		
			
	}
        
     
    }, 100);
    
    
    
    
  
    
});