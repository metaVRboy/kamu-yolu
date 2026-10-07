/** SMS yardimcilarinin hizli kontrolu. Calistirma: npx tsx scripts/smsKontrol.ts */
import assert from "node:assert/strict";
import { proAktifMi, sessizSaatMi, telefonGoster, telefonMaskele, telefonNormalize } from "../src/lib/sms";

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

console.log("smsKontrol: hepsi gecti");
