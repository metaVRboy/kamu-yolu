/**
 * Bolum eslestirmesini aktif ilanlarda yeniden hesaplar ve eskisiyle farkini yazar.
 * Varsayilan: yalniz rapor, veritabanina yazmaz (sitede olmayan OSYM bolumu "*" ile gosterilir).
 * --yaz: ekMetin, isDepartmentRestricted ve bolum baglantilarini kaydeder (admin duzenlediklerine dokunmaz).
 * Calistirma: npx tsx scripts/eslestirmeDene.ts [--yaz]
 */
import "dotenv/config";
import { existsSync, readFileSync, writeFileSync } from "fs";
import { tmpdir } from "os";
import { join } from "path";
import { prisma } from "../src/lib/prisma";
import { classifyRequirementText } from "../src/scraper/parseRequirements";
import { kkEkMetni } from "../src/scraper/ilanEkleri";
import { memurlarEkMetni } from "../src/scraper/ilanEkleri";
import { fetchIlanPreview } from "../src/scraper/kariyerKapisiClient";
import { fetchIlanDetay } from "../src/scraper/memurlarNetClient";

const YAZ = process.argv.includes("--yaz");
if (!YAZ) process.env.BOLUM_EKLEME_KAPALI = "1";
// Tekrar calistirmalarda ek PDF/gorseller yeniden indirilip okunmasin (Gemini).
const EK_ONBELLEK = join(tmpdir(), "kamuyolu-eslestirme-ek.json");
const ekOnbellek: Record<string, string> = existsSync(EK_ONBELLEK) ? JSON.parse(readFileSync(EK_ONBELLEK, "utf8")) : {};

async function main() {
  const ilanlar = await prisma.posting.findMany({
    where: { isActive: true, isDemo: false, adminDuzenledi: false },
    select: {
      id: true, title: true, sourceName: true, sourceUrl: true, externalId: true, ilanTuru: true, ekMetin: true,
      departmentRequirementRaw: true, isDepartmentRestricted: true,
      departments: { select: { department: { select: { name: true } } } },
    },
  });
  const anaMetinler = new Map<string, Promise<string>>();
  const pdfOnbellek = new Map<string, Promise<string>>();
  let yeniBaglanan = 0, kaybeden = 0, degisen = 0, kisitKalkti = 0, halaEslesmeyen = 0;

  for (const p of ilanlar) {
    const raw = p.departmentRequirementRaw ?? "";
    const kk = p.sourceName === "Kariyer Kapısı";
    const guid = p.sourceUrl.match(/[?&]i=([0-9a-f-]+)/)?.[1] ?? "";
    const isci = kk ? p.ilanTuru === "İşçi İlanları" : /işçi/.test(`${p.ilanTuru ?? ""} ${p.title}`.toLocaleLowerCase("tr-TR"));
    const pozisyonlu = kk && /:\d+$/.test(p.externalId);

    const sonuc = await classifyRequirementText(raw, isci, async () => {
      if (p.ekMetin != null) return p.ekMetin;
      if (ekOnbellek[p.id] != null) return ekOnbellek[p.id];
      return (ekOnbellek[p.id] = await ekOku());
    });
    async function ekOku() {
      if (kk) {
        if (!anaMetinler.has(guid)) anaMetinler.set(guid, fetchIlanPreview(guid).then((x) => x.ilanMetni ?? ""));
        const ana = await anaMetinler.get(guid)!;
        return kkEkMetni(pozisyonlu ? raw : ana, ana, pdfOnbellek, pozisyonlu);
      }
      const [, id, slug] = p.sourceUrl.match(/\/ilan\/(\d+)\/([^/]+)\.html/) ?? [];
      return memurlarEkMetni((await fetchIlanDetay(id, slug)).ekler);
    }

    const eski = new Set(p.departments.map((d) => d.department.name));
    const yeniIdler = sonuc.matches.map((m) => m.departmentId);
    const yeni = new Set([
      ...(await prisma.department.findMany({ where: { id: { in: yeniIdler } }, select: { name: true } })).map((d) => d.name),
      ...yeniIdler.filter((id) => id.startsWith("osym:")).map((id) => `${id.slice(5)}*`), // * = sitede yok, eklenecek
    ]);
    const eklenen = [...yeni].filter((x) => !eski.has(x));
    const cikan = [...eski].filter((x) => !yeni.has(x));
    if (!eski.size && yeni.size) yeniBaglanan++;
    if (eski.size && !yeni.size) kaybeden++;
    if (p.isDepartmentRestricted && !sonuc.isDepartmentRestricted) kisitKalkti++;
    if (sonuc.isDepartmentRestricted && !yeni.size) halaEslesmeyen++;
    if (eklenen.length || cikan.length || p.isDepartmentRestricted !== sonuc.isDepartmentRestricted) {
      degisen++;
      console.log(`\n${p.sourceName} | ${p.title.slice(0, 80)} | kisitli ${p.isDepartmentRestricted}→${sonuc.isDepartmentRestricted}`);
      if (eklenen.length) console.log(`  + ${eklenen.join(", ")}`);
      if (cikan.length) console.log(`  - ${cikan.join(", ")}`);
    }

    if (YAZ) {
      await prisma.$transaction([
        prisma.posting.update({
          where: { id: p.id },
          data: { isDepartmentRestricted: sonuc.isDepartmentRestricted, educationLevels: sonuc.educationLevels, ...(sonuc.ekMetin !== undefined && { ekMetin: sonuc.ekMetin }) },
        }),
        prisma.postingDepartment.deleteMany({ where: { postingId: p.id } }),
        prisma.postingDepartment.createMany({ data: sonuc.matches.map((m) => ({ postingId: p.id, departmentId: m.departmentId, matchedAlias: m.matchedAlias })) }),
      ]);
    }
  }
  writeFileSync(EK_ONBELLEK, JSON.stringify(ekOnbellek));
  console.log(`\nToplam ${ilanlar.length} ilan · değişen ${degisen} · yeni bağlanan ${yeniBaglanan} · tüm bağlantısını kaybeden ${kaybeden} · kısıtı kalkan ${kisitKalkti} · hâlâ eşleşmeyen ${halaEslesmeyen}${YAZ ? " · KAYDEDİLDİ" : " · (rapor, kaydedilmedi)"}`);
}

main().finally(() => prisma.$disconnect());
