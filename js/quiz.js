(function () {
  'use strict';

  var SORU_SAYISI = 20;          // bir dersteki soru sayısı
  var SECENEK_SAYISI = 3;
  var OTOMATIK_GECIS_MS = 300;   // doğru cevaptan sonra yeşil vurgunun görünme süresi
  var SERI_ROZET_ARALIGI = 5;    // her 5 doğruda bir "üst üste" rozeti

  // Sürüm, index.html'deki quiz.js?v=... değerinden okunur; sürüm yalnızca orada güncellenir.
  var SURUM = document.currentScript && new URL(document.currentScript.src).searchParams.get('v');

  var XP_PUANI = 10;             // doğru cevap başına

  var $ = function (id) { return document.getElementById(id); };

  // localStorage gizli sekmede hata verebilir; tercihler yalnızca kolaylık için saklanıyor.
  var depo = {
    al: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    yaz: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var hareketAzalt = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var SEVIYE_SAYISI = 5;
  var parametreler = new URLSearchParams(location.search);
  // ?mod=zor eski zor-kelimeler sayfasından gelen bağlantılar için
  var seviye = seviyeGecerli(parametreler.get('seviye')) ||
    (parametreler.get('mod') === 'zor' ? 5 : seviyeGecerli(depo.al('seviye')) || 1);
  var sesAcik = depo.al('ses') !== 'kapali';
  var sozlukler = {};  // seviye -> [[ingilizce, [türkçe, ...]], ...]
  var desteler = {};   // seviye -> henüz sorulmamış kelimeler (karışık)
  var toplamlar = null;    // seviye başına kelime sayısı (data/seviyeler.json)
  var ogrenilenler = {};   // seviye -> Set(doğru bilinen İngilizce kelimeler)
  var ders = null;
  var aktifEkran = 'baslangic';
  var gecisZamanlayici = null;

  // ---------- Yardımcılar ----------

  function seviyeGecerli(deger) {
    var n = Number(deger);
    return n >= 1 && n <= SEVIYE_SAYISI && n % 1 === 0 ? n : 0;
  }

  function karistir(dizi) {
    var a = dizi.slice();
    for (var i = a.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1));
      var t = a[i]; a[i] = a[j]; a[j] = t;
    }
    return a;
  }

  function kucuk(s) { return s.toLocaleLowerCase('tr'); }
  function ilkKelime(s) { return kucuk(s).split(' ')[0]; }
  function rastgele(dizi) { return dizi[Math.floor(Math.random() * dizi.length)]; }

  function cevap(kelime) { return kelime[1][0]; }
  function anlamlar(kelime) { return kelime[1].slice(0, 3).join(', '); }

  // Seviye dosyası yalnızca o seviye seçilince indirilir (5. seviye ~700 KB).
  function sozlukYukle(s) {
    if (sozlukler[s]) return Promise.resolve(sozlukler[s]);
    return fetch('data/seviye-' + s + '.json?v=' + (SURUM || ''))
      .then(function (r) {
        if (!r.ok) throw new Error(r.status);
        return r.json();
      })
      .then(function (liste) { return (sozlukler[s] = liste); });
  }

  // ---------- Öğrenilen kelimeler ----------
  // Doğru bilinen kelime "öğrenildi" sayılır ve o seviyede bir daha sorulmaz; yanlışlar sorulmaya devam eder.
  // Bu cihazdaki tarayıcıda saklanır (hesap sistemi yok).

  function ogrenilenSeti(s) {
    if (!ogrenilenler[s]) {
      var liste;
      try { liste = JSON.parse(depo.al('ogrenilen-' + s) || '[]'); } catch (e) { liste = []; }
      ogrenilenler[s] = new Set(Array.isArray(liste) ? liste : []);
    }
    return ogrenilenler[s];
  }

  function ogrenildiIsaretle(s, en) {
    var set = ogrenilenSeti(s);
    set.add(en);
    depo.yaz('ogrenilen-' + s, JSON.stringify(Array.from(set)));
  }

  function toplamSayi(s) {
    return sozlukler[s] ? sozlukler[s].length : toplamlar ? toplamlar[s - 1] : 0;
  }

  function kalanSayi(s) {
    return Math.max(0, toplamSayi(s) - ogrenilenSeti(s).size);
  }

  function seviyeAdi(s) {
    return document.querySelector('.seviye[data-seviye="' + s + '"] .seviye-ad').textContent;
  }

  function sayiYaz(n) { return n.toLocaleString('tr'); }

  function seviyeKartlariniGuncelle() {
    document.querySelectorAll('.seviye').forEach(function (b) {
      var s = Number(b.dataset.seviye);
      var toplam = toplamSayi(s);
      if (!toplam) return;
      var kalan = kalanSayi(s);
      b.querySelector('.seviye-sayi').textContent = kalan === 0 ? 'Tamamlandı ✓' : sayiYaz(kalan) + ' kaldı';
      b.querySelector('.seviye-bar i').style.width = ((toplam - kalan) / toplam * 100) + '%';
      b.classList.toggle('tamam', kalan === 0);
    });
    genelIlerlemeyiGuncelle();
  }

  // Tüm seviyelerin toplamı: ana sayfanın altındaki yeşil XP kutusu
  function genelIlerlemeyiGuncelle() {
    var toplam = 0, ogrenilen = 0;
    for (var s = 1; s <= SEVIYE_SAYISI; s++) {
      var t = toplamSayi(s);
      if (!t) return; // seviye sayıları henüz yüklenmedi
      toplam += t;
      ogrenilen += t - kalanSayi(s);
    }
    var yuzde = ogrenilen / toplam * 100;
    $('genel-ogrenilen').textContent = sayiYaz(ogrenilen) + ' / ' + sayiYaz(toplam);
    $('genel-kalan').textContent = sayiYaz(toplam - ogrenilen);
    // 40.000 kelimede yüzde yavaş ilerler; %10'a kadar tek ondalıkla göster (%1,3 gibi)
    $('genel-yuzde').textContent = '%' + (Math.floor(yuzde * (yuzde < 10 ? 10 : 1)) / (yuzde < 10 ? 10 : 1)).toLocaleString('tr');
    $('genel-dolgu').style.width = yuzde + '%';
    $('genel-bar').setAttribute('aria-valuenow', Math.floor(yuzde));
    $('genel-xp').hidden = false;
  }

  // Her dersin kelimeleri ortak bir desteden çekilir; böylece liste bitmeden aynı kelime tekrar gelmez.
  // Öğrenilmiş kelimeler desteye hiç girmez.
  function destedenAl(n) {
    var ogrenilen = ogrenilenSeti(seviye);
    var yeni = function (k) { return !ogrenilen.has(k[0]); };
    var deste = (desteler[seviye] || []).filter(yeni);
    if (deste.length < n) {
      var kalan = new Set(deste);
      deste = deste.concat(karistir(sozlukler[seviye]).filter(function (k) { return yeni(k) && !kalan.has(k); }));
    }
    desteler[seviye] = deste;
    return deste.splice(0, n);
  }

  // Doğru cevap + iki yanlış seçenek. Yanlış seçenek, kelimenin anlamlarından biri olamaz;
  // aynı kelimeyle başlayanlar ("her yerde bulunan" / "her yerde bulunma") da birbirine çok benzediği için elenir.
  function secenekleriOlustur(kelime) {
    var dogru = cevap(kelime);
    var secilen = [dogru];
    var yasak = {};
    kelime[1].forEach(function (tr) { yasak[kucuk(tr)] = true; });
    var liste = sozlukler[seviye];
    for (var deneme = 0; deneme < 200 && secilen.length < SECENEK_SAYISI; deneme++) {
      var tr = cevap(rastgele(liste));
      var k = kucuk(tr);
      if (yasak[k] || ilkKelime(k) === ilkKelime(dogru)) continue;
      yasak[k] = true;
      secilen.push(tr);
    }
    return karistir(secilen);
  }

  function animasyonuYenidenBaslat(el, sinif) {
    el.classList.remove(sinif);
    void el.offsetWidth; // reflow: aynı animasyonun tekrar oynaması için
    el.classList.add(sinif);
  }

  // ---------- Ses ----------

  var sesBaglami = null;
  function sesCal(tur) {
    if (!sesAcik) return;
    try {
      sesBaglami = sesBaglami || new (window.AudioContext || window.webkitAudioContext)();
      if (sesBaglami.state === 'suspended') sesBaglami.resume();
      var notalar = {
        dogru: [[659, 0], [988, .09]],
        yanlis: [[196, 0], [165, .13]],
        seri: [[784, 0], [988, .08], [1319, .16]],
        bitti: [[523, 0], [659, .13], [784, .26], [1047, .39]]
      }[tur];
      notalar.forEach(function (n) {
        var osilator = sesBaglami.createOscillator();
        var kazanc = sesBaglami.createGain();
        var t = sesBaglami.currentTime + n[1];
        osilator.type = tur === 'yanlis' ? 'triangle' : 'sine';
        osilator.frequency.value = n[0];
        kazanc.gain.setValueAtTime(0.0001, t);
        kazanc.gain.exponentialRampToValueAtTime(tur === 'yanlis' ? 0.25 : 0.18, t + 0.02);
        kazanc.gain.exponentialRampToValueAtTime(0.0001, t + 0.28);
        osilator.connect(kazanc);
        kazanc.connect(sesBaglami.destination);
        osilator.start(t);
        osilator.stop(t + 0.3);
      });
    } catch (e) {}
  }

  function sesButonunuGuncelle() {
    var b = $('ses-btn');
    b.setAttribute('aria-pressed', String(sesAcik));
    b.setAttribute('aria-label', sesAcik ? 'Sesi kapat' : 'Sesi aç');
  }

  var konusmaVar = 'speechSynthesis' in window;
  function telaffuzEt() {
    if (!konusmaVar || !ders) return;
    var btn = $('hoparlor-btn');
    var soz = new SpeechSynthesisUtterance(ders.kelime[0]);
    soz.lang = 'en-US';
    soz.rate = 0.9;
    soz.onend = soz.onerror = function () { btn.classList.remove('caliyor'); };
    speechSynthesis.cancel();
    btn.classList.add('caliyor');
    speechSynthesis.speak(soz);
  }

  // ---------- Ekranlar ----------

  function ekranGoster(ad) {
    aktifEkran = ad;
    ['baslangic', 'soru', 'sonuc'].forEach(function (e) {
      $('ekran-' + e).classList.toggle('aktif', e === ad);
    });
    window.scrollTo(0, 0);
  }

  function seviyeSec(yeni) {
    seviye = yeni;
    depo.yaz('seviye', String(seviye));
    document.querySelectorAll('.seviye').forEach(function (b) {
      b.setAttribute('aria-checked', String(Number(b.dataset.seviye) === seviye));
    });
    $('yukleme-hata').hidden = true;
    $('seviye-bitti').hidden = true;
    try { history.replaceState(null, '', '?seviye=' + seviye); } catch (e) {}
  }

  // ---------- Ders akışı ----------

  function yeniDers() {
    var btn = $('basla-btn');
    if (btn.classList.contains('yukleniyor')) return;
    btn.classList.add('yukleniyor');
    btn.textContent = 'Büyü kitabı açılıyor…';
    // iOS Safari konuşmaya ancak bir dokunuşun içinde izin verir; ilk kelime sözlük yüklendikten
    // sonra okunacağı için sesi burada, tıklamanın içinde boş bir cümleyle açıyoruz
    if (konusmaVar && sesAcik) speechSynthesis.speak(new SpeechSynthesisUtterance(''));
    $('yukleme-hata').hidden = true;
    sozlukYukle(seviye)
      .then(function () { seviyeKartlariniGuncelle(); yeniGorev(); })
      .catch(function () {
        $('yukleme-hata').hidden = false;
        ekranGoster('baslangic');
      })
      .then(function () {
        btn.classList.remove('yukleniyor');
        btn.textContent = 'Maceraya başla';
      });
  }

  // Sorulmamış kelime kalmadıysa seviye bitmiştir: başlangıç ekranında haber ver
  function yeniGorev() {
    var kelimeler = destedenAl(SORU_SAYISI);
    if (!kelimeler.length) {
      ekranGoster('baslangic');
      seviyeKartlariniGuncelle();
      $('seviye-bitti').hidden = false;
      return;
    }
    dersBaslat(kelimeler);
  }

  function kalanBilgisiniGuncelle(zipla) {
    $('kalan-sayi').textContent = sayiYaz(kalanSayi(seviye));
    if (zipla) animasyonuYenidenBaslat($('kalan-sayi'), 'zipla');
  }

  function dersBaslat(kelimeler) {
    ders = {
      sorular: kelimeler,
      kalanBaslangic: kalanSayi(seviye),
      sira: 0,
      dogru: 0,
      yanlislar: [],
      seri: 0,
      cevaplandi: false,
      baslangic: Date.now()
    };
    seriyiGuncelle(false);
    $('kalan-seviye').textContent = seviyeAdi(seviye);
    kalanBilgisiniGuncelle(false);
    ekranGoster('soru');
    soruyuGoster();
  }

  function ilerlemeyiGuncelle() {
    var yuzde = Math.round(ders.sira / ders.sorular.length * 100);
    $('ilerleme-dolgu').style.width = yuzde + '%';
    $('ilerleme').setAttribute('aria-valuenow', yuzde);
  }

  function soruyuGoster() {
    var kelime = ders.kelime = ders.sorular[ders.sira];
    ders.cevaplandi = false;
    ilerlemeyiGuncelle();

    $('kelime').textContent = kelime[0];
    if (sesAcik) telaffuzEt(); // yeni kelime bir kez sesli okunur; hoparlörle tekrar dinlenebilir

    var kutu = $('secenekler');
    kutu.textContent = '';
    secenekleriOlustur(kelime).forEach(function (tr, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'secenek';
      b.dataset.cevap = tr;
      var no = document.createElement('span');
      no.className = 'secenek-no';
      no.textContent = i + 1;
      var metin = document.createElement('span');
      metin.textContent = tr;
      b.appendChild(no);
      b.appendChild(metin);
      b.addEventListener('click', function () { cevapla(b); });
      kutu.appendChild(b);
    });

    var icerik = $('soru-icerik');
    icerik.classList.remove('cikis');
    animasyonuYenidenBaslat(icerik, 'giris');
  }

  function cevapla(secilenBtn) {
    if (ders.cevaplandi) return;
    ders.cevaplandi = true;

    var kelime = ders.kelime;
    var dogruMu = secilenBtn.dataset.cevap === cevap(kelime);

    // giriş animasyonu sınıfı kalırsa seçeneklerin pop/salla animasyonunu ezer
    $('soru-icerik').classList.remove('giris');

    document.querySelectorAll('.secenek').forEach(function (b) {
      b.disabled = true;
      if (b.dataset.cevap === cevap(kelime)) b.classList.add('dogru');
      else if (b === secilenBtn) b.classList.add('yanlis');
      else b.classList.add('soluk');
    });

    if (dogruMu) {
      ders.dogru++;
      ders.seri++;
      ogrenildiIsaretle(seviye, kelime[0]);
      kalanBilgisiniGuncelle(true);
      xpYazisiGoster(secilenBtn);
      seriyiGuncelle(true);
      if (ders.seri % SERI_ROZET_ARALIGI === 0) {
        seriRozetiGoster(ders.seri);
        sesCal('seri');
      } else {
        sesCal('dogru');
      }
      // Doğruda alt panel açılmaz; kısa bir yeşil vurgudan sonra hemen sonraki soru gelir
      gecisZamanlayici = setTimeout(devam, OTOMATIK_GECIS_MS);
    } else {
      ders.seri = 0;
      ders.yanlislar.push(kelime);
      seriyiGuncelle(false);
      sesCal('yanlis');
      geriBildirimGoster(false, 'Doğru cevap:', kelime[0] + ' = ' + anlamlar(kelime));
    }

    ders.sira++;
    ilerlemeyiGuncelle();
  }

  function seriyiGuncelle(arttiMi) {
    var seri = $('seri');
    $('seri-sayi').textContent = ders.seri;
    seri.classList.toggle('aktif', ders.seri > 0);
    $('ilerleme').classList.toggle('seri-modu', ders.seri >= 3);
    if (arttiMi) animasyonuYenidenBaslat(seri, 'zipla');
  }

  // Yazı sayfaya eklenir, butona değil: soru hemen değiştiği için butonla birlikte kaybolmasın
  function xpYazisiGoster(btn) {
    var kutu = btn.getBoundingClientRect();
    var yazi = document.createElement('span');
    yazi.className = 'xp-ucan';
    yazi.setAttribute('aria-hidden', 'true');
    yazi.textContent = '+' + XP_PUANI + ' XP';
    yazi.style.left = (kutu.right - 16) + 'px';
    yazi.style.top = (kutu.top + kutu.height / 2) + 'px';
    yazi.addEventListener('animationend', function () { yazi.remove(); });
    document.body.appendChild(yazi);
  }

  function seriRozetiGoster(sayi) {
    var rozet = $('seri-rozet');
    rozet.textContent = '🔥 Kombo ×' + sayi;
    animasyonuYenidenBaslat(rozet, 'goster');
  }

  function geriBildirimGoster(dogruMu, baslik, detay) {
    var panel = $('geri-bildirim');
    panel.classList.remove('dogru', 'yanlis');
    panel.classList.add(dogruMu ? 'dogru' : 'yanlis', 'acik');
    $('gb-baslik').textContent = baslik;
    $('gb-detay').textContent = detay;
    $('devam-btn').focus({ preventScroll: true });
  }

  function devam() {
    if (!ders || !ders.cevaplandi || aktifEkran !== 'soru') return;
    ders.cevaplandi = false; // Enter + tıklama gibi çift tetiklemeleri engeller
    clearTimeout(gecisZamanlayici);
    $('geri-bildirim').classList.remove('acik');

    if (ders.sira >= ders.sorular.length) {
      dersiBitir();
      return;
    }
    var icerik = $('soru-icerik');
    icerik.classList.remove('giris');
    icerik.classList.add('cikis');
    setTimeout(soruyuGoster, hareketAzalt ? 0 : 120);
  }

  function dersiBitir() {
    var toplam = ders.sorular.length;
    var basari = Math.round(ders.dogru / toplam * 100);
    var saniye = Math.round((Date.now() - ders.baslangic) / 1000);

    var baslik, alt;
    if (basari === 100) { baslik = 'Efsanevi!'; alt = 'Hiç hata yok. Bu büyü kitabı artık senin.'; }
    else if (basari >= 80) { baslik = 'Destansı!'; alt = 'Kelimeler emrine amade.'; }
    else if (basari >= 50) { baslik = 'İyi savaştın!'; alt = 'Biraz daha antrenmanla ustalaşacaksın.'; }
    else { baslik = 'Pes etmek yok!'; alt = 'Her görev seni bir seviye ileri taşır.'; }
    $('sonuc-baslik').textContent = baslik;
    $('sonuc-alt').textContent = alt;

    var liste = $('tekrar-liste');
    liste.textContent = '';
    ders.yanlislar.forEach(function (k) {
      var li = document.createElement('li');
      var en = document.createElement('b');
      en.lang = 'en';
      en.textContent = k[0];
      var tr = document.createElement('span');
      tr.textContent = anlamlar(k);
      li.appendChild(en);
      li.appendChild(tr);
      liste.appendChild(li);
    });
    $('tekrar-kutu').hidden = ders.yanlislar.length === 0;
    $('yanlislar-btn').hidden = ders.yanlislar.length === 0;
    // Yanlış varsa öne çıkan buton "tekrarla"; "yeni görev" ikincil kalır
    $('yeni-ders-btn').classList.toggle('btn-ikincil', ders.yanlislar.length > 0);

    ekranGoster('sonuc');
    // sıçrama animasyonunun her derste yeniden oynaması için
    animasyonuYenidenBaslat(document.querySelector('.ekran-sonuc .maskot'), 'maskot-zipla');

    say($('sonuc-xp'), ders.dogru * XP_PUANI, function (n) { return '+' + n + ' XP'; });

    // Seviye geri sayımı: dersten önceki kalan sayıdan şimdikine doğru azalır
    var toplamKelime = toplamSayi(seviye);
    var kalanSimdi = kalanSayi(seviye);
    $('durum-seviye').textContent = seviyeAdi(seviye);
    var dolgu = $('durum-dolgu');
    dolgu.style.transition = 'none';
    dolgu.style.width = ((toplamKelime - ders.kalanBaslangic) / toplamKelime * 100) + '%';
    void dolgu.offsetWidth;
    dolgu.style.transition = '';
    dolgu.style.width = ((toplamKelime - kalanSimdi) / toplamKelime * 100) + '%';
    say($('durum-kalan'), kalanSimdi, function (n) {
      return n === 0 ? 'Seviye tamamlandı! 🏆' : sayiYaz(n) + ' kelime kaldı';
    }, ders.kalanBaslangic);
    seviyeKartlariniGuncelle();
    say($('istat-dogru'), ders.dogru, function (n) { return n + '/' + toplam; });
    say($('istat-basari'), basari, function (n) { return n + '%'; });
    say($('istat-sure'), saniye, function (n) {
      return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
    });

    sesCal('bitti');
    if (basari >= 50) konfetiPatlat();

    if (typeof gtag === 'function') {
      gtag('event', 'ders_bitti', { seviye: seviye, basari: basari, kalan: kalanSimdi });
    }
  }

  // Sayıyı başlangıçtan (varsayılan 0) hedefe doğru sayarak gösterir; geri sayım da olabilir.
  function say(el, hedef, bicim, baslangic) {
    baslangic = baslangic || 0;
    if (hareketAzalt) { el.textContent = bicim(hedef); return; }
    var sure = 900, bas = performance.now();
    (function adim(simdi) {
      var t = Math.min(1, (simdi - bas) / sure);
      var yumusak = 1 - Math.pow(1 - t, 3);
      el.textContent = bicim(Math.round(baslangic + (hedef - baslangic) * yumusak));
      if (t < 1) requestAnimationFrame(adim);
    })(bas);
  }

  // ---------- Konfeti ----------

  function konfetiPatlat() {
    if (hareketAzalt) return;
    var tuval = $('konfeti');
    var ctx = tuval.getContext('2d');
    var oran = window.devicePixelRatio || 1;
    var g = innerWidth, y = innerHeight;
    tuval.width = g * oran;
    tuval.height = y * oran;
    ctx.scale(oran, oran);

    var renkler = ['#ffd100', '#f2c14e', '#4fd8ff', '#a335ee', '#ff8000', '#1eff00'];
    var parcalar = [];
    for (var i = 0; i < 140; i++) {
      var aci = -Math.PI / 2 + (Math.random() - 0.5) * 1.6;
      var hiz = 7 + Math.random() * 9;
      parcalar.push({
        x: g / 2 + (Math.random() - 0.5) * 80,
        y: y * 0.45,
        vx: Math.cos(aci) * hiz,
        vy: Math.sin(aci) * hiz,
        boy: 6 + Math.random() * 6,
        donus: Math.random() * Math.PI,
        donusHizi: (Math.random() - 0.5) * 0.3,
        renk: rastgele(renkler)
      });
    }

    var bas = performance.now();
    (function kare(simdi) {
      var gecen = simdi - bas;
      ctx.clearRect(0, 0, g, y);
      ctx.globalAlpha = gecen > 2200 ? Math.max(0, 1 - (gecen - 2200) / 600) : 1;
      parcalar.forEach(function (p) {
        p.vy += 0.25;
        p.vx *= 0.99;
        p.x += p.vx;
        p.y += p.vy;
        p.donus += p.donusHizi;
        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.donus);
        ctx.fillStyle = p.renk;
        ctx.fillRect(-p.boy / 2, -p.boy / 4, p.boy, p.boy / 2 * (0.4 + Math.abs(Math.sin(p.donus))));
        ctx.restore();
      });
      if (gecen < 2800) requestAnimationFrame(kare);
      else ctx.clearRect(0, 0, g, y);
    })(bas);
  }

  // ---------- Çıkış onayı ----------

  function modalAc() {
    $('cikis-modal').hidden = false;
    $('modal-kal-btn').focus();
  }
  function modalKapat() {
    $('cikis-modal').hidden = true;
  }
  function derstenCik() {
    modalKapat();
    clearTimeout(gecisZamanlayici);
    $('geri-bildirim').classList.remove('acik');
    if (konusmaVar) speechSynthesis.cancel();
    ders = null;
    seviyeKartlariniGuncelle(); // yarıda bırakılan derste öğrenilenler de sayılır
    ekranGoster('baslangic');
  }

  // ---------- Olaylar ----------

  if (SURUM) {
    document.querySelectorAll('[data-surum]').forEach(function (el) { el.textContent = 'v' + SURUM; });
  }
  seviyeSec(seviye);
  fetch('data/seviyeler.json?v=' + (SURUM || ''))
    .then(function (r) { return r.json(); })
    .then(function (sayilar) {
      toplamlar = sayilar;
      seviyeKartlariniGuncelle();
    })
    .catch(function () {});
  sesButonunuGuncelle();
  if (!konusmaVar) $('hoparlor-btn').hidden = true;

  document.querySelectorAll('.seviye').forEach(function (b) {
    b.addEventListener('click', function () {
      seviyeSec(Number(b.dataset.seviye));
      sozlukYukle(seviye).catch(function () {}); // Başla'ya basılmadan önce indirmeye başla
    });
  });
  $('ses-btn').addEventListener('click', function () {
    sesAcik = !sesAcik;
    depo.yaz('ses', sesAcik ? 'acik' : 'kapali');
    sesButonunuGuncelle();
    sesCal('dogru');
  });
  $('basla-btn').addEventListener('click', yeniDers);
  $('hoparlor-btn').addEventListener('click', telaffuzEt);
  $('devam-btn').addEventListener('click', devam);
  $('kapat-btn').addEventListener('click', modalAc);
  $('modal-kal-btn').addEventListener('click', modalKapat);
  $('modal-cik-btn').addEventListener('click', derstenCik);
  $('cikis-modal').addEventListener('click', function (e) {
    if (e.target === this) modalKapat();
  });
  $('yeni-ders-btn').addEventListener('click', yeniGorev);
  $('sifirla-btn').addEventListener('click', function () {
    if (!confirm(seviyeAdi(seviye) + ' seviyesindeki ilerlemen silinecek. Emin misin?')) return;
    ogrenilenler[seviye] = new Set();
    depo.yaz('ogrenilen-' + seviye, '[]');
    desteler[seviye] = null;
    $('seviye-bitti').hidden = true;
    seviyeKartlariniGuncelle();
  });
  sozlukYukle(seviye).catch(function () {});
  $('yanlislar-btn').addEventListener('click', function () {
    dersBaslat(karistir(ders.yanlislar));
  });
  $('ana-sayfa-btn').addEventListener('click', function () {
    seviyeKartlariniGuncelle();
    ekranGoster('baslangic');
  });

  document.addEventListener('keydown', function (e) {
    if (e.repeat || e.ctrlKey || e.metaKey || e.altKey) return;

    if (!$('cikis-modal').hidden) {
      if (e.key === 'Escape') modalKapat();
      return;
    }
    if (aktifEkran === 'soru' && ders) {
      if (!ders.cevaplandi && /^[1-9]$/.test(e.key)) {
        var b = $('secenekler').children[Number(e.key) - 1];
        if (b) b.click();
      } else if (e.key === 'Enter' && document.activeElement !== $('devam-btn')) {
        devam();
      } else if (e.key === 'Escape') {
        modalAc();
      }
    } else if (aktifEkran === 'baslangic' && e.key === 'Enter' &&
               (document.activeElement === document.body || !document.activeElement)) {
      yeniDers();
    }
  });
})();
