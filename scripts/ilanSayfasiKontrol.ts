/** Ilan sayfasi yardimcilarinin hizli kontrolu. Calistirma: npx tsx scripts/ilanSayfasiKontrol.ts */
import assert from "node:assert/strict";
import { basvuruIlerlemesi, kalanGunSayisi, nitelikMaddeleri } from "../src/lib/ilanVitrin";

const GUN = 24 * 60 * 60 * 1000;
const bas = new Date("2026-09-24T00:00:00Z");
const son = new Date("2026-10-09T00:00:00Z"); // 16 gunluk pencere (bitis gunu dahil)

assert.equal(basvuruIlerlemesi(bas, son, bas.getTime()), 0);
assert.equal(basvuruIlerlemesi(bas, son, bas.getTime() + 8 * GUN), 50);
assert.equal(basvuruIlerlemesi(bas, son, son.getTime() + 5 * GUN), 100);
assert.equal(basvuruIlerlemesi(null, son), null);
assert.equal(basvuruIlerlemesi(son, bas), null);

assert.equal(kalanGunSayisi(son, son.getTime() - 2 * GUN), 2);
assert.equal(kalanGunSayisi(null), null);

assert.deepEqual(
  nitelikMaddeleri("ARANAN NİTELİKLER\nGenel şartlar:\n-Bilgisayar Programcılığı mezunu olmak.\n• Askerlik hizmetini yapmış olmak\n2) KPSS P93 puanı\n1- 2024 yılı KPSS\n2024-2025 döneminde\n\n"),
  [
    { madde: false, metin: "Genel şartlar:" },
    { madde: true, metin: "Bilgisayar Programcılığı mezunu olmak." },
    { madde: true, metin: "Askerlik hizmetini yapmış olmak" },
    { madde: true, metin: "KPSS P93 puanı" },
    { madde: true, metin: "2024 yılı KPSS" },
    { madde: false, metin: "2024-2025 döneminde" },
  ],
);
console.log("ilanSayfasiKontrol: hepsi gecti");
