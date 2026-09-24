import { PrismaClient } from "@/generated/prisma/client";
import { EducationLevel } from "@/generated/prisma/enums";
import {
  MEMURLAR_KATEGORILER,
  fetchIlanDetay,
  fetchKategoriIlanlari,
  ilanDetayUrl,
} from "./memurlarNetClient";
import { detectEducationLevels, detectInstitutionType, isGenericNoRestriction } from "./parseRequirements";
import { matchDepartmentsForText } from "@/lib/matching";
import { notifyUsersForMatchedPosting } from "@/lib/notifications";
import { removeCrossSourceDuplicate } from "@/lib/postingDedupe";

export const SOURCE_NAME = "Memurlar.Net";

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export type ScrapeSummary = {
  postingsFound: number;
  positionsProcessed: number;
  unmatchedCount: number;
  staleDeactivated: number;
  unmatchedSamples: string[];
};

// Kurum adi, basligin numara/pozisyon kismindan once gelen bolum - ör.
// "Karayolları Genel Müdürlüğü 50 İşçi Alacak" -> "Karayolları Genel
// Müdürlüğü". Kesin degil (kaynakta ayri bir "kurum" alani yok) ama
// institutionType tespiti ve filtreleme icin yeterli bir yaklasim.
function guessKurumAdi(title: string): string {
  const trimmed = title
    .replace(/\s+\d[\d.]*\s+.*$/u, "")
    .replace(/\s+(Alım İlanı|Alacak|Alım İlanı Yayımlandı|Personel Alım İlanı)\b.*$/iu, "")
    .trim();
  return trimmed || title;
}

/**
 * Memurlar.Net'teki (Kariyer Kapisi kapsamina hic girmeyen askeri, engelli,
 * mahalli, SYDV gibi kategoriler dahil) aktif kamu istihdami ilanlarini
 * cekip veritabanini gunceller. Kariyer Kapisi'ndan bagimsiz, ayri bir
 * kaynak olarak isler - ayni ilan iki kaynaktan da gelebilir, bu durumda
 * ikisi de ayri posting olarak durur (department/egitim filtreleri her
 * ikisinde de dogru calistigi surece kullanici acisindan sorun olusturmaz).
 */
export async function scrapeMemurlarNet(prisma: PrismaClient): Promise<ScrapeSummary> {
  const run = await prisma.scrapeRun.create({
    data: { sourceName: SOURCE_NAME, status: "RUNNING" },
  });

  try {
    const seenExternalIds = new Set<string>();
    const unmatchedTexts: string[] = [];
    let postingsFound = 0;

    for (const kategori of MEMURLAR_KATEGORILER) {
      let ozetler;
      try {
        ozetler = await fetchKategoriIlanlari(kategori);
      } catch (err) {
        console.error(`Memurlar.Net kategorisi çekilemedi (${kategori}):`, err);
        continue;
      }
      postingsFound += ozetler.length;

      for (const ozet of ozetler) {
        const externalId = `memurlar:${ozet.id}`;
        if (seenExternalIds.has(externalId)) continue; // birden fazla kategoride gorunebilir
        seenExternalIds.add(externalId);

        let detay;
        try {
          detay = await fetchIlanDetay(ozet.id, ozet.slug);
        } catch (err) {
          console.error(`Memurlar.Net ilan detayı çekilemedi (${ozet.id}):`, err);
          continue;
        }

        const title = detay.title || ozet.title;
        const kurumAdi = guessKurumAdi(title);
        const institutionType = detectInstitutionType(kurumAdi);

        // Isci ilanlarinin (daimi/gecici) tam metni genelde yas/saglik/sabika
        // gibi genel sartlari listeler, egitim seviyesi/bolum bilgisi
        // icermez - bu tur toplu iscii kadrolari pratikte neredeyse hicbir
        // zaman bolume ozel degildir ve taban seviyesi genelde
        // ortaogretimdir (bkz. scrapeKariyerKapisi.ts'teki ayni mantik).
        const isciIlaniMi = kategori === "daimi-isci-ilanlari" || kategori === "gecici-isci-ilanlari";

        const levels = detectEducationLevels(detay.bodyText);
        const educationLevels =
          levels.length > 0 ? levels : [isciIlaniMi ? EducationLevel.LISE : EducationLevel.LISANS];

        const matches = await matchDepartmentsForText(detay.bodyText);
        const isDepartmentRestricted =
          matches.length > 0 || (!isciIlaniMi && !isGenericNoRestriction(detay.bodyText));
        if (matches.length === 0) {
          unmatchedTexts.push(detay.bodyText.slice(0, 200));
        }

        // Ayni gercek ilan Kariyer Kapisi'ndan da gelmis olabilir - varsa
        // o eski kaydi kaldirip yerine bu (en guncel islenen) kaydin
        // durmasini sagla.
        await removeCrossSourceDuplicate({ institutionName: kurumAdi, title, sourceName: SOURCE_NAME });

        const existing = await prisma.posting.findUnique({
          where: { externalId },
          select: { id: true },
        });

        const posting = await prisma.posting.upsert({
          where: { externalId },
          update: {
            title,
            institutionName: kurumAdi,
            institutionType,
            ilanTuru: detay.kategori,
            sourceUrl: ilanDetayUrl(ozet.id, ozet.slug),
            educationLevels,
            departmentRequirementRaw: detay.bodyText,
            isDepartmentRestricted,
            applicationEnd: detay.applicationEnd,
            isActive: true,
            scrapedAt: new Date(),
          },
          create: {
            externalId,
            title,
            institutionName: kurumAdi,
            institutionType,
            ilanTuru: detay.kategori,
            sourceName: SOURCE_NAME,
            sourceUrl: ilanDetayUrl(ozet.id, ozet.slug),
            educationLevels,
            departmentRequirementRaw: detay.bodyText,
            isDepartmentRestricted,
            applicationEnd: detay.applicationEnd,
            publishedAt: detay.ilanGirisTarihi ?? new Date(),
            isActive: true,
          },
        });

        await prisma.postingDepartment.deleteMany({
          where: { postingId: posting.id },
        });
        for (const match of matches) {
          await prisma.postingDepartment.create({
            data: {
              postingId: posting.id,
              departmentId: match.departmentId,
              matchedAlias: match.matchedAlias,
            },
          });
        }

        if (!existing && matches.length > 0) {
          const departments = await prisma.department.findMany({
            where: { id: { in: matches.map((m) => m.departmentId) } },
            select: { id: true, slug: true },
          });
          await notifyUsersForMatchedPosting({
            postingTitle: title,
            departments: departments.map((d) => ({ departmentId: d.id, slug: d.slug })),
          });
        }

        await sleep(250);
      }
    }

    const staleResult = await prisma.posting.updateMany({
      where: {
        sourceName: SOURCE_NAME,
        isActive: true,
        externalId: { notIn: Array.from(seenExternalIds) },
      },
      data: { isActive: false },
    });

    const summary: ScrapeSummary = {
      postingsFound,
      positionsProcessed: seenExternalIds.size,
      unmatchedCount: unmatchedTexts.length,
      staleDeactivated: staleResult.count,
      unmatchedSamples: unmatchedTexts.slice(0, 15),
    };

    await prisma.scrapeRun.update({
      where: { id: run.id },
      data: {
        status: "SUCCESS",
        finishedAt: new Date(),
        postingsFound: summary.postingsFound,
        positionsProcessed: summary.positionsProcessed,
        unmatchedCount: summary.unmatchedCount,
        staleDeactivated: summary.staleDeactivated,
      },
    });

    return summary;
  } catch (err) {
    await prisma.scrapeRun.update({
      where: { id: run.id },
      data: {
        status: "FAILED",
        finishedAt: new Date(),
        errorMessage: err instanceof Error ? err.message : String(err),
      },
    });
    throw err;
  }
}
