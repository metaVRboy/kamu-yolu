// npx tsx scripts/guvenlikKontrol.ts — db'siz hizli guvenlik kontrolleri.
import assert from "node:assert/strict";
import { siteIciYol } from "../src/lib/site";
import { botMu } from "../src/lib/botlar";

// Giris sonrasi donus hedefi: yalniz site ici yol.
assert.equal(siteIciYol("/profilim?a=1#b"), "/profilim?a=1#b");
for (const kotu of ["//kotu.site", "/\\kotu.site", "/\t/kotu.site", "https://kotu.site", "javascript:alert(1)", "", null]) {
  assert.equal(siteIciYol(kotu), null, String(kotu));
}
// /api bot imzasi: mobil uygulama ve tarayicilar gecer, YZ botlari ve scriptler gecemez.
for (const insan of [
  "okhttp/4.12.0",
  "KamuYolu/1 CFNetwork/1568.100.1 Darwin/24.0.0",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0 Safari/537.36",
  "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/18.0 Mobile/15E148 Safari/604.1",
]) assert.equal(botMu(insan), false, insan);
for (const bot of ["", null, "curl/8.5.0", "python-requests/2.32", "node", "Mozilla/5.0 (compatible; ClaudeBot/1.0)", "Mozilla/5.0 (compatible; Claude-User/1.0)", "GPTBot/1.2", "HeadlessChrome/131"]) {
  assert.equal(botMu(bot), true, String(bot));
}
console.log("guvenlik kontrolleri gecti");
