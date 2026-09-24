import { prisma } from "@/lib/prisma";
import { normalize } from "@/lib/matching";

function extractHeadcount(title: string): number | null {
  const m = title.match(/\b(\d{1,4})\b/);
  return m ? Number(m[1]) : null;
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
 */
export async function removeCrossSourceDuplicate(params: {
  institutionName: string;
  title: string;
  sourceName: string;
}): Promise<void> {
  const headcount = extractHeadcount(params.title);
  if (!headcount) return;

  const normKurum = normalize(params.institutionName);

  const adaylar = await prisma.posting.findMany({
    where: { isActive: true, sourceName: { not: params.sourceName } },
    select: { id: true, institutionName: true, title: true },
  });

  for (const aday of adaylar) {
    if (normalize(aday.institutionName) !== normKurum) continue;
    if (extractHeadcount(aday.title) !== headcount) continue;
    await prisma.posting.delete({ where: { id: aday.id } });
  }
}
