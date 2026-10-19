// npx tsx scripts/guvenlikKontrol.ts — db'siz hizli guvenlik kontrolleri.
import assert from "node:assert/strict";
import { siteIciYol } from "../src/lib/site";

// Giris sonrasi donus hedefi: yalniz site ici yol.
assert.equal(siteIciYol("/profilim?a=1#b"), "/profilim?a=1#b");
for (const kotu of ["//kotu.site", "/\\kotu.site", "/\t/kotu.site", "https://kotu.site", "javascript:alert(1)", "", null]) {
  assert.equal(siteIciYol(kotu), null, String(kotu));
}
console.log("guvenlik kontrolleri gecti");
