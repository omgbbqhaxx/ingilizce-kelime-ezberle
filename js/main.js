var app = angular.module('MyTutorialApp',[]);
app.controller("MainController", function($scope,$interval){
	$scope.Aralik = Math.floor(Math.random() * 22) + 0;
	    $scope.people = [
				{ id: 0, code: 'number', decode: 'numara' },
				{ id: 1, code: 'week', decode: 'hafta' },
				{ id: 2, code: 'place', decode: 'yer' },
				{ id: 3, code: 'month', decode: 'ay' },
				{ id: 4, code: 'system', decode: 'sistem' },
				{ id: 5, code: 'part', decode: 'parça' },
				{ id: 6, code: 'life', decode: 'hayat' },
				{ id: 7, code: 'fact', decode: 'gerçek' },
				{ id: 8, code: 'issue', decode: 'mesele' },
				{ id: 9, code: 'family', decode: 'aile' },
				{ id: 10, code: 'group', decode: 'grup' },
				{ id: 11, code: 'work', decode: 'iş' },
				{ id: 12, code: 'story', decode: 'hikaye' },
				{ id: 13, code: 'night', decode: 'gece' },
				{ id: 14, code: 'child', decode: 'çocuk' },
				{ id: 15, code: 'area', decode: 'alan' },
				{ id: 16, code: 'woman', decode: 'kadın' },
				{ id: 17, code: 'time', decode: 'zaman' },
				{ id: 18, code: 'student', decode: 'öğrenci' },
				{ id: 19, code: 'world', decode: 'dünya' },
				{ id: 20, code: 'home', decode: 'ev' },
				{ id: 21, code: 'room', decode: 'oda' },
				{ id: 22, code: 'right', decode: 'hak' },
				{ id: 23, code: 'word', decode: 'kelime' },
				{ id: 24, code: 'thing', decode: 'şey' },
				{ id: 25, code: 'lot', decode: 'çok' },
				{ id: 26, code: 'program', decode: 'program' },
				{ id: 27, code: 'mother', decode: 'anne' },
				{ id: 28, code: 'question', decode: 'soru' },
				{ id: 29, code: 'money', decode: 'para' },
				{ id: 30, code: 'people', decode: 'insanlar' },
				{ id: 31, code: 'man', decode: 'adam' },
				{ id: 32, code: 'government', decode: 'hükümet' },
				{ id: 33, code: 'hand', decode: 'el' },
				{ id: 34, code: 'eye', decode: 'göz' },
				{ id: 35, code: 'state', decode: 'durum' },
				{ id: 36, code: 'book', decode: 'kitap' },
				{ id: 37, code: 'water', decode: 'su' },
				{ id: 38, code: 'business', decode: 'işletme' },
				{ id: 39, code: 'problem', decode: 'problem' },
				{ id: 40, code: 'country', decode: 'ülke' },
				{ id: 41, code: 'study', decode: 'çalışma' },
				{ id: 42, code: 'company', decode: 'şirket' },
				{ id: 43, code: 'point', decode: 'nokta' },
				{ id: 44, code: 'school', decode: 'okul' },
				{ id: 45, code: 'job', decode: 'iş' },
				{ id: 46, code: 'day', decode: 'gün' },
				{ id: 47, code: 'case', decode: 'vaka' },
				{ id: 48, code: 'year', decode: 'yıl' },
				{ id: 49, code: 'way', decode: 'yol' },
				{ id: 50, code: 'love', decode: 'aşk' },
				{ id: 51, code: 'information', decode: 'bilgi' },
				{ id: 52, code: 'health', decode: 'sağlık' },
				{ id: 53, code: 'science', decode: 'bilim' },
				{ id: 54, code: 'education', decode: 'eğitim' },
				{ id: 55, code: 'power', decode: 'güç' },
				{ id: 56, code: 'internet', decode: 'internet' },
				{ id: 57, code: 'music', decode: 'müzik' },
				{ id: 58, code: 'art', decode: 'sanat' },
				{ id: 59, code: 'history', decode: 'tarih' },
				{ id: 60, code: 'government', decode: 'hükümet' },
				{ id: 61, code: 'product', decode: 'ürün' },
				{ id: 62, code: 'idea', decode: 'fikir' },
				{ id: 63, code: 'control', decode: 'kontrol' },
				{ id: 64, code: 'medicine', decode: 'tıp' },
				{ id: 65, code: 'language', decode: 'dil' },
				{ id: 66, code: 'theory', decode: 'teori' },
				{ id: 67, code: 'law', decode: 'kanun' },
				{ id: 68, code: 'bird', decode: 'kuş' },
				{ id: 69, code: 'literature', decode: 'edebiyat' },
				{ id: 70, code: 'software', decode: 'yazılım' },
				{ id: 71, code: 'movie', decode: 'film' },
				{ id: 72, code: 'culture', decode: 'kültür' },
				{ id: 73, code: 'news', decode: 'haber' },
				{ id: 74, code: 'safety', decode: 'güvenlik' },
				{ id: 75, code: 'quality', decode: 'kalite' },
				{ id: 76, code: 'team', decode: 'takım' },
				{ id: 77, code: 'price', decode: 'fiyat' },
				{ id: 78, code: 'market', decode: 'pazar' },
				{ id: 79, code: 'game', decode: 'oyun' },
				{ id: 80, code: 'bank', decode: 'banka' },
				{ id: 81, code: 'data', decode: 'veri' },
				{ id: 82, code: 'death', decode: 'ölüm' },
				{ id: 83, code: 'research', decode: 'araştırma' },
				{ id: 84, code: 'skill', decode: 'beceri' },
				{ id: 85, code: 'shop', decode: 'mağaza' },
				{ id: 86, code: 'animal', decode: 'hayvan' },
				{ id: 87, code: 'leader', decode: 'lider' },
				{ id: 88, code: 'light', decode: 'ışık' },
				{ id: 89, code: 'voice', decode: 'ses' },
				{ id: 90, code: 'war', decode: 'savaş' },
				{ id: 91, code: 'police', decode: 'polis' },
				{ id: 92, code: 'heart', decode: 'kalp' },
				{ id: 93, code: 'community', decode: 'topluluk' },
				{ id: 94, code: 'name', decode: 'isim' },
				{ id: 95, code: 'president', decode: 'başkan' },
				{ id: 96, code: 'building', decode: 'bina' },
				{ id: 97, code: 'project', decode: 'proje' },
				{ id: 98, code: 'service', decode: 'hizmet' },
				{ id: 99, code: 'road', decode: 'yol' },
				{ id: 100, code: 'nature', decode: 'doğa' },
{ id: 101, code: 'science', decode: 'bilim' },
{ id: 102, code: 'technology', decode: 'teknoloji' },
{ id: 103, code: 'space', decode: 'uzay' },
{ id: 104, code: 'ocean', decode: 'okyanus' },
{ id: 105, code: 'mountain', decode: 'dağ' },
{ id: 106, code: 'river', decode: 'nehir' },
{ id: 107, code: 'forest', decode: 'orman' },
{ id: 108, code: 'desert', decode: 'çöl' },
{ id: 109, code: 'island', decode: 'ada' },
{ id: 110, code: 'cloud', decode: 'bulut' },
{ id: 111, code: 'storm', decode: 'fırtına' },
{ id: 112, code: 'rain', decode: 'yağmur' },
{ id: 113, code: 'snow', decode: 'kar' },
{ id: 114, code: 'wind', decode: 'rüzgar' },
{ id: 115, code: 'sun', decode: 'güneş' },
{ id: 116, code: 'moon', decode: 'ay' },
{ id: 117, code: 'star', decode: 'yıldız' },
{ id: 118, code: 'sky', decode: 'gökyüzü' },
{ id: 119, code: 'earth', decode: 'dünya' },
{ id: 120, code: 'fire', decode: 'ateş' },
{ id: 121, code: 'water', decode: 'su' },
{ id: 122, code: 'air', decode: 'hava' },
{ id: 123, code: 'plant', decode: 'bitki' },
{ id: 124, code: 'animal', decode: 'hayvan' },
{ id: 125, code: 'fish', decode: 'balık' },
{ id: 126, code: 'bird', decode: 'kuş' },
{ id: 127, code: 'tree', decode: 'ağaç' },
{ id: 128, code: 'flower', decode: 'çiçek' },
{ id: 129, code: 'grass', decode: 'çimen' },
{ id: 130, code: 'city', decode: 'şehir' },
{ id: 131, code: 'village', decode: 'köy' },
{ id: 132, code: 'country', decode: 'ülke' },
{ id: 133, code: 'bridge', decode: 'köprü' },
{ id: 134, code: 'road', decode: 'yol' },
{ id: 135, code: 'building', decode: 'bina' },
{ id: 136, code: 'house', decode: 'ev' },
{ id: 137, code: 'school', decode: 'okul' },
{ id: 138, code: 'university', decode: 'üniversite' },
{ id: 139, code: 'hospital', decode: 'hastane' },
{ id: 140, code: 'car', decode: 'araba' },
{ id: 141, code: 'train', decode: 'tren' },
{ id: 142, code: 'plane', decode: 'uçak' },
{ id: 143, code: 'ship', decode: 'gemi' },
{ id: 144, code: 'bike', decode: 'bisiklet' },
{ id: 145, code: 'bus', decode: 'otobüs' },
{ id: 146, code: 'road', decode: 'yol' },
{ id: 147, code: 'path', decode: 'patika' },
{ id: 148, code: 'map', decode: 'harita' },
{ id: 149, code: 'journey', decode: 'seyahat' },
{ id: 150, code: 'dream', decode: 'rüya' },
{ id: 151, code: 'goal', decode: 'amaç' },
{ id: 152, code: 'success', decode: 'başarı' },
{ id: 153, code: 'failure', decode: 'başarısızlık' },
{ id: 154, code: 'happiness', decode: 'mutluluk' },
{ id: 155, code: 'sadness', decode: 'üzüntü' },
{ id: 156, code: 'fear', decode: 'korku' },
{ id: 157, code: 'courage', decode: 'cesaret' },
{ id: 158, code: 'friendship', decode: 'dostluk' },
{ id: 159, code: 'love', decode: 'aşk' },
{ id: 160, code: 'anger', decode: 'öfke' },
{ id: 161, code: 'peace', decode: 'barış' },
{ id: 162, code: 'war', decode: 'savaş' },
{ id: 163, code: 'negotiation', decode: 'müzakere' },
{ id: 164, code: 'agreement', decode: 'anlaşma' },
{ id: 165, code: 'contract', decode: 'sözleşme' },
{ id: 166, code: 'law', decode: 'kanun' },
{ id: 167, code: 'justice', decode: 'adalet' },
{ id: 168, code: 'crime', decode: 'suç' },
{ id: 169, code: 'punishment', decode: 'ceza' },
{ id: 170, code: 'education', decode: 'eğitim' },
{ id: 171, code: 'knowledge', decode: 'bilgi' },
{ id: 172, code: 'wisdom', decode: 'bilgelik' },
{ id: 173, code: 'idea', decode: 'fikir' },
{ id: 174, code: 'belief', decode: 'inanç' },
{ id: 175, code: 'culture', decode: 'kültür' },
{ id: 176, code: 'tradition', decode: 'gelenek' },
{ id: 177, code: 'religion', decode: 'din' },
{ id: 178, code: 'spirituality', decode: 'maneviyat' },
{ id: 179, code: 'art', decode: 'sanat' },
{ id: 180, code: 'literature', decode: 'edebiyat' },
{ id: 181, code: 'music', decode: 'müzik' },
{ id: 182, code: 'dance', decode: 'dans' },
{ id: 183, code: 'theater', decode: 'tiyatro' },
{ id: 184, code: 'film', decode: 'film' },
{ id: 185, code: 'photography', decode: 'fotoğrafçılık' },
{ id: 186, code: 'painting', decode: 'resim' },
{ id: 187, code: 'sculpture', decode: 'heykel' },
{ id: 188, code: 'architecture', decode: 'mimarlık' },
{ id: 189, code: 'design', decode: 'tasarım' },
{ id: 190, code: 'science', decode: 'bilim' },
{ id: 191, code: 'technology', decode: 'teknoloji' },
{ id: 192, code: 'engineering', decode: 'mühendislik' },
{ id: 193, code: 'mathematics', decode: 'matematik' },
{ id: 194, code: 'medicine', decode: 'tıp' },
{ id: 195, code: 'health', decode: 'sağlık' },
{ id: 196, code: 'disease', decode: 'hastalık' },
{ id: 197, code: 'treatment', decode: 'tedavi' },
{ id: 198, code: 'recovery', decode: 'iyileşme' },
{ id: 199, code: 'nutrition', decode: 'beslenme' },
{ id: 200, code: 'adventure', decode: 'macera' },
{ id: 201, code: 'freedom', decode: 'özgürlük' },
{ id: 202, code: 'inspiration', decode: 'ilham' },
{ id: 203, code: 'passion', decode: 'tutku' },
{ id: 204, code: 'challenge', decode: 'meydan okuma' },
{ id: 205, code: 'creativity', decode: 'yaratıcılık' },
{ id: 206, code: 'determination', decode: 'kararlılık' },
{ id: 207, code: 'innovation', decode: 'yenilik' },
{ id: 208, code: 'motivation', decode: 'motivasyon' },
{ id: 209, code: 'perseverance', decode: 'azim' },
{ id: 210, code: 'curiosity', decode: 'merak' },
{ id: 211, code: 'integrity', decode: 'dürüstlük' },
{ id: 212, code: 'joy', decode: 'neşe' },
{ id: 213, code: 'resilience', decode: 'dayanıklılık' },
{ id: 214, code: 'wisdom', decode: 'bilgelik' },
{ id: 215, code: 'ambition', decode: 'hırs' },
{ id: 216, code: 'compassion', decode: 'şefkat' },
{ id: 217, code: 'gratitude', decode: 'minnettarlık' },
{ id: 218, code: 'humility', decode: 'alçakgönüllülük' },
{ id: 219, code: 'patience', decode: 'sabır' },
{ id: 220, code: 'respect', decode: 'saygı' },
{ id: 221, code: 'courage', decode: 'cesaret' },
{ id: 222, code: 'honesty', decode: 'dürüstlük' },
{ id: 223, code: 'loyalty', decode: 'sadakat' },
{ id: 224, code: 'optimism', decode: 'iyimserlik' },
{ id: 225, code: 'persistence', decode: 'ısrar' },
{ id: 226, code: 'pride', decode: 'gurur' },
{ id: 227, code: 'serenity', decode: 'huzur' },
{ id: 228, code: 'trust', decode: 'güven' },
{ id: 229, code: 'empathy', decode: 'empati' },
{ id: 230, code: 'fortitude', decode: 'cesaret' },
{ id: 231, code: 'generosity', decode: 'cömertlik' },
{ id: 232, code: 'harmony', decode: 'uyum' },
{ id: 233, code: 'idealism', decode: 'ideallik' },
{ id: 234, code: 'kindness', decode: 'naziklik' },
{ id: 235, code: 'mastery', decode: 'usta' },
{ id: 236, code: 'novelty', decode: 'yenilik' },
{ id: 237, code: 'originality', decode: 'özgünlük' },
{ id: 238, code: 'purity', decode: 'saflik' },
{ id: 239, code: 'quaintness', decode: 'tuhaflik' },
{ id: 240, code: 'reliability', decode: 'güvenilirlik' },
{ id: 241, code: 'sagacity', decode: 'bilgelik' },
{ id: 242, code: 'tenacity', decode: 'inatçılık' },
{ id: 243, code: 'unity', decode: 'birlik' },
{ id: 244, code: 'vitality', decode: 'canlılık' },
{ id: 245, code: 'wonder', decode: 'merak' },
{ id: 200, code: 'tradition', decode: 'gelenek' },
{ id: 201, code: 'culture', decode: 'kültür' },
{ id: 202, code: 'belief', decode: 'inanç' },
{ id: 203, code: 'value', decode: 'değer' },
{ id: 204, code: 'custom', decode: 'görenek' },
{ id: 205, code: 'heritage', decode: 'miras' },
{ id: 206, code: 'language', decode: 'dil' },
{ id: 207, code: 'religion', decode: 'din' },
{ id: 208, code: 'ritual', decode: 'ritüel' },
{ id: 209, code: 'society', decode: 'toplum' },
{ id: 210, code: 'community', decode: 'topluluk' },
{ id: 211, code: 'nation', decode: 'ulus' },
{ id: 212, code: 'citizen', decode: 'vatandaş' },
{ id: 213, code: 'identity', decode: 'kimlik' },
{ id: 214, code: 'diversity', decode: 'çeşitlilik' },
{ id: 215, code: 'equality', decode: 'eşitlik' },
{ id: 216, code: 'freedom', decode: 'özgürlük' },
{ id: 217, code: 'justice', decode: 'adalet' },
{ id: 218, code: 'law', decode: 'kanun' },
{ id: 219, code: 'peace', decode: 'barış' },
{ id: 220, code: 'conflict', decode: 'çatışma' },
{ id: 221, code: 'dialogue', decode: 'diyalog' },
{ id: 222, code: 'discussion', decode: 'tartışma' },
{ id: 223, code: 'argument', decode: 'argüman' },
{ id: 224, code: 'debate', decode: 'debate' },
{ id: 225, code: 'speech', decode: 'konuşma' },
{ id: 226, code: 'communication', decode: 'iletişim' },
{ id: 227, code: 'message', decode: 'mesaj' },
{ id: 228, code: 'information', decode: 'bilgi' },
{ id: 229, code: 'news', decode: 'haber' },
{ id: 230, code: 'media', decode: 'medya' },
{ id: 231, code: 'literature', decode: 'edebiyat' },
{ id: 232, code: 'art', decode: 'sanat' },
{ id: 233, code: 'music', decode: 'müzik' },
{ id: 234, code: 'theater', decode: 'tiyatro' },
{ id: 235, code: 'cinema', decode: 'sinema' },
{ id: 236, code: 'painting', decode: 'resim' },
{ id: 237, code: 'sculpture', decode: 'heykel' },
{ id: 238, code: 'architecture', decode: 'mimarlık' },
{ id: 239, code: 'photography', decode: 'fotoğrafçılık' },
{ id: 240, code: 'science', decode: 'bilim' },
{ id: 241, code: 'technology', decode: 'teknoloji' },
{ id: 242, code: 'research', decode: 'araştırma' },
{ id: 243, code: 'innovation', decode: 'yenilik' },
{ id: 244, code: 'experiment', decode: 'deney' },
{ id: 245, code: 'discovery', decode: 'keşif' },
{ id: 246, code: 'invention', decode: 'icat' },
{ id: 247, code: 'knowledge', decode: 'bilgi' },
{ id: 248, code: 'education', decode: 'eğitim' },
{ id: 249, code: 'scholarship', decode: 'burs' }





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