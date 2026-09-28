#!/usr/bin/env python3
"""
Diğer dillerin sayfalarını (es/index.html) index.html'den üretir.

index.html her değiştiğinde çalıştırılmalı; üretilen sayfalar elle düzenlenmemeli.
Sayfa <base href="../"> ile kök klasördeki css/js/görselleri kullanır, window.DIL ile
oyun koduna hangi dilin verisini okuyacağını söyler.

Kullanım:
  python3 tools/sayfa_uret.py
"""
import json
import os

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SAYFALAR = {
    "es": {
        "dil": {"kod": "es", "ses": "es-ES", "veri": "data/es/", "onek": "es-"},
        "ad": "İspanyolca",
    },
}


def kelime_sayisi_yaz(klasor):
    """Başlıktaki "40.000 kelimelik" gibi yuvarlak sayı: en yakın bine yuvarlanır."""
    with open(os.path.join(KOK, klasor, "seviyeler.json"), encoding="utf-8") as f:
        toplam = sum(json.load(f))
    return "{:,}".format(int(round(toplam / 1000.0)) * 1000).replace(",", ".")


def degistir(html, eski, yeni):
    assert html.count(eski) == 1, "index.html'de bulunamadı ya da birden fazla: %r" % eski
    return html.replace(eski, yeni)


def main():
    with open(os.path.join(KOK, "index.html"), encoding="utf-8") as f:
        kaynak = f.read()
    en_sayi = kelime_sayisi_yaz("data")

    for kod, ayar in SAYFALAR.items():
        dil = ayar["dil"]
        sayi = kelime_sayisi_yaz(dil["veri"])
        html = kaynak
        html = degistir(html, '<meta charset="utf-8">',
                        '<meta charset="utf-8">\n  <!-- Bu dosya tools/sayfa_uret.py ile index.html\'den üretilir; elle düzenlemeyin. -->\n'
                        '  <base href="../">')
        html = degistir(html, "<title>İngilizce Kelime Ezberleme</title>",
                        "<title>%s Kelime Ezberleme</title>" % ayar["ad"])
        html = degistir(html, "%s İngilizce kelimeyi" % en_sayi, "%s %s kelimeyi" % (sayi, ayar["ad"]))
        html = degistir(html, "Seviyeni seç, %s kelimelik büyü kitabını öğren." % en_sayi,
                        "Seviyeni seç, %s kelimelik %s büyü kitabını öğren." % (sayi, ayar["ad"]))
        html = degistir(html, '<a href="./" aria-current="page">', '<a href="./">')
        html = degistir(html, '<a href="%s/">' % kod, '<a href="%s/" aria-current="page">' % kod)
        html = degistir(html, '  <script src="js/quiz.js',
                        '  <script>window.DIL = %s;</script>\n  <script src="js/quiz.js' % json.dumps(dil))
        klasor = os.path.join(KOK, kod)
        os.makedirs(klasor, exist_ok=True)
        with open(os.path.join(klasor, "index.html"), "w", encoding="utf-8") as f:
            f.write(html)
        print("%s/index.html üretildi (%s kelime)" % (kod, sayi))


if __name__ == "__main__":
    main()
