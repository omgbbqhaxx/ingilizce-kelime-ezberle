#!/usr/bin/env python3
"""
data/seviye-1.json ... data/seviye-5.json dosyalarını üretir.

Kaynaklar:
  - WikDict İngilizce-Türkçe sözlüğü (Wiktionary'den derlenmiş, CC BY-SA)
      https://download.wikdict.com/dictionaries/sqlite/2/en-tr.sqlite3
      https://download.wikdict.com/dictionaries/sqlite/2/tr-en.sqlite3
  - wordfreq kelime sıklıkları (pip install wordfreq) -> seviyeler
  - tools/elle-secilmis.json, tools/duzeltmeler*.json: elle seçilmiş/düzeltilmiş çeviriler;
    sözlükteki çevirinin önüne geçer
  - tools/haric.txt: teste girmeyecek kelimeler

Kullanım:
  python3 tools/sozluk_olustur.py en-tr.sqlite3 tr-en.sqlite3
"""
import json
import os
import re
import sqlite3
import sys

from wordfreq import zipf_frequency

KOK = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

# Sıklık sırasına göre seviye sınırları (kümülatif kelime sayısı)
SEVIYE_SINIRLARI = [1000, 3000, 8000, 20000]  # 5. seviye: geri kalan her şey
KELIME_BASINA_EN_FAZLA_CEVIRI = 4
# wordfreq, kelime gruplarının sıklığını tek tek kelimelerden tahmin ettiği için olduğundan yüksek çıkıyor
KELIME_GRUBU_CEZASI = 1.5

# Tek başına Türkçe karşılığı olmayan görev kelimeleri; teste girmez
HARIC = set("""
a an the to of 's be is are was were been being am do does did has had
than as whether let shall ought at from re la d'oh won't let's
can could will would may might should
going doing making trying coming taking giving asking seeing talking playing waiting
growing leaving calling thinking continued expected added needed allowed provided involved
developed taken given found spent paid felt saw
""".split()) | {"is a", "as of", "as in", "as it is", "all of", "all in", "have it", "at that", "that is", "john"}

IKI_HARFLI = set("go do no up we me he it my so on in or if us ok hi oh by ox tv".split())

# Küfür ve argo: öğrenme uygulamasında yer almasın
KUFUR = set("""
fuck fucking fucked fucker motherfucker shit bullshit ass asshole damn bitch dick cock pussy cunt
whore slut bastard nigga nigger crap porn piss wanker twat
""".split())
TURKCE_KUFUR = set("sik sikmek siktir bok boktan amcık orospu göt piç yarrak kahpe".split())

# Çoğul eki almış ama ayrı bir anlamı olan kelimeler (çoğul filtresinden muaf)
COGUL_ISTISNA = set("""
news glasses series species politics physics mathematics economics clothes goods thanks
jeans scissors trousers means arms customs manners savings headquarters premises
""".split())

INGILIZCE_KELIME = re.compile(r"^[a-z][a-z'\- ]*[a-z]$")
PARANTEZ = re.compile(r"\s*[\(\[].*?[\)\]]\s*")


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


def ingilizce_uygun_mu(en):
    return bool(INGILIZCE_KELIME.match(en)) and len(en.split()) <= 3


def main(en_tr_yolu, tr_en_yolu):
    sozluk = {}  # ingilizce -> [türkçe, ...] (önem sırasına göre)

    def ekle(en, tr):
        tr = ceviriyi_temizle(tr)
        if not tr:
            return
        liste = sozluk.setdefault(en, [])
        if tr.lower() not in (t.lower() for t in liste):
            liste.append(tr)

    # 1) İngilizce -> Türkçe (ana kaynak)
    db = sqlite3.connect(en_tr_yolu)
    for en, trans_list in db.execute(
        "SELECT written_rep, trans_list FROM simple_translation ORDER BY max_score DESC"
    ):
        if ingilizce_uygun_mu(en):
            for tr in trans_list.split(" | "):
                ekle(en, tr)

    sozluk_ilk = set(sozluk)

    # 2) Türkçe -> İngilizce sözlüğünü ters çevirip eksik İngilizce kelimeleri tamamla
    db = sqlite3.connect(tr_en_yolu)
    for tr, trans_list in db.execute(
        "SELECT written_rep, trans_list FROM simple_translation ORDER BY max_score DESC"
    ):
        for en in trans_list.split(" | "):
            en = en.strip()
            # yalnızca ana sözlükte hiç olmayan kelimeler; varolanlara eklemek anlamsız çeviriler getiriyor
            if ingilizce_uygun_mu(en) and en not in sozluk_ilk:
                ekle(en, tr)

    # 3) Elle seçilmiş çeviriler en başa
    with open(os.path.join(KOK, "tools", "elle-secilmis.json"), encoding="utf-8") as f:
        for en, tr in json.load(f):
            en = en.lower()
            liste = [t for t in sozluk.get(en, []) if t.lower() != tr.lower()]
            sozluk[en] = [tr] + liste

    # 4) Düzeltmeler: sözlükte yanlış/nadir anlamı öne çıkan sık kelimeler için doğru çeviri
    for dosya in ("duzeltmeler.json", "duzeltmeler-2.json"):
        with open(os.path.join(KOK, "tools", dosya), encoding="utf-8") as f:
            for en, tr in json.load(f):
                liste = [t for t in sozluk.get(en, []) if t.lower() != tr.lower()]
                sozluk[en] = [tr] + liste

    with open(os.path.join(KOK, "tools", "haric.txt"), encoding="utf-8") as f:
        haric = HARIC | {s.strip() for s in f if s.strip() and not s.startswith("#")}

    def cogul_mu(en):
        """Tekil hali de sözlükte olan düz çoğullar ('days', 'words') tekrar sayılır."""
        if en in COGUL_ISTISNA or " " in en or not en.endswith("s") or en.endswith("ss"):
            return False
        adaylar = [en[:-1]]
        if en.endswith("es"):
            adaylar.append(en[:-2])
        if en.endswith("ies"):
            adaylar.append(en[:-3] + "y")
        return any(a in sozluk for a in adaylar)

    def uygun_mu(en, trler):
        if not trler or en in haric or cogul_mu(en):
            return False
        # iki harfli kısaltma/ünlem artıkları ("ma", "em", "ya")
        if len(en) <= 2 and en not in IKI_HARFLI:
            return False
        if any(k in KUFUR for k in re.split(r"[ \-']", en)):
            return False
        return not any(k in TURKCE_KUFUR for t in trler for k in t.lower().split())

    # 5) Sıklığa göre sırala ve seviyelere böl
    def siklik(en):
        z = zipf_frequency(en, "en")
        return z - KELIME_GRUBU_CEZASI if (" " in en or "-" in en) else z

    kelimeler = sorted(
        ((en, trler[:KELIME_BASINA_EN_FAZLA_CEVIRI]) for en, trler in sozluk.items()
         if uygun_mu(en, trler)),
        key=lambda k: (-siklik(k[0]), k[0]),
    )
    seviyeler = [[] for _ in range(5)]
    for sira, kelime in enumerate(kelimeler):
        s = next((i for i, sinir in enumerate(SEVIYE_SINIRLARI) if sira < sinir), 4)
        seviyeler[s].append(kelime)

    os.makedirs(os.path.join(KOK, "data"), exist_ok=True)
    for i, liste in enumerate(seviyeler, start=1):
        yol = os.path.join(KOK, "data", "seviye-%d.json" % i)
        with open(yol, "w", encoding="utf-8") as f:
            # Her kelime ayrı satırda: elle düzenlemesi ve git diff'i kolay olsun
            f.write("[\n")
            f.write(",\n".join(json.dumps(k, ensure_ascii=False) for k in liste))
            f.write("\n]\n")
        print("seviye-%d.json: %d kelime, %.1f KB" % (i, len(liste), os.path.getsize(yol) / 1024))
    # Başlangıç ekranı kelime sayılarını bu küçük dosyadan okur; büyük seviye dosyaları ancak seçilince yüklenir
    with open(os.path.join(KOK, "data", "seviyeler.json"), "w", encoding="utf-8") as f:
        json.dump([len(liste) for liste in seviyeler], f)
        f.write("\n")
    print("toplam:", len(kelimeler))


if __name__ == "__main__":
    if len(sys.argv) != 3:
        sys.exit(__doc__)
    main(sys.argv[1], sys.argv[2])
