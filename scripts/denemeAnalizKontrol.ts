/** KPSS deneme konu analizi kurallarinin kontrolu. Calistirma: npx tsx scripts/denemeAnalizKontrol.ts */
import assert from "node:assert/strict";
import { dersKarnesi, konuAnalizi, konuDurumu } from "../src/lib/kpssDenemeAnaliz";

// Kullanicinin kurallari
assert.equal(konuDurumu({ dogru: 1, yanlis: 2, bos: 0 }), "kirmizi"); // yanlis > dogru
assert.equal(konuDurumu({ dogru: 2, yanlis: 2, bos: 0 }), "sari"); // yanlis = dogru
assert.equal(konuDurumu({ dogru: 3, yanlis: 1, bos: 0 }), "sari"); // en az 1 yanlis, dogrudan az
assert.equal(konuDurumu({ dogru: 1, yanlis: 0, bos: 2 }), "sari"); // bos >= dogru
assert.equal(konuDurumu({ dogru: 0, yanlis: 0, bos: 3 }), "sari"); // hic cozulmemis
assert.equal(konuDurumu({ dogru: 2, yanlis: 0, bos: 1 }), "sari"); // bosluk durumu (onaylandi: sari)
assert.equal(konuDurumu({ dogru: 4, yanlis: 0, bos: 0 }), "yesil"); // hepsi dogru
assert.equal(konuDurumu({ dogru: 0, yanlis: 1, bos: 3 }), "kirmizi"); // kirmizi sariya baskin

const sorular = [
  { id: "1", ders: "MATEMATIK" as const, konu: "Kesirler", dogruCevap: 0 },
  { id: "2", ders: "MATEMATIK" as const, konu: "Kesirler", dogruCevap: 1 },
  { id: "3", ders: "MATEMATIK" as const, konu: "Geometri", dogruCevap: 2 },
  { id: "4", ders: "TURKCE" as const, konu: "Paragraf", dogruCevap: 3 },
  { id: "5", ders: "TURKCE" as const, konu: null, dogruCevap: 0 },
];
const cevaplar = { "1": 4, "2": 0, "3": 2, "4": 3 }; // 1 yanlis, 2 yanlis, 3 dogru, 4 dogru, 5 bos

const analiz = konuAnalizi(sorular, cevaplar);
assert.deepEqual(analiz.map((k) => [k.konu, k.durum]), [["Kesirler", "kirmizi"], ["Geometri", "yesil"], ["Paragraf", "yesil"]]);
assert.equal(analiz.length, 3, "konusuz soru analize girmez");

const karne = dersKarnesi(sorular, cevaplar);
assert.deepEqual(karne.map((d) => [d.ders, d.dogru, d.yanlis, d.bos, d.net]), [["TURKCE", 1, 0, 1, 1], ["MATEMATIK", 1, 2, 0, 0.5]]);

console.log("denemeAnalizKontrol: hepsi gecti");
