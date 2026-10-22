/** WhatsApp yardimcilari + sablon kurallari. Calistirma: npx tsx scripts/whatsappKontrol.ts */
import assert from "node:assert/strict";
import { proAktifMi, SABLONLAR, sessizSaatMi, telefonGoster, telefonMaskele, telefonNormalize } from "../src/lib/whatsapp";

for (const girdi of ["0532 123 45 67", "532-123-4567", "+90 532 123 45 67", "905321234567", "(0532) 123 4567"]) {
  assert.equal(telefonNormalize(girdi), "+905321234567", girdi);
}
for (const gecersiz of ["0212 123 45 67", "12345", "0532 123 45", "+1 532 123 4567", ""]) {
  assert.equal(telefonNormalize(gecersiz), null, gecersiz);
}
assert.equal(telefonMaskele("+905321234567"), "0532 *** ** 67");
assert.equal(telefonGoster("+905321234567"), "0532 123 45 67");

// Istanbul UTC+3: 05:59Z = 08:59 (sessiz), 06:00Z = 09:00 (acik), 17:59Z = 20:59 (acik), 18:00Z = 21:00 (sessiz)
assert.equal(sessizSaatMi(new Date("2026-10-07T05:59:00Z")), true);
assert.equal(sessizSaatMi(new Date("2026-10-07T06:00:00Z")), false);
assert.equal(sessizSaatMi(new Date("2026-10-07T17:59:00Z")), false);
assert.equal(sessizSaatMi(new Date("2026-10-07T18:00:00Z")), true);

const simdi = Date.parse("2026-10-07T12:00:00Z");
assert.equal(proAktifMi({ abonelikPlani: "UCRETSIZ", abonelikBitis: null }, simdi), false);
assert.equal(proAktifMi({ abonelikPlani: "PRO", abonelikBitis: null }, simdi), true);
assert.equal(proAktifMi({ abonelikPlani: "PRO", abonelikBitis: new Date("2026-10-08") }, simdi), true);
assert.equal(proAktifMi({ abonelikPlani: "PRO_PLUS", abonelikBitis: new Date("2026-10-06") }, simdi), false);

// Meta sablon kurallari: degisken govdenin basinda/sonunda olamaz, {{n}} sayisi ornek sayisiyla ayni.
for (const [tur, s] of Object.entries(SABLONLAR)) {
  if (s.kategori === "AUTHENTICATION") continue; // govdeyi Meta hazir verir
  assert.ok(!/^\{\{|\}\}[.!]?$/.test(s.govde), `${tur}: degisken basta/sonda`);
  assert.equal(s.govde.match(/\{\{\d\}\}/g)?.length ?? 0, s.ornek.length, `${tur}: ornek sayisi`);
}

console.log("whatsappKontrol: hepsi gecti");
