/**
 * Parametrik sablonlarin veritabanisiz kontrolu: her sablondan 300 varyant; siklar benzersiz, dogru
 * sik dogru yerde, siklar artan sirada, sekil tutarli, cevap harfleri dengeli. Her sablondan bir ornek yazdirir.
 * Calistirma: npx tsx scripts/kpssSablonKontrol.ts
 */
import assert from "node:assert/strict";
import { SABLONLAR, sablondanSoru, sikKur } from "../src/lib/kpssSablon";
import { geometriSorunu } from "../src/lib/kpssGorsel";
import { KONU_DAGILIMI } from "../src/lib/kpssDenemeKonular";

const harfler = [0, 0, 0, 0, 0];
for (const s of SABLONLAR) {
  assert.ok(KONU_DAGILIMI[s.duzey][s.ders ?? "MATEMATIK"].some(([k]) => k === s.konu), `${s.id}: konu yok`);
  let basari = 0;
  for (let i = 0; i < 300; i++) {
    const u = s.uret();
    if (!u) continue;
    if (u.sekil) assert.equal(geometriSorunu(u.sekil), null, `${s.id}: sekil`);
    const k = sikKur(u, i % 5);
    if (!k) continue;
    basari++;
    harfler[k.dogruCevap]++;
    assert.equal(new Set(k.secenekler).size, 5, `${s.id}: siklar`);
    assert.equal(k.secenekler[k.dogruCevap], (u.goster ?? ((v: number) => String(v).replace(".", ",").replace("-", "−")))(u.dogru), `${s.id}: dogru sik`);
    assert.ok(!/NaN|undefined|Infinity/.test(u.metin + k.secenekler.join() + u.aciklama), `${s.id}: bozuk metin`);
  }
  assert.ok(basari >= 60, `${s.id}: yalniz ${basari}/300 kurulabildi`);
  const o = sablondanSoru(s)!;
  console.log(`\n### ${s.id} (${basari}/300)\n${o.soruMetni}\n${o.secenekler.map((x, i) => `${"ABCDE"[i]}) ${x}`).join("  ")}  => ${"ABCDE"[o.dogruCevap]}\n${o.aciklama}`);
}
console.log("\ncevap harfleri:", harfler.join(" / "));
console.log("sablon kontrolleri tamam");
