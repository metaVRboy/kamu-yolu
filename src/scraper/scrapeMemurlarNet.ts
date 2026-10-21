import { PrismaClient } from "@/generated/prisma/client";
import {
  MEMURLAR_KATEGORILER,
  fetchIlanDetay,
  fetchKategoriIlanlari,
  ilanDetayUrl,
} from "./memurlarNetClient";
import { classifyRequirementText, detectInstitutionType } from "./parseRequirements";
import { memurlarEkMetni } from "./ilanEkleri";
import { notifyUsersForMatchedPosting } from "@/lib/notifications";
import { kurumTakipBildir } from "@/lib/kurumTakip";
import { buildCrossSourceDuplicateIndex, removeCrossSourceDuplicate, expireOverduePostings } from "@/lib/postingDedupe";

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
    await expireOverduePostings();

    const seenExternalIds = new Set<string>();
    const unmatchedTexts: string[] = [];
    let postingsFound = 0;
    const dupIndex = await buildCrossSourceDuplicateIndex(SOURCE_NAME);

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
        // Ilan birden fazla kategoride listelenebilir (ilk gorulen kategoriyle islenir): ilanin kendi
        // kategorisine ve basligina da bakilir ("SYDV Geçici 1 İşçi Alacak", "İşçi İlanları").
        const isciIlaniMi =
          kategori === "daimi-isci-ilanlari" ||
          kategori === "gecici-isci-ilanlari" ||
          /işçi/.test(`${detay.kategori ?? ""} ${title}`.toLocaleLowerCase("tr-TR"));

        const existing = await prisma.posting.findUnique({
          where: { externalId },
          select: { id: true, adminGizli: true, adminDuzenledi: true, ekMetin: true },
        });
        // Tablo gorselleri bir kez okunur (Gemini); kayitliysa yeniden okunmaz.
        const { educationLevels, isDepartmentRestricted, matches, ekMetin } = await classifyRequirementText(
          detay.bodyText,
          isciIlaniMi,
          async () => existing?.ekMetin ?? memurlarEkMetni(detay.ekler),
        );
        if (matches.length === 0) {
          unmatchedTexts.push(detay.bodyText.slice(0, 200));
        }

        // Ayni gercek ilan Kariyer Kapisi'ndan da gelmis olabilir - varsa
        // o eski kaydi kaldirip yerine bu (en guncel islenen) kaydin
        // durmasini sagla.
        await removeCrossSourceDuplicate(dupIndex, { institutionName: kurumAdi, title });

        // Admin duzeltmeleri korunur: gizlenen ilan aktiflesmez, duzenlenen alanlar ezilmez.
        const adminKoru = existing?.adminDuzenledi ?? false;

        const posting = await prisma.posting.upsert({
          where: { externalId },
          update: {
            ...(!adminKoru && {
              title,
              institutionName: kurumAdi,
              educationLevels,
              isDepartmentRestricted,
              applicationEnd: detay.applicationEnd,
            }),
            institutionType,
            ilanTuru: detay.kategori,
            sourceUrl: ilanDetayUrl(ozet.id, ozet.slug),
            departmentRequirementRaw: detay.bodyText,
            ...(ekMetin !== undefined && { ekMetin }),
            isActive: !existing?.adminGizli,
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
            ekMetin,
            isDepartmentRestricted,
            applicationEnd: detay.applicationEnd,
            publishedAt: detay.ilanGirisTarihi ?? new Date(),
            // Kaynak bazen suresi coktan dolmus ilani listede tutuyor: pasif dogsun.
            isActive: !detay.applicationEnd || detay.applicationEnd >= new Date(),
          },
        });

        // Admin bolumleri elle duzelttiyse eslesmeye dokunma.
        if (!adminKoru) await prisma.postingDepartment.deleteMany({
          where: { postingId: posting.id },
        });
        for (const match of adminKoru ? [] : matches) {
          await prisma.postingDepartment.create({
            data: {
              postingId: posting.id,
              departmentId: match.departmentId,
              matchedAlias: match.matchedAlias,
            },
          });
        }

        if (!existing && posting.isActive && matches.length > 0) {
          const departments = await prisma.department.findMany({
            where: { id: { in: matches.map((m) => m.departmentId) } },
            select: { id: true, slug: true },
          });
          await notifyUsersForMatchedPosting({
            postingTitle: title,
            departments: departments.map((d) => ({ departmentId: d.id, slug: d.slug })),
          });
        }
        // Kurum takibi: bolum eslesmesinden bagimsiz; yeni ilanda kurumu takip eden Pro uyelere.
        if (!existing && posting.isActive) await kurumTakipBildir(posting);

        await sleep(250);
      }
    }

    // Basta da yapiliyor ama yukaridaki upsert'ler suresi dolmus ilanlari yeniden aktif ediyordu.
    await expireOverduePostings();

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
