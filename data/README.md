# Kelime verisi

`seviye-1.json` … `seviye-5.json`: İngilizce–Türkçe kelime listeleri. `es/` klasöründe aynı yapıda
İspanyolca–Türkçe listeler var (site: `/es/`). Kelimeler günlük İngilizcede
ne kadar sık geçtiklerine göre 5 seviyeye ayrıldı; 1. seviye en sık kullanılan 1.000 kelime.

Her satır bir kelime: `["ingilizce", ["türkçe 1", "türkçe 2", ...]]`. İlk çeviri testte doğru cevap
olarak gösterilir, diğerleri cevap ekranında "diğer anlamlar" olarak listelenir.

## Katkı

Yanlış bir çeviri gördüysen düzeltip pull request açabilirsin:

- **Çeviriyi düzeltmek:** `tools/duzeltmeler-2.json` (İspanyolca: `tools/es/duzeltmeler.json`) dosyasına
  `["kelime", "doğru çeviri"]` ekle.
- **Kelimeyi çıkarmak:** `tools/haric.txt` (İspanyolca: `tools/es/haric.txt`) dosyasına kelimeyi yeni bir satır olarak ekle.

Sonra dosyaları yeniden üret (WikDict dosyaları: https://download.wikdict.com/dictionaries/sqlite/2/):

```sh
pip install wordfreq
python3 tools/sozluk_olustur.py en-tr.sqlite3 tr-en.sqlite3            # İngilizce
python3 tools/sozluk_olustur.py --dil es es-tr.sqlite3 tr-es.sqlite3   # İspanyolca
```

`index.html` değiştiğinde İspanyolca sayfayı yeniden üret: `python3 tools/sayfa_uret.py`
(`es/index.html` elle düzenlenmez).

JSON dosyalarını doğrudan da düzenleyebilirsin, ama betik yeniden çalıştırılırsa bu değişiklikler
silinir; kalıcı düzeltmeler için yukarıdaki dosyaları kullan.

## Kaynaklar ve lisans

- Çeviriler: [Wiktionary](https://www.wiktionary.org/) katkıcıları, [WikDict](https://www.wikdict.com/)
  aracılığıyla. Lisans: [CC BY-SA 4.0](https://creativecommons.org/licenses/by-sa/4.0/).
- Kelime sıklıkları: [wordfreq](https://github.com/rspeer/wordfreq) (CC BY-SA 4.0).

Bu klasördeki veri de aynı koşullarla (CC BY-SA 4.0) paylaşılır.
