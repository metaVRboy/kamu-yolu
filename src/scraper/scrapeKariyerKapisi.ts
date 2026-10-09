import { PrismaClient } from "@/generated/prisma/client";
import { InstitutionType } from "@/generated/prisma/enums";
import {
  fetchAltIlanlar,
  fetchIlanList,
  fetchIlanPreview,
  ilanDetayUrl,
  type SearchIlan,
} from "./kariyerKapisiClient";
import { classifyRequirementText, detectInstitutionType, stripBbCode } from "./parseRequirements";
import { notifyUsersForMatchedPosting } from "@/lib/notifications";
import {
  buildCrossSourceDuplicateIndex,
  removeCrossSourceDuplicate,
  expireOverduePostings,
  type CrossSourceDuplicateIndex,
} from "@/lib/postingDedupe";

export const SOURCE_NAME = "Kariyer Kapısı";

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

/**
 * Tek bir pozisyon/ilan icin ham metni siniflandirip veritabanina isler
 * (upsert + bolum eslesmeleri + yeni eslesme bildirimi). Hem unvan/alt
 * ilan kirilimi olan hem olmayan ilanlar tarafindan ortak kullanilir.
 */
async function upsertPosting(
  prisma: PrismaClient,
  params: {
    externalId: string;
    title: string;
    ilan: SearchIlan;
    institutionType: InstitutionType;
    sourceUrl: string;
    requirementText: string;
    iller: string[];
  },
  unmatchedTexts: string[],
  dupIndex: CrossSourceDuplicateIndex,
): Promise<void> {
  const { externalId, title, ilan, institutionType, sourceUrl, requirementText, iller } = params;

  // "Isci Ilanlari" turundeki ilanlarin Kariyer Kapisi'ndaki metni genelde
  // sadece Iskur uzerinden nasil basvurulacagini anlatir - egitim
  // seviyesi/bolum sartina dair bilgi icermez (asil kriterler Iskur'un
  // kendi il bazli "Acik Is" sisteminde). Bu turde toplu iscii kadrolari
  // pratikte neredeyse hicbir zaman bolume ozel degildir ve taban seviyesi
  // genelde ortaogretimdir - metin bosken LISANS/kisitli varsaymak yerine
  // bu daha gercekci varsayilanlar kullanilir.
  const isciIlaniMi = ilan.ilanTuru === "İşçi İlanları";
  const { educationLevels, isDepartmentRestricted, matches } = await classifyRequirementText(
    requirementText,
    isciIlaniMi,
  );
  if (matches.length === 0) {
    unmatchedTexts.push(requirementText.slice(0, 200));
  }

  // Ayni gercek ilan Memurlar.Net gibi baska bir kaynaktan da gelmis
  // olabilir - varsa o eski kaydi kaldirip yerine bu (en guncel islenen)
  // kaydin durmasini sagla.
  await removeCrossSourceDuplicate(dupIndex, { institutionName: ilan.kurumAdi, title });

  const existing = await prisma.posting.findUnique({
    where: { externalId },
    select: { id: true, adminGizli: true, adminDuzenledi: true },
  });
  // Admin duzeltmeleri korunur: gizlenen ilan aktiflesmez, duzenlenen alanlar ezilmez.
  const adminKoru = existing?.adminDuzenledi ?? false;

  const posting = await prisma.posting.upsert({
    where: { externalId },
    update: {
      ...(!adminKoru && {
        title,
        institutionName: ilan.kurumAdi,
        educationLevels,
        isDepartmentRestricted,
        applicationStart: ilan.basTarih ? new Date(ilan.basTarih) : null,
        applicationEnd: ilan.bitTarih ? new Date(ilan.bitTarih) : null,
      }),
      institutionType,
      ilanTuru: ilan.ilanTuru ?? null,
      iller,
      sourceUrl,
      departmentRequirementRaw: requirementText,
      isActive: !existing?.adminGizli,
      scrapedAt: new Date(),
    },
    create: {
      externalId,
      title,
      institutionName: ilan.kurumAdi,
      institutionType,
      ilanTuru: ilan.ilanTuru ?? null,
      iller,
      sourceName: SOURCE_NAME,
      sourceUrl,
      educationLevels,
      departmentRequirementRaw: requirementText,
      isDepartmentRestricted,
      applicationStart: ilan.basTarih ? new Date(ilan.basTarih) : null,
      applicationEnd: ilan.bitTarih ? new Date(ilan.bitTarih) : null,
      publishedAt: ilan.basTarih ? new Date(ilan.basTarih) : new Date(),
      isActive: true,
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

  // Sadece yeni eklenen ilanlar icin bildirim gonder; her taramada
  // ayni aktif ilan icin tekrar tekrar bildirim gitmesin.
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
}

/**
 * Kariyer Kapisi'ndaki aktif ilanlari cekip veritabanini gunceller.
 * Her cagri icin bir ScrapeRun kaydi tutar, boylece otomatik/zamanlanmis
 * calismalarin basarili olup olmadigi ve ne zaman calistigi denetlenebilir.
 */
// Yerel gorevin log'unda nerede takildigi gorulsun diye saatli adim satirlari.
const adim = (mesaj: string) => console.log(`[${new Date().toLocaleTimeString("tr-TR", { timeZone: "Europe/Istanbul" })}] ${mesaj}`);

export async function scrapeKariyerKapisi(
  prisma: PrismaClient,
): Promise<ScrapeSummary> {
  const run = await prisma.scrapeRun.create({
    data: { sourceName: SOURCE_NAME, status: "RUNNING" },
  });

  try {
    adim("Süresi geçen ilanlar kapatılıyor");
    await expireOverduePostings();

    adim("İlan listesi alınıyor");
    const ilanList = await fetchIlanList();
    adim(`${ilanList.length} ilan listelendi`);

    const seenExternalIds = new Set<string>();
    const unmatchedTexts: string[] = [];
    const dupIndex = await buildCrossSourceDuplicateIndex(SOURCE_NAME);

    for (const [i, ilan] of ilanList.entries()) {
      if (ilan.sonDurumu !== "Aktif") continue;
      adim(`${i + 1}/${ilanList.length} ${ilan.kurumAdi}`);

      let altIlanlar;
      try {
        altIlanlar = await fetchAltIlanlar(ilan.guid);
      } catch (err) {
        console.error(`Alt ilan çekilemedi (${ilan.guid}):`, err);
        continue;
      }

      const institutionType = detectInstitutionType(ilan.kurumAdi);
      const sourceUrl = ilanDetayUrl(ilan.guid);

      // Bazi ilan turleri (ozellikle "Isci Ilanlari") unvan/pozisyon
      // kirilimi (alt ilan) kullanmiyor - bunlar icin alt ilan listesi
      // hep bos doner. Bu durumda ilanin tam metnini ayri bir uc
      // noktadan alip tek bir posting olarak isliyoruz; aksi halde bu
      // ilanlar sessizce hic islenmeden atlaniyordu.
      if (altIlanlar.length === 0) {
        const externalId = `kariyerkapisi:${ilan.guid}`;
        seenExternalIds.add(externalId);

        let preview;
        try {
          preview = await fetchIlanPreview(ilan.guid);
        } catch (err) {
          console.error(`İlan önizlemesi çekilemedi (${ilan.guid}):`, err);
          await sleep(300);
          continue;
        }

        await upsertPosting(
          prisma,
          {
            externalId,
            title: preview.ilanBaslik || ilan.ilanBaslik || ilan.kurumAdi,
            ilan,
            institutionType,
            sourceUrl,
            requirementText: stripBbCode(preview.ilanMetni ?? ""),
            iller: [],
          },
          unmatchedTexts,
          dupIndex,
        );

        await sleep(300);
        continue;
      }

      for (let i = 0; i < altIlanlar.length; i++) {
        const alt = altIlanlar[i];
        const externalId = `kariyerkapisi:${ilan.guid}:${i}`;
        seenExternalIds.add(externalId);

        const iller = Array.from(
          new Set((alt.kontenjanList ?? []).map((k) => k.il.trim()).filter(Boolean)),
        );

        await upsertPosting(
          prisma,
          {
            externalId,
            title: `${alt.unvan} — ${ilan.kurumAdi}`,
            ilan,
            institutionType,
            sourceUrl,
            requirementText: stripBbCode(alt.ilanMetni ?? ""),
            iller,
          },
          unmatchedTexts,
          dupIndex,
        );
      }

      await sleep(300);
    }

    await prisma.posting.updateMany({
      where: { isDemo: true, isActive: true },
      data: { isActive: false },
    });

    const staleResult = await prisma.posting.updateMany({
      where: {
        sourceName: SOURCE_NAME,
        isActive: true,
        externalId: { notIn: Array.from(seenExternalIds) },
      },
      data: { isActive: false },
    });

    const summary: ScrapeSummary = {
      postingsFound: ilanList.length,
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
