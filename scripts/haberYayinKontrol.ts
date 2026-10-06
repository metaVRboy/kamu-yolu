/**
 * haberYayin.ts tarih okuyucusunun kucuk kontrolu.
 * Calistirma: npx tsx scripts/haberYayinKontrol.ts
 */
import assert from "node:assert/strict";
import { haberSuresiGectiMi, metindekiEnGecTarih } from "../src/lib/haberYayin";

const yayin = new Date("2026-09-01T04:47:00Z");
const gun = (t: Date | null) => t?.toISOString().slice(0, 10);

assert.equal(gun(metindekiEnGecTarih("başvuruları 31 Ağustos - 14 Eylül 2026 tarihleri arasında", yayin)), "2026-09-14");
assert.equal(gun(metindekiEnGecTarih("Sınav 25 Ekim'de yapılacak", yayin)), "2026-10-25");
assert.equal(gun(metindekiEnGecTarih("son başvuru 05.01.2027", yayin)), "2027-01-05");
assert.equal(gun(metindekiEnGecTarih("Başvurular 10 Ocak'ta başlıyor", new Date("2026-12-20T00:00:00Z"))), "2027-01-10");
assert.equal(metindekiEnGecTarih("2024 KPSS puanı ile 50 personel alınacak", yayin), null);

const haber = { baslik: "Alım", ozet: "31 Ağustos - 14 Eylül 2026", detaylar: null, basvuruBitis: null, yayinTarihi: yayin };
assert.equal(haberSuresiGectiMi(haber, Date.parse("2026-09-14T20:00:00Z")), false); // son gun hala yayinda
assert.equal(haberSuresiGectiMi(haber, Date.parse("2026-09-16T00:00:00Z")), true);
assert.equal(haberSuresiGectiMi({ ...haber, ozet: "tarih yok" }, Date.parse("2026-09-20T00:00:00Z")), false);
assert.equal(haberSuresiGectiMi({ ...haber, ozet: "tarih yok" }, Date.parse("2026-10-05T00:00:00Z")), true);
// Yayindan onceki tarih (gecmis referans) son basvuru sayilmaz -> 30 gun kurali.
const gecmisRef = { ...haber, ozet: "26 Ağustos'ta başlayan süreç takip ediliyor" };
assert.equal(haberSuresiGectiMi(gecmisRef, Date.parse("2026-09-10T00:00:00Z")), false);
assert.equal(haberSuresiGectiMi(gecmisRef, Date.parse("2026-10-05T00:00:00Z")), true);
console.log("haberYayin: tum kontroller gecti");
