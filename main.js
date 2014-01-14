var app = angular.module('MyTutorialApp',[]);
app.controller("MainController", function($scope,$interval){
	$scope.Aralik = Math.floor(Math.random() * 4) + 0;
	$scope.mol = "Cevabı görmek için qqq yazın.";
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
		  }
		  
		  
	  ];
    $scope.nmbr = $scope.people[$scope.Aralik].decode.length;
    $interval(function() {
        var x = $scope.people[$scope.Aralik];
	switch ($scope.google) {
		case x.decode:
			$scope.Aralik = Math.floor(Math.random() * 4) + 0;
			$scope.google = "";
			break;
		case "qqq":
			$scope.result = x.code +"<=>"+ x.decode;
			$scope.Aralik = Math.floor(Math.random() * 4) + 0;
			$scope.google = "";
			break;
		default:
			var GirilenHarfSayisi =$scope.google.length;
			var KelimeninHarfSayisi = x.decode.length;
			var SonucRakam = KelimeninHarfSayisi - GirilenHarfSayisi;
			$scope.nmbr = SonucRakam;
		
			
	}
        
     
    }, 300);
    
    
    
    
  
    
});