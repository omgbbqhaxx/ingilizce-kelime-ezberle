(function () {
  'use strict';

  var SORU_SAYISI = 20;          // bir dersteki soru sayısı
  var SECENEK_SAYISI = 3;
  var OTOMATIK_GECIS_MS = 1200;  // doğru cevaptan sonra sonraki soruya geçme süresi
  var SERI_ROZET_ARALIGI = 5;    // her 5 doğruda bir "üst üste" rozeti

  // Sürüm, index.html'deki quiz.js?v=... değerinden okunur; sürüm yalnızca orada güncellenir.
  var SURUM = document.currentScript && new URL(document.currentScript.src).searchParams.get('v');

  var OVGULER = ['Harika!', 'Süper!', 'Mükemmel!', 'Aynen öyle!', 'Çok iyi!', 'Tam isabet!'];

  var $ = function (id) { return document.getElementById(id); };

  // localStorage gizli sekmede hata verebilir; tercihler yalnızca kolaylık için saklanıyor.
  var depo = {
    al: function (k) { try { return localStorage.getItem(k); } catch (e) { return null; } },
    yaz: function (k, v) { try { localStorage.setItem(k, v); } catch (e) {} }
  };

  var hareketAzalt = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;

  var mod = new URLSearchParams(location.search).get('mod') === 'zor' ? 'zor' : 'kolay';
  var sesAcik = depo.al('ses') !== 'kapali';
  var desteler = {};   // mod -> henüz sorulmamış kelimeler (karışık)
  var ders = null;
  var aktifEkran = 'baslangic';
  var gecisZamanlayici = null;

  // ---------- Yardımcılar ----------

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

  // Her dersin kelimeleri ortak bir desteden çekilir; böylece liste bitmeden aynı kelime tekrar gelmez.
  function destedenAl(n) {
    var liste = KELIMELER[mod];
    var deste = desteler[mod] || [];
    if (deste.length < n) {
      deste = deste.concat(karistir(liste).filter(function (k) { return deste.indexOf(k) < 0; }));
    }
    desteler[mod] = deste;
    return deste.splice(0, Math.min(n, liste.length));
  }

  // Doğru cevap + aynı anlama gelmeyen iki yanlış seçenek.
  // Aynı kelimeyle başlayanlar ("her yerde bulunan" / "her yerde bulunma") birbirine çok benzediği için elenir.
  function secenekleriOlustur(kelime) {
    var dogru = kucuk(kelime[1]);
    var secilen = [kelime[1]];
    var kullanilan = {};
    kullanilan[dogru] = true;
    var adaylar = karistir(KELIMELER[mod]);
    for (var i = 0; i < adaylar.length && secilen.length < SECENEK_SAYISI; i++) {
      var tr = adaylar[i][1];
      var k = kucuk(tr);
      if (kullanilan[k] || ilkKelime(k) === ilkKelime(dogru)) continue;
      kullanilan[k] = true;
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

  function moduSec(yeniMod) {
    mod = yeniMod;
    document.querySelectorAll('.mod').forEach(function (b) {
      b.setAttribute('aria-checked', String(b.dataset.mod === mod));
    });
    var url = mod === 'zor' ? '?mod=zor' : location.pathname;
    try { history.replaceState(null, '', url); } catch (e) {}
  }

  // ---------- Ders akışı ----------

  function dersBaslat(kelimeler) {
    ders = {
      sorular: kelimeler || destedenAl(SORU_SAYISI),
      sira: 0,
      dogru: 0,
      yanlislar: [],
      seri: 0,
      cevaplandi: false,
      baslangic: Date.now()
    };
    seriyiGuncelle(false);
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
    var dogruMu = secilenBtn.dataset.cevap === kelime[1];

    // giriş animasyonu sınıfı kalırsa seçeneklerin pop/salla animasyonunu ezer
    $('soru-icerik').classList.remove('giris');

    document.querySelectorAll('.secenek').forEach(function (b) {
      b.disabled = true;
      if (b.dataset.cevap === kelime[1]) b.classList.add('dogru');
      else if (b === secilenBtn) b.classList.add('yanlis');
      else b.classList.add('soluk');
    });

    if (dogruMu) {
      ders.dogru++;
      ders.seri++;
      seriyiGuncelle(true);
      if (ders.seri % SERI_ROZET_ARALIGI === 0) {
        seriRozetiGoster(ders.seri);
        sesCal('seri');
      } else {
        sesCal('dogru');
      }
      geriBildirimGoster(true, rastgele(OVGULER), kelime[0] + ' = ' + kelime[1]);
      gecisZamanlayici = setTimeout(devam, OTOMATIK_GECIS_MS);
    } else {
      ders.seri = 0;
      ders.yanlislar.push(kelime);
      seriyiGuncelle(false);
      sesCal('yanlis');
      geriBildirimGoster(false, 'Doğru cevap:', kelime[0] + ' = ' + kelime[1]);
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

  function seriRozetiGoster(sayi) {
    var rozet = $('seri-rozet');
    rozet.textContent = '🔥 ' + sayi + ' üst üste!';
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
    setTimeout(soruyuGoster, hareketAzalt ? 0 : 200);
  }

  function dersiBitir() {
    var toplam = ders.sorular.length;
    var basari = Math.round(ders.dogru / toplam * 100);
    var saniye = Math.round((Date.now() - ders.baslangic) / 1000);

    var baslik, alt;
    if (basari === 100) { baslik = 'Kusursuz!'; alt = 'Hiç hata yapmadın, efsanesin.'; }
    else if (basari >= 80) { baslik = 'Harika iş!'; alt = 'Kelimeler yerine oturuyor.'; }
    else if (basari >= 50) { baslik = 'İyi gidiyorsun!'; alt = 'Biraz daha tekrarla, tamamdır.'; }
    else { baslik = 'Pes etmek yok!'; alt = 'Her tekrar seni bir adım ileri taşır.'; }
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
      tr.textContent = k[1];
      li.appendChild(en);
      li.appendChild(tr);
      liste.appendChild(li);
    });
    $('tekrar-kutu').hidden = ders.yanlislar.length === 0;
    $('yanlislar-btn').hidden = ders.yanlislar.length === 0;

    ekranGoster('sonuc');
    // sıçrama animasyonunun her derste yeniden oynaması için
    animasyonuYenidenBaslat(document.querySelector('.ekran-sonuc .maskot'), 'maskot-zipla');

    say($('istat-dogru'), ders.dogru, function (n) { return n + '/' + toplam; });
    say($('istat-basari'), basari, function (n) { return n + '%'; });
    say($('istat-sure'), saniye, function (n) {
      return Math.floor(n / 60) + ':' + String(n % 60).padStart(2, '0');
    });

    sesCal('bitti');
    if (basari >= 50) konfetiPatlat();

    if (typeof gtag === 'function') {
      gtag('event', 'ders_bitti', { mod: mod, basari: basari });
    }
  }

  // Sayıyı 0'dan hedefe doğru sayarak gösterir.
  function say(el, hedef, bicim) {
    if (hareketAzalt) { el.textContent = bicim(hedef); return; }
    var sure = 900, bas = performance.now();
    (function adim(simdi) {
      var t = Math.min(1, (simdi - bas) / sure);
      var yumusak = 1 - Math.pow(1 - t, 3);
      el.textContent = bicim(Math.round(hedef * yumusak));
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

    var renkler = ['#58cc02', '#1cb0f6', '#ff9600', '#ffc800', '#ff4b4b', '#ce82ff'];
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
    ekranGoster('baslangic');
  }

  // ---------- Olaylar ----------

  if (SURUM) {
    document.querySelectorAll('[data-surum]').forEach(function (el) { el.textContent = 'v' + SURUM; });
  }
  $('sayi-kolay').textContent = KELIMELER.kolay.length + ' kelime';
  $('sayi-zor').textContent = KELIMELER.zor.length + ' kelime';
  moduSec(mod);
  sesButonunuGuncelle();
  if (!konusmaVar) $('hoparlor-btn').hidden = true;

  document.querySelectorAll('.mod').forEach(function (b) {
    b.addEventListener('click', function () { moduSec(b.dataset.mod); });
  });
  $('ses-btn').addEventListener('click', function () {
    sesAcik = !sesAcik;
    depo.yaz('ses', sesAcik ? 'acik' : 'kapali');
    sesButonunuGuncelle();
    sesCal('dogru');
  });
  $('basla-btn').addEventListener('click', function () { dersBaslat(); });
  $('hoparlor-btn').addEventListener('click', telaffuzEt);
  $('devam-btn').addEventListener('click', devam);
  $('kapat-btn').addEventListener('click', modalAc);
  $('modal-kal-btn').addEventListener('click', modalKapat);
  $('modal-cik-btn').addEventListener('click', derstenCik);
  $('cikis-modal').addEventListener('click', function (e) {
    if (e.target === this) modalKapat();
  });
  $('yeni-ders-btn').addEventListener('click', function () { dersBaslat(); });
  $('yanlislar-btn').addEventListener('click', function () {
    dersBaslat(karistir(ders.yanlislar));
  });
  $('ana-sayfa-btn').addEventListener('click', function () { ekranGoster('baslangic'); });

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
      dersBaslat();
    }
  });
})();
