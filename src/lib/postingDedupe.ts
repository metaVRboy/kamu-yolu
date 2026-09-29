import { prisma } from "@/lib/prisma";
import { normalize } from "@/lib/matching";

function extractHeadcount(title: string): number | null {
  const m = title.match(/\b(\d{1,4})\b/);
  return m ? Number(m[1]) : null;
}

function buildSignature(institutionName: string, title: string): string | null {
  const headcount = extractHeadcount(title);
  if (!headcount) return null;
  return `${normalize(institutionName)}::${headcount}`;
}

export type CrossSourceDuplicateIndex = Map<string, string>;

/**
 * Diger kaynaklardaki (ör. Memurlar.Net taranirken Kariyer Kapisi'ndan
 * gelenler) aktif ilanlarin imza -> id eslemesini TEK SEFERDE cikarir.
 * Onceden bu sorgu, taranan HER ilan icin ayri ayri (yuzlerce kez)
 * calisiyordu - bu, Neon'un sorgu/compute kotasini gereksiz yere
 * tuketen en buyuk kaynaklardan biriydi.
 */
export async function buildCrossSourceDuplicateIndex(
  excludeSourceName: string,
): Promise<CrossSourceDuplicateIndex> {
  const postings = await prisma.posting.findMany({
    where: { isActive: true, sourceName: { not: excludeSourceName } },
    select: { id: true, institutionName: true, title: true },
  });

  const index: CrossSourceDuplicateIndex = new Map();
  for (const p of postings) {
    const sig = buildSignature(p.institutionName, p.title);
    if (sig) index.set(sig, p.id);
  }
  return index;
}

/**
 * Ayni gercek ilan birden fazla kaynaktan (ör. Kariyer Kapisi VE
 * Memurlar.Net) gelebilir. Kurum adi ayni VE basliktaki kadro sayisi
 * ayniysa ayni ilan kabul edilir; diger kaynaktaki eski kayit silinir ki
 * kullaniciya ayni ilan iki kez gosterilmesin - her zaman en son islenen
 * kaynagin verisi kalir.
 *
 * Kadro sayisi basliginda gecmeyen ilanlar (ör. "Öğretim Üyesi Alım
 * İlanı") icin guvenilir bir imza olusturulamadigindan dokunulmaz -
 * yanlislikla alakasiz bir ilani silmektense nadir bir kopyayi tolere
 * etmek daha guvenlidir.
 *
 * `index`, tarama basina buildCrossSourceDuplicateIndex ile BIR KEZ
 * olusturulup her ilan icin tekrar kullanilmalidir (ekstra sorgu yok).
 */
export async function removeCrossSourceDuplicate(
  index: CrossSourceDuplicateIndex,
  params: { institutionName: string; title: string },
): Promise<void> {
  const sig = buildSignature(params.institutionName, params.title);
  if (!sig) return;

  const matchId = index.get(sig);
  if (!matchId) return;

  await prisma.posting.delete({ where: { id: matchId } });
  index.delete(sig);
}
