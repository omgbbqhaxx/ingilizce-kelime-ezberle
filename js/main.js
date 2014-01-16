var app = angular.module('MyTutorialApp',[]);
app.controller("MainController", function($scope,$interval){
	$scope.Aralik = Math.floor(Math.random() * 22) + 0;
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
			code: 'ripe',
			decode : 'olgun'
		},
                {
			id: 5,
			code: 'funny',
			decode : 'komik'
		}, 
                {
			id: 6,
			code: 'patates',
			decode : 'potato'
		},
                {
			id: 7,
			code: 'kadın',
			decode : 'female'
		},
                {
			id: 8,
			code: 'also',
			decode : 'ayrıca'
		},
                {
			id: 9,
			code: 'gece',
			decode : 'night'
		},
                {
			id: 10,
			code: 'absolutely',
			decode : 'kesinlikle'
		},
                 {
			id: 11,
			code: 'avukat',
			decode : 'lawyer'
		},
                 {
			id: 12,
			code: 'karanlık',
			decode : 'dark'
		},
                {
			id: 13,
			code: 'long',
			decode : 'uzun'
		},
                {
			id: 14,
			code: 'çerçeve',
			decode : 'frame'
		},
                {
			id: 15,
			code: 'bulut',
			decode : 'cloud'
		},
                {
			id: 16,
			code: 'farmer',
			decode : 'çiftçi'
		},
                {
			id: 17,
			code: 'nose',
			decode : 'burun'
		},
                {
			id: 18,
			code: 'body',
			decode : 'vücut'
		},
                 {
			id: 19,
			code: 'beğenmek',
			decode : 'like'
		},
                 {
			id: 20,
			code: 'konuşmak',
			decode : 'speak'
		},        
                 {
			id: 21,
			code: 'böğürtlen',
			decode : 'blackberry'
		}
	];
	var stop;
	var cntr = 100;
	var dogrix = 0;
	var hatalix = 0;
	$scope.playcounter = cntr;
	$scope.hatali = hatalix;
	$scope.dogri = dogrix;
    $scope.nmbr = $scope.people[$scope.Aralik].decode.length;
    stop = $interval(function() {
	if (cntr == 0) {
		$interval.cancel(stop);
		alert("tebrikler " + dogrix + " kelime doğru bildiniz.");
		location.reload();
	}else {
        var x = $scope.people[$scope.Aralik];
	switch ($scope.google) {
		case x.decode: //------**DOĞRU BİLDİ****----------+!1
			$scope.Aralik = Math.floor(Math.random() * 22) + 0;
			$scope.google = "";
			$scope.result = "";
			cntr--;
			$scope.playcounter = cntr;
			dogrix++;
			$scope.dogri = dogrix;
			break;
		case "qqq": //-------***BİLEMEDİ****----------!1
			$scope.Aralik = Math.floor(Math.random() * 22) + 0;
			$scope.result = x.code +"<=>"+ x.decode;
			$scope.google = "";
			cntr--;
			$scope.playcounter = cntr;
			hatalix++;
			$scope.hatali = hatalix;
			break;
		case "www": //-------***İP UCU İSTEDİ****----------!0
			var xnxxl = $scope.people[$scope.Aralik].decode.length;
			$scope.result = $scope.people[$scope.Aralik].decode.charAt(0)+"***"+ $scope.people[$scope.Aralik].decode.charAt(xnxxl-1);
			$scope.google = "";
			break;
		default:
			if ($scope.google == undefined) {
				var KelimeninHarfSayisi = x.decode.length;
				$scope.nmbr = KelimeninHarfSayisi;
			}else {
				
				var GirilenHarfSayisi =$scope.google.length;
				var KelimeninHarfSayisi = x.decode.length;
				var SonucRakam = KelimeninHarfSayisi - GirilenHarfSayisi;
				$scope.nmbr = SonucRakam;
				
				
			}
			
		
			
	}
        
	}
    }, 100);
    
    
    
    
  
    
});