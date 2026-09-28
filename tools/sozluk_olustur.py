#!/usr/bin/env python3
"""
Seviye dosyalarını (seviye-1.json ... seviye-5.json + seviyeler.json) üretir.

Kaynaklar:
  - WikDict sözlükleri (Wiktionary'den derlenmiş, CC BY-SA):
      https://download.wikdict.com/dictionaries/sqlite/2/
      İngilizce: en-tr.sqlite3 + tr-en.sqlite3    İspanyolca: es-tr.sqlite3 + tr-es.sqlite3
  - wordfreq kelime sıklıkları (pip install wordfreq) -> seviyeler
  - Elle seçilmiş/düzeltilmiş çeviriler (sözlükteki çevirinin önüne geçer) ve
    teste girmeyecek kelimeler: her dilin DILLER ayarındaki dosyalar

Kullanım:
  python3 tools/sozluk_olustur.py en-tr.sqlite3 tr-en.sqlite3            # İngilizce -> data/
  python3 tools/sozluk_olustur.py --dil es es-tr.sqlite3 tr-es.sqlite3   # İspanyolca -> data/es/
"""
import json
import os
import re
import sqlite3
import sys

from wordfreq import zipf_frequency

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

KELIME_BASINA_EN_FAZLA_CEVIRI = 4
# wordfreq, kelime gruplarının sıklığını tek tek kelimelerden tahmin ettiği için olduğundan yüksek çıkıyor
KELIME_GRUBU_CEZASI = 1.5

TURKCE_KUFUR = set("sik sikmek siktir bok boktan amcık orospu göt piç yarrak kahpe".split())

DILLER = {
    "en": {
        "cikti": "data",
        # Sıklık sırasına göre seviye sınırları (kümülatif kelime sayısı); 5. seviye: geri kalan her şey
        "seviye_sinirlari": [1000, 3000, 8000, 20000],
        "kelime": re.compile(r"^[a-z][a-z'\- ]*[a-z]$"),
        # Tek başına Türkçe karşılığı olmayan görev kelimeleri; teste girmez
        "haric": set("""
a an the to of 's be is are was were been being am do does did has had
than as whether let shall ought at from re la d'oh won't let's
can could will would may might should
going doing making trying coming taking giving asking seeing talking playing waiting
growing leaving calling thinking continued expected added needed allowed provided involved
developed taken given found spent paid felt saw
""".split()) | {"is a", "as of", "as in", "as it is", "all of", "all in", "have it", "at that", "that is", "john"},
        "iki_harfli": set("go do no up we me he it my so on in or if us ok hi oh by ox tv".split()),
        # Küfür ve argo: öğrenme uygulamasında yer almasın
        "kufur": set("""
fuck fucking fucked fucker motherfucker shit bullshit ass asshole damn bitch dick cock pussy cunt
whore slut bastard nigga nigger crap porn piss wanker twat
""".split()),
        # Çoğul eki almış ama ayrı bir anlamı olan kelimeler (çoğul filtresinden muaf)
        "cogul_istisna": set("""
news glasses series species politics physics mathematics economics clothes goods thanks
jeans scissors trousers means arms customs manners savings headquarters premises
""".split()),
        "elle_secilmis": "tools/elle-secilmis.json",
        "duzeltmeler": ["tools/duzeltmeler.json", "tools/duzeltmeler-2.json"],
        "haric_dosyasi": "tools/haric.txt",
    },
    "es": {
        "cikti": "data/es",
        "seviye_sinirlari": [1000, 3000, 6000, 12000],
        "kelime": re.compile(r"^[a-zñáéíóúü][a-zñáéíóúü'\- ]*[a-zñáéíóúü]$"),
        # Artikeller, zamirler, yardımcı fiil çekimleri: tek başına Türkçe karşılığı yok
        "haric": set("""
el la los las lo un una unos unas del al se le les me te nos os es son fue fueron era eran
ha han he has hay sea sido está están estoy estás soy eres somos sus su mis tus
""".split()),
        "iki_harfli": set("ir yo tú él ya no sí ni mi tu oh ay".split()),
        "kufur": set("""
mierda puta puto joder coño cabrón cabrona pendejo pendeja verga polla culo gilipollas
hijoputa maricón chingar chingada pinche zorra carajo
""".split()),
        "cogul_istisna": set("gafas tijeras vacaciones ganas afueras alrededores".split()),
        "elle_secilmis": None,
        "duzeltmeler": ["tools/es/duzeltmeler.json"],
        "haric_dosyasi": "tools/es/haric.txt",
    },
}

PARANTEZ = re.compile(r"\s*[\(\[].*?[\)\]]\s*")
SADE = str.maketrans("çğıöşüâîûÇĞİÖŞÜÂÎÛ", "cgiosuaiuCGIOSUAIU")


def ceviriyi_temizle(tr):
    tr = PARANTEZ.sub(" ", tr).strip(" ,;.")
    tr = re.sub(r"\s+", " ", tr)
    if len(tr) < 2 or len(tr) > 40:
        return None
    if any(c in tr for c in "+=/;:0123456789…"):
        return None
    if tr.startswith("-") or tr.endswith("-") or "comp." in tr:
        return None
    return tr


def sadelestir(tr):
    return tr.translate(SADE).lower()


def json_oku(yol):
    tam = os.path.join(KOK, yol)
    if not os.path.exists(tam):
        return []
    with open(tam, encoding="utf-8") as f:
        return json.load(f)


def main(dil, kaynak_tr_yolu, tr_kaynak_yolu):
    ayar = DILLER[dil]

    def uygun_kelime(k):
        return bool(ayar["kelime"].match(k)) and len(k.split()) <= 3

    sozluk = {}  # kaynak dildeki kelime -> [türkçe, ...] (önem sırasına göre)

    def ekle(k, tr):
        tr = ceviriyi_temizle(tr)
        if not tr:
            return
        liste = sozluk.setdefault(k, [])
        # "gelişigüzel" varken Türkçe karaktersiz "gelisiguzel" yazımı eklenmesin
        if sadelestir(tr) not in (sadelestir(t) for t in liste):
            liste.append(tr)

    # 1) Kaynak dil -> Türkçe (ana kaynak)
    db = sqlite3.connect(kaynak_tr_yolu)
    for k, trans_list in db.execute(
        "SELECT written_rep, trans_list FROM simple_translation ORDER BY max_score DESC"
    ):
        if uygun_kelime(k):
            for tr in trans_list.split(" | "):
                ekle(k, tr)

    sozluk_ilk = set(sozluk)

    # 2) Türkçe -> kaynak dil sözlüğünü ters çevirip eksik kelimeleri tamamla
    db = sqlite3.connect(tr_kaynak_yolu)
    for tr, trans_list in db.execute(
        "SELECT written_rep, trans_list FROM simple_translation ORDER BY max_score DESC"
    ):
        for k in trans_list.split(" | "):
            k = k.strip()
            # yalnızca ana sözlükte hiç olmayan kelimeler; varolanlara eklemek anlamsız çeviriler getiriyor
            if uygun_kelime(k) and k not in sozluk_ilk:
                ekle(k, tr)

    # 3) Elle seçilmiş çeviriler ve düzeltmeler en başa
    if ayar["elle_secilmis"]:
        for k, tr in json_oku(ayar["elle_secilmis"]):
            k = k.lower()
            liste = [t for t in sozluk.get(k, []) if t.lower() != tr.lower()]
            sozluk[k] = [tr] + liste
    for dosya in ayar["duzeltmeler"]:
        for k, tr in json_oku(dosya):
            liste = [t for t in sozluk.get(k, []) if t.lower() != tr.lower()]
            sozluk[k] = [tr] + liste

    haric = set(ayar["haric"])
    haric_yolu = os.path.join(KOK, ayar["haric_dosyasi"])
    if os.path.exists(haric_yolu):
        with open(haric_yolu, encoding="utf-8") as f:
            haric |= {s.strip() for s in f if s.strip() and not s.startswith("#")}

    def cogul_mu(k):
        """Tekil hali de sözlükte olan düz çoğullar ('days', 'casas') tekrar sayılır."""
        if k in ayar["cogul_istisna"] or " " in k or not k.endswith("s") or k.endswith("ss"):
            return False
        adaylar = [k[:-1]]
        if k.endswith("es"):
            adaylar.append(k[:-2])
        if k.endswith("ies"):
            adaylar.append(k[:-3] + "y")
        return any(a in sozluk for a in adaylar)

    def uygun_mu(k, trler):
        if not trler or k in haric or cogul_mu(k):
            return False
        # iki harfli kısaltma/ünlem artıkları ("ma", "em", "ya")
        if len(k) <= 2 and k not in ayar["iki_harfli"]:
            return False
        if any(p in ayar["kufur"] for p in re.split(r"[ \-']", k)):
            return False
        return not any(p in TURKCE_KUFUR for t in trler for p in t.lower().split())

    # 4) Sıklığa göre sırala ve seviyelere böl
    def siklik(k):
        z = zipf_frequency(k, dil)
        return z - KELIME_GRUBU_CEZASI if (" " in k or "-" in k) else z

    kelimeler = sorted(
        ((k, trler[:KELIME_BASINA_EN_FAZLA_CEVIRI]) for k, trler in sozluk.items()
         if uygun_mu(k, trler)),
        key=lambda k: (-siklik(k[0]), k[0]),
    )
    seviyeler = [[] for _ in range(5)]
    for sira, kelime in enumerate(kelimeler):
        s = next((i for i, sinir in enumerate(ayar["seviye_sinirlari"]) if sira < sinir), 4)
        seviyeler[s].append(kelime)

    cikti = os.path.join(KOK, ayar["cikti"])
    os.makedirs(cikti, exist_ok=True)
    for i, liste in enumerate(seviyeler, start=1):
        yol = os.path.join(cikti, "seviye-%d.json" % i)
        with open(yol, "w", encoding="utf-8") as f:
            # Her kelime ayrı satırda: elle düzenlemesi ve git diff'i kolay olsun
            f.write("[\n")
            f.write(",\n".join(json.dumps(k, ensure_ascii=False) for k in liste))
            f.write("\n]\n")
        print("%s: %d kelime, %.1f KB" % (os.path.relpath(yol, KOK), len(liste), os.path.getsize(yol) / 1024))
    # Başlangıç ekranı kelime sayılarını bu küçük dosyadan okur; büyük seviye dosyaları ancak seçilince yüklenir
    with open(os.path.join(cikti, "seviyeler.json"), "w", encoding="utf-8") as f:
        json.dump([len(liste) for liste in seviyeler], f)
        f.write("\n")
    print("toplam:", len(kelimeler))


if __name__ == "__main__":
    argumanlar = sys.argv[1:]
    dil = "en"
    if argumanlar[:1] == ["--dil"]:
        dil, argumanlar = argumanlar[1], argumanlar[2:]
    if len(argumanlar) != 2 or dil not in DILLER:
        sys.exit(__doc__)
    main(dil, argumanlar[0], argumanlar[1])
