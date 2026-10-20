// npx tsx scripts/baglilikKontrol.ts - Pro hediye, gunun sorulari/seri, rozet, davet ve kisisel ozet kontrolu. YALNIZ dev veritabaninda calisir.
import "dotenv/config";
import assert from "node:assert/strict";
import { prisma } from "../src/lib/prisma";
import { gununSeti, gunlukCevapla, seriDurumu, setSorulari } from "../src/lib/gunlukSorular";
import { proHediyeEt } from "../src/lib/proHediye";
import { rozetDurumu } from "../src/lib/rozetler";
import { kisiselOzet } from "../src/lib/kisiselOzet";
import { davetKodu, davetEdenId, davetOdulunuVer } from "../src/lib/davet";
import { bugununTarihi } from "../src/lib/kpssDeneme";

const E1 = "baglilik-test-1@kamuyolu.local";
const E2 = "baglilik-test-2@kamuyolu.local";

async function main() {
  if (!new URL(process.env.DATABASE_URL!).hostname.startsWith("ep-spring")) throw new Error("yalniz dev");
  await prisma.user.deleteMany({ where: { email: { in: [E1, E2] } } });
  const bolum = await prisma.department.findFirst({ where: { postings: { some: {} } }, select: { id: true } });
  const u1 = await prisma.user.create({ data: { email: E1, adSoyad: "Test Bir", educationLevel: "LISANS" } });

  // Kayit hediyesi: bir kez, Pro + 3 gun
  assert.equal(await proHediyeEt(u1.id, "kayit", 3, "test"), true);
  assert.equal(await proHediyeEt(u1.id, "kayit", 3, "test"), false);
  const p1 = await prisma.user.findUniqueOrThrow({ where: { id: u1.id } });
  assert.equal(p1.abonelikPlani, "PRO");
  assert.ok(Math.abs(p1.abonelikBitis!.getTime() - Date.now() - 3 * 86_400_000) < 60_000);
  console.log("kayit hediyesi OK");

  // Gunun seti: 5 soru, ikinci cagri ayni set
  const set = await gununSeti("LISANS");
  assert.equal(set.soruIdler.length, 5);
  assert.deepEqual((await gununSeti("LISANS")).soruIdler, set.soruIdler);
  const sorular = await setSorulari(set.soruIdler);
  const deneme = await prisma.gunlukDeneme.findUniqueOrThrow({ where: { duzey_tarih: { duzey: "LISANS", tarih: bugununTarihi() } } });
  assert.ok(set.soruIdler.every((id) => !deneme.soruIdler.includes(id)), "denemedeki soru setle cakismamali");
  console.log("set OK:", sorular.map((s) => s.ders).join(","));

  // Seri: dunden 6 gun geriye sahte kayit (gecmis setler) -> bugun cozunce 7 -> hediye
  for (let g = 1; g <= 6; g++) {
    const tarih = new Date(bugununTarihi().getTime() - g * 86_400_000);
    const s = await prisma.gunlukSoruSeti.upsert({ where: { duzey_tarih: { duzey: "LISANS", tarih } }, update: {}, create: { duzey: "LISANS", tarih, soruIdler: set.soruIdler } });
    await prisma.gunlukSoruCevap.create({ data: { userId: u1.id, setId: s.id, tarih, cevaplar: {}, dogru: 0 } });
  }
  assert.equal((await seriDurumu(u1.id)).gun, 6);
  const tamDogru = Object.fromEntries(sorular.map((s) => [s.id, s.dogruCevap]));
  const sonuc = await gunlukCevapla("LISANS", tamDogru, u1.id);
  assert.equal(sonuc.dogru, 5);
  assert.equal(sonuc.seri?.gun, 7);
  assert.equal(sonuc.hediye, true);
  console.log("seri 7 + hediye OK, yuzdeler:", sonuc.sorular.map((s) => s.dogruYuzde).join(","));
  // Ikinci gonderim farkli cevapla: ilk kayit gecerli
  const ikinci = await gunlukCevapla("LISANS", {}, u1.id);
  assert.equal(ikinci.dogru, 5);
  // Gecersiz anahtar reddedilir
  await assert.rejects(gunlukCevapla("LISANS", { "baska-id": 1 }, null));
  console.log("tekrar/gecersiz OK");

  // Rozetler
  const r = await rozetDurumu({ ...p1, abonelikPlani: "PRO" });
  const k = r.rozetler.filter((x) => x.kazanildi).map((x) => x.id);
  assert.ok(k.includes("seri-7") && k.includes("tam-isabet") && k.includes("ilk-gunluk") && k.includes("pro"));
  console.log("rozetler OK:", k.join(","));

  // Davet: u2 u1'in koduyla gelir, bolum secince ikisine hediye
  const kod = await davetKodu(u1.id);
  assert.equal(await davetKodu(u1.id), kod);
  assert.equal(await davetEdenId(kod), u1.id);
  assert.equal(await davetEdenId("YANLIS"), null);
  const u2 = await prisma.user.create({ data: { email: E2, adSoyad: "Test Iki", davetEdenId: u1.id, departmentId: bolum!.id } });
  await davetOdulunuVer(u2.id);
  await davetOdulunuVer(u2.id);
  assert.equal(await prisma.proHediye.count({ where: { userId: u1.id, neden: `davet:${u2.id}` } }), 1);
  assert.equal(await prisma.proHediye.count({ where: { userId: u2.id, neden: "davetli" } }), 1);
  console.log("davet OK, kod:", kod);

  console.log("kisisel ozet:", JSON.stringify(await kisiselOzet(bolum!.id)));

  await prisma.user.deleteMany({ where: { email: { in: [E1, E2] } } });
  await prisma.gunlukSoruSeti.deleteMany({ where: { tarih: { lt: bugununTarihi() }, cevaplar: { none: {} } } });
  console.log("TEMIZLENDI");
}
main().finally(() => prisma.$disconnect());
