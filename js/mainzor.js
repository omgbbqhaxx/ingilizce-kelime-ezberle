var app = angular.module('MyTutorialApp',[]);
var totalword = 82;
app.controller("MainController", function($scope,$interval){
	$scope.Aralik = Math.floor(Math.random() * totalword) + 0;
	    $scope.people = [
			{ id: 0, code: 'aberration', decode: 'sapma' },
			{ id: 1, code: 'convoluted', decode: 'karmaşık' },
			{ id: 2, code: 'disparate', decode: 'farklı' },
			{ id: 3, code: 'ephemeral', decode: 'geçici' },
			{ id: 4, code: 'grandiloquence', decode: 'büyük sözler' },
			{ id: 5, code: 'hubris', decode: 'kibir' },
			{ id: 6, code: 'incontrovertible', decode: 'çürütülemez' },
			{ id: 7, code: 'juxtapose', decode: 'yan yana koymak' },
			{ id: 8, code: 'kaleidoscope', decode: 'renk cümbüşü' },
			{ id: 9, code: 'labyrinth', decode: 'labirent' },
			{ id: 10, code: 'malfeasance', decode: 'kötüye kullanım' },
			{ id: 11, code: 'nefarious', decode: 'kötücül' },
			{ id: 12, code: 'obfuscate', decode: 'karartmak' },
			{ id: 13, code: 'paradigm', decode: 'örnek' },
			{ id: 14, code: 'quixotic', decode: 'hayalperest' },
			{ id: 15, code: 'recalcitrant', decode: 'inatçı' },
			{ id: 16, code: 'sycophant', decode: 'yaltakçı' },
			{ id: 17, code: 'trepidation', decode: 'ürküntü' },
			{ id: 18, code: 'ubiquitous', decode: 'her yerde bulunan' },
			{ id: 19, code: 'vociferous', decode: 'gürültücü' },
			{ id: 20, code: 'wanton', decode: 'kayıtsız' },
			{ id: 21, code: 'xenophobia', decode: 'yabancı düşmanlığı' },
			{ id: 22, code: 'yoke', decode: 'boyunduruk' },
			{ id: 23, code: 'zealot', decode: 'fanatik' },
			{ id: 24, code: 'austerity', decode: 'katı tasarruf' },
			{ id: 25, code: 'bellicose', decode: 'savaşçı' },
			{ id: 26, code: 'cacophony', decode: 'kargaşa' },
			{ id: 27, code: 'deleterious', decode: 'zararlı' },
			{ id: 28, code: 'enervate', decode: 'güçsüzleştirmek' },
			{ id: 29, code: 'fastidious', decode: 'titiz' },
			{ id: 30, code: 'gregarious', decode: 'sosyal' },
			{ id: 31, code: 'harangue', decode: 'azarlama' },
			{ id: 32, code: 'iconoclast', decode: 'ikonoklast' },
			{ id: 33, code: 'jingoism', decode: 'şovenizm' },
			{ id: 34, code: 'kinetic', decode: 'hareketli' },
			{ id: 35, code: 'loquacious', decode: 'geveze' },
			{ id: 36, code: 'mendacious', decode: 'yalancı' },
			{ id: 37, code: 'nostalgia', decode: 'özlem' },
			{ id: 38, code: 'obdurate', decode: 'inatçı' },
			{ id: 39, code: 'pulchritude', decode: 'güzellik' },
			{ id: 40, code: 'quandary', decode: 'ikilem' },
			{ id: 41, code: 'rancor', decode: 'kin' },
			{ id: 42, code: 'ubiquity', decode: 'her yerde bulunma' },
{ id: 43, code: 'venerable', decode: 'saygıdeğer' },
{ id: 44, code: 'wistful', decode: 'hüzünlü' },
{ id: 45, code: 'xenophile', decode: 'yabancıları seven' },
{ id: 46, code: 'yarn', decode: 'uzun ve ilginç hikaye' },
{ id: 47, code: 'zephyr', decode: 'hafif rüzgar' },
{ id: 48, code: 'abrogate', decode: 'feshetmek' },
{ id: 49, code: 'blandishment', decode: 'tatlı söz' },
{ id: 50, code: 'capitulate', decode: 'teslim olmak' },
{ id: 51, code: 'decimate', decode: 'büyük zarar vermek' },
{ id: 52, code: 'egregious', decode: 'kabul edilemez derecede kötü' },
{ id: 53, code: 'facade', decode: 'cephe' },
{ id: 54, code: 'garrulous', decode: 'geveze' },
{ id: 55, code: 'hegemony', decode: 'üstünlük' },
{ id: 56, code: 'idiosyncrasy', decode: 'kişisel özellik' },
{ id: 57, code: 'jubilant', decode: 'coşkulu' },
{ id: 58, code: 'knell', decode: 'cenaze çanı' },
{ id: 59, code: 'lucid', decode: 'açık' },
{ id: 60, code: 'magnanimous', decode: 'büyük yürekli' },
{ id: 61, code: 'neologism', decode: 'yeni kelime' },
{ id: 62, code: 'obsequious', decode: 'yaltakçı' },
{ id: 63, code: 'pandemonium', decode: 'kargaşa' },
{ id: 64, code: 'quagmire', decode: 'çıkmaz' },
{ id: 65, code: 'reciprocity', decode: 'karşılıklılık' },
{ id: 66, code: 'sacrosanct', decode: 'çok kutsal' },
{ id: 67, code: 'taciturn', decode: 'sessiz' },
{ id: 68, code: 'unfathomable', decode: 'anlaşılamaz' },
{ id: 69, code: 'vindicate', decode: 'aklamak' },
{ id: 70, code: 'wily', decode: 'kurnaz' },
{ id: 71, code: 'xeric', decode: 'kuru' },
{ id: 72, code: 'yearn', decode: 'özlemek' },
{ id: 73, code: 'zenith', decode: 'zirve' },
{ id: 74, code: 'aloof', decode: 'soğuk' },
{ id: 75, code: 'bombastic', decode: 'abartılı' },
{ id: 76, code: 'cognizant', decode: 'farkında' },
{ id: 77, code: 'dichotomy', decode: 'ikilik' },
{ id: 78, code: 'ephemeron', decode: 'günübirlik' },
{ id: 79, code: 'flippant', decode: 'saygısız' },
{ id: 80, code: 'grandiose', decode: 'görkemli' },
{ id: 81, code: 'histrionic', decode: 'abartılı' },
{ id: 82, code: 'iconoclastic', decode: 'yıkıcı' }

 

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

		if ($scope.google) {
			// $scope.google tanımlı ise bu blok çalışacak
			var lowerCaseGoogle = $scope.google.toLowerCase();
			// Diğer işlemler
		
    var x = $scope.people[$scope.Aralik];
	switch ($scope.google.toLowerCase()) {
		case x.decode.toLowerCase(): //------**DOĞRU BİLDİ****----------+!1
			$scope.Aralik = Math.floor(Math.random() * totalword) + 0;
			$scope.google = "";
			$scope.result = "";
			cntr--;
			$scope.playcounter = cntr;
			dogrix++;
			$scope.dogri = dogrix;
			break;
		case "qqq": //-------***BİLEMEDİ****----------!1
			$scope.Aralik = Math.floor(Math.random() * totalword) + 0;
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
	}}  


        
	}
    }, 100);
    
    
    
    
  
    
});