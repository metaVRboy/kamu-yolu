# Kamu Yolu — Hukuki uyum durumu ve yapılacaklar

Son güncelleme: 13.10.2026. Bu belge mevzuat araştırmasına dayanır; avukat görüşü değildir.
Kaynaklar: mevzuat.gov.tr (5651, 5187, 6563, FSEK, KVKK ve yönetmelikleri), kvkk.gov.tr (Yurt Dışına Aktarım
Rehberi Ocak 2025, Aydınlatma Rehberi Mart 2025, Çerez Rehberi Temmuz 2025, standart sözleşme duyuruları),
Google/Meta/TikTok politika sayfaları.

## 1. Sitede/kodda yapılanlar

| Konu | Yapılan |
|---|---|
| KVKK aydınlatma | Veri sorumlusu (gerçek kişi), veri kategorisi → amaç → hukuki sebep → süre, alıcılar ve ülkeleri, m.11 hakları, başvuru yolu. Aydınlatma ile Koşullar onayı ayrı. |
| Çerezler (KVKK Çerez Rehberi 2025) | Reddet / Kabul et eşit; tek rızalı kategori ölçüm; rızasız hiçbir ölçüm kodu çalışmaz; tercih 12 ayda bir yeniden sorulur; rıza kaydı sunucuda (YasalKayit, 2 yıl). |
| Reklam | 14.10.2026'dan itibaren sitede reklam yok (AdSense, ads.txt ve reklam çerezleri kaldırıldı). |
| Memurlar.net (FSEK Ek m.8, TTK m.55) | İlan metni sitede, mobilde ve arama motoru verisinde gösterilmez; yalnızca içeride bölüm eşleştirmesi için kullanılır. Kullanıcı kaynağa yönlendirilir. |
| Haber fotoğrafları (FSEK) | Kaynak sitelerin fotoğrafları kullanılmıyor; 100 eski kayıt temizlendi (27'si kurum logosu, 73'ü görselsiz). |
| Basın Kanunu (5187) | Bölüm adı kullanıcı kararıyla "Haberler" (2026-10-13 "Duyurular" yapılmıştı, 2026-10-22 geri alındı; ad tek başına statüyü belirlemez); her özet kaynağa bağlantılı, "yapay zekâ ile özetlenmiştir" notu; detay sayfaları noindex. Beyanname verilmedi (internet haber sitesi statüsü istenmiyor). |
| 5651 yer sağlayıcı | Becayiş ilanı/mesajı ve girişte IP + zaman kaydı, satır başına HMAC (bütünlük), 2 yıl sonra otomatik silme (`/api/bakim` cron). İlanlarda "Uygunsuz içeriği bildir", mesajlarda şikâyet. Footer'da yer sağlayıcı unvan/adresi. |
| Ticari ileti (6563, İYS) | İYS kaydı olmadığı için kampanya onayı toplanmıyor (`TICARI_ILETI_ACIK=false`); bekleme listesine e-posta değil yalnız site/uygulama içi bildirim; ilan WhatsApp mesajları saf bilgilendirme (Meta "utility" şablonu). |
| Satış (6502, Ticari Reklam Yön.) | `SATIS_ACIK=false`: kampanya/geri sayım/üstü çizili fiyat yok, satış sözleşmeleri yayında değil, "En Popüler" yok. |
| 6563 m.3 | Kullanım Koşulları'nda sözleşmenin kurulma adımları, düzeltme, metnin erişimi. |
| Hesap silme | Destek kayıtları anonimleşiyor; silme kaydı 3 yıl (Silme Yön. m.7/3). |
| Reklam platformları | "Bağımsız platformdur, kamu kurumu değildir" notu footer'da; satılamayan ürün dili yok; reklamdan gelen ilk oturumda tanıtım penceresi açılmıyor. |

## 2. Senin yapman gerekenler (koddan yapılamaz)

1. ~~**Adres ve telefon (5651 Yön. m.5 + KVKK yazılı başvuru)**~~ — 14.10.2026'da footer künyesine ve KVKK §1/§5'e
   eklendi (`src/lib/site.ts`: ILETISIM_ADRES, ILETISIM_TELEFON). Adres değişirse yalnız oradan güncellenir.
2. ~~**Yer sağlayıcılık bildirimi**~~ — 20.10.2026'da BTK kabul etti. **Kalıcı yükümlülük:** her ayın ilk haftasında
   alan adı bilgi dosyası (CSV) BTK sistemine yüklenir; `/api/bakim` her ayın 1'inde info@'ya hatırlatma atar; dosya: `/api/admin/btk-alan-adi` (admin, tarihler RDAP'tan canlı).
   (Eski not:) Becayiş ilanları/mesajları nedeniyle yer sağlayıcısın. e-Devlet üzerinden
   (yersaglayici.btk.gov.tr; 7590 sayılı Kanunla yetki Siber Güvenlik Başkanlığı'na geçti, başvuru anında güncel
   formu kontrol et) "kendi bünyesinde / gerçek kişi" bildirimi. Ceza: 5651 m.5/6.
3. **info@kamuyolu.com'u her gün kontrol et** — 5651 kapsamındaki bildirimler ve KVKK başvuruları buraya gelebilir;
   KVKK başvurusu 30 gün içinde yazılı/e-posta ile cevaplanır.
4. **Yurt dışı aktarım (KVKK m.9)** — Türkiye için yeterlilik kararı yok; tek pratik güvence KVKK standart sözleşmesi.
   - Google Workspace: Google, fatura adresi Türkiye olan müşteriye "Turkish SCCs" sunuyor (Cloud DPA App.3 Turkey).
     Admin konsolunda/Google desteğinden kabul et → imza tarihinden itibaren **5 iş günü** içinde
     standartsozlesme.kvkk.gov.tr (e-Devlet ile giriş) üzerinden bildir. Bildirmemenin cezası 2026'da 90.308–1.806.377 TL.
   - Meta (WhatsApp Business Platform, 2026-10-22): Türkiye standart sözleşmesi sunup sunmadığı doğrulanmadı.
     Meta Business ayarlarında/DPA'da kontrol et; sunuyorsa kabul + 5 iş günü bildirimi, sunmuyorsa aşağıdaki e-posta.
   - Vercel, Neon (Databricks), Resend, Cloudflare: KVKK sözleşmesi sunmuyorlar. Aşağıdaki e-postayı gönder,
     cevaplarını sakla (iyi niyet kanıtı). Kabul eden olursa aynı 5 iş günü bildirimi.
5. **Satıştan veya kampanya iletisinden önce (sırayla)** — ~~vergi kaydı ya da şirket~~ (19.10.2026: şahıs işletmesi,
   gerçek usul, Ankara Cumhuriyet V.D. 5671298061; künye, satış sözleşmeleri, KVKK ve Koşullar güncellendi, adres
   faaliyet adresi oldu) → KEP adresi → İYS kaydı → ETBİS kaydı → WhatsApp Business Platform (2026-10-22: SMS kaldırıldı, başlık için marka tescili 6 ay sürüyordu). Sonra `SATIS_ACIK` / `TICARI_ILETI_ACIK` açılır,
   satış sözleşmeleri doldurulur ve onaylar **yeniden** toplanır (şahıs adına toplanan onay şirkete devredilemez).
6. **Reklam hesapları**
   - Meta: Türkiye için "Özel Reklam Kategorisi" zorunlu değil (NONE seçilebilir); arayüz isterse İstihdam seç, ülke Türkiye.
   - Google Ads: ödeme profili türü (Bireysel/Kuruluş) ve vergi durumu **kalıcı**, bilinçli seç; reklamveren doğrulamasında
     adın herkese açık görünür.
   - TikTok: bireysel kimlik doğrulaması; harcama eşiğinde şirket doğrulaması isteyebilir (şirketsizken reklamlar durabilir).
   - Reklam metinlerinde: "resmi", ay-yıldız/arma, kurum logosu, "Kariyer Kapısı" adı, atanma/puan garantisi, Pro fiyatı yok.
7. **Ölçüm pikselleri** — Meta/TikTok pikseli ve GA4 eklenebilir (kod hazır, Vercel'de `NEXT_PUBLIC_META_PIXEL_ID`,
   `NEXT_PUBLIC_TIKTOK_PIXEL_ID`, `NEXT_PUBLIC_GA4_ID`), ancak her biri KVKK sözleşmesi olmayan yeni bir yurt dışı
   aktarım ekler. Önerilen: piksel eklemeden sitenin kendi ölçümüyle (utm kaynağı, admin "Kampanya ölçümü") başla.

### Vendor'lara gönderilecek e-posta (İngilizce)

> Subject: Turkish KVKK Standard Contractual Clauses (Controller-to-Processor) request
>
> Hello, I operate kamuyolu.com (data controller located in Türkiye) and use your service as a data processor.
> Under Article 9 of Turkey's Personal Data Protection Law No. 6698 (as amended in 2024), transfers abroad require
> the Turkish Data Protection Authority's standard contract (Type 2: controller to processor), signed without
> modification by both parties and notified to the Authority within 5 business days. Could you sign the official
> template (Turkish/English version: https://www.kvkk.gov.tr/Icerik/7929/Standart-Sozlesmeler), or tell me whether
> you offer a Turkish SCC addendum to your DPA? Thank you.

Gönderilecekler: Vercel (privacy@vercel.com), Neon/Databricks (privacy@databricks.com), Resend (support@resend.com),
Cloudflare (privacyquestions@cloudflare.com).

## 3. Veri ihlali müdahale planı (KVKK m.12/5)

1. Fark edildiği anı kaydet (72 saatlik süre buradan başlar). Vendor'dan gelen ihlal bildirimi de sayılır.
2. Sızıntıyı durdur: ilgili anahtarları değiştir (SESSION_SECRET → tüm oturumlar düşer, DB şifresi, API anahtarları),
   gerekirse bakım modunu aç (Admin > Ayarlar).
3. Kapsamı çıkar: hangi tablolar, kaç kişi, hangi veri.
4. **72 saat içinde** ihlalbildirim.kvkk.gov.tr üzerinden Kurul'a bildir (bilgiler aşamalı tamamlanabilir; gecikirse
   gerekçesini yaz).
5. Etkilenen kullanıcılara makul en kısa sürede e-posta: ne oldu, hangi veriler, ne yapmalılar (şifre değiştirme),
   iletişim adresi.
6. Kaydı en az 3 yıl sakla.

## 4. Avukata tek seferde sorulacaklar

1. Yerleşim adresi yerine sanal ofis / PK / avukat adresi 5651 ve KVKK için yeterli mi?
2. Yer sağlayıcılık bildirimi bu kullanımda (ücretsiz, kendi bünyesinde) zorunlu mu, hangi kategoride?
3. KVKK sözleşmesi imzalamayan ABD merkezli vendor'lar için risk kabulü mü, Türkiye'de barındırmaya geçiş mi?
4. Memurlar.net'ten yalnızca "yeni ilan var" sinyali ve içeride eşleştirme için metin almak (gösterilmeden) FSEK Ek m.8
   / TTK m.55 bakımından yeterli mi, yoksa yazılı lisans mı alınmalı (MN Yazılım Medya Bilişim A.Ş.)?
5. "Haberler" bölümü (kaynaklı yapay zekâ özetleri) 5187 internet haber sitesi tanımının dışında kalıyor mu?
6. Gerçek kişi İYS'ye kaydolabilir mi; onay kayıtları için 3 yıl (Yön. m.13) mı 10 yıl (6563 m.11/3) mı?

## 5. Kalan riskler (dürüst özet)

- Google dışındaki vendor'lar için KVKK m.9 güvencesi yok; tam çözüm tüm yığını Türkiye'de barındırmak.
- Yer sağlayıcılık bildirimi yapılana kadar 5651 m.5/6 riski.
- Vercel istemci kaynak portunu vermiyor; trafik kaydında port yok (yönetmeliğin aradığı alanlardan biri).
