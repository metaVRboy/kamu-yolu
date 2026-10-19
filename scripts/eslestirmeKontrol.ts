/**
 * Bolum eslestirme kurallarinin veritabanisiz kontrolu (2026-10-19 hatalari tekrarlanmasin).
 * Calistirma: npx tsx scripts/eslestirmeKontrol.ts
 */
import assert from "node:assert/strict";
import { ciplakOgeler, dilMuafiyetiniCikar, normalize } from "../src/lib/matching";
import { detectEducationLevels, isGenericNoRestriction } from "../src/scraper/parseRequirements";

// Yabanci dil muafiyeti cumlesi bolum sarti degil; gercek sart kalir.
const dil = dilMuafiyetiniCikar(
  "Bilgisayar Mühendisliği lisans bölümlerinden mezun olmak. YDS'den en az (D) almış olmak. Ancak bilgisayar programcılığı alanında meslek yüksekokulu mezunu olanlar (TOEFL) muaftır. İngiliz Dili ve Edebiyatı bölümü mezunu olup YDS'den en az C almış olmak.",
);
assert.doesNotMatch(dil, /programcılığı/);
assert.match(dil, /İngiliz Dili ve Edebiyatı/);

// Olumsuz cumle ilani genel saydirmaz; "herhangi bir ortaöğretim mezunu" genel.
assert.equal(isGenericNoRestriction("Ortaöğretim kurumlarının İmam Hatip Bölümünden mezun olmak, Yükseköğretim kurumlarının herhangi bir programından mezun olmamak, Cinsiyeti erkek olmak, vardiyalı çalışmaya engeli bulunmamak"), false);
assert.equal(isGenericNoRestriction("Herhangi bir ortaöğretim mezunu olmak, vardiyalı sistemde çalışmasına engel bir durumu bulunmamak, 2024 yılı KPSS P94 puan türünden sınava girmiş olmak"), true);

// Duzey yazilmamis lisans ilani.
assert.deepEqual(detectEducationLevels("Üniversitelerin en az 4 (Dört) yıl süreli eğitim veren fakültelerinin"), ["LISANS"]);
assert.deepEqual(detectEducationLevels("Anestezi ön lisans programından mezun olmak, Diş Hekimliği Fakültesi Hastanesinde"), ["ONLISANS"]);

// Ciplak ogeler: muhendislik fakultesine bagli sayim, "ve" obegi, sayim olmayan cumle.
const og = ciplakOgeler(normalize("Mühendislik ve fen edebiyat fakültelerinin bilgisayar, elektrik, elektronik ve haberleşme bölümlerinden mezun olmak"));
assert.ok(og.some((o) => o.oge === "elektrik" && o.muhendislik));
assert.ok(og.some((o) => o.butun === "elektronik ve haberlesme"));
assert.deepEqual(ciplakOgeler(normalize("Kurumun çalışma programı hazırlanır, mezun olmak")), []);
assert.ok(!ciplakOgeler(normalize("Fakültelerin mühendislik bölümlerinden mezun olmak")).some((o) => o.oge === "muhendislik"));

console.log("eslestirme kontrolleri tamam");
