import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { DERS_LABEL, DUZEY_LABEL } from "@/lib/kpssDenemeSabitler";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminIslemButonu } from "@/components/admin/AdminIslemButonu";
import type { EducationLevel } from "@/generated/prisma/client";
import { cn } from "@/lib/utils";

export const metadata = { title: "KPSS denemesi — Admin" };

const GUN_MS = 86_400_000;
const GUN = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", weekday: "short", timeZone: "UTC" });
const harf = (i: number) => String.fromCharCode(65 + i);

/** Son n gunun bitmis denemelerinde: cogunluk yanlis tek bir sikki seciyorsa cevap anahtari supheli. */
async function supheliSorular(simdi = Date.now()) {
  // ponytail: tum cevaplar bellekte toplanir; gunluk katilim binleri asarsa SQL'de jsonb_each ile toplanmali.
  const katilimlar = await prisma.denemeKatilim.findMany({
    where: { bitisZamani: { gte: new Date(simdi - 7 * GUN_MS) } },
    select: { cevaplar: true },
  });
  const dagilim = new Map<string, number[]>();
  for (const k of katilimlar) {
    for (const [soruId, c] of Object.entries(k.cevaplar as Record<string, number>)) {
      const d = dagilim.get(soruId) ?? [0, 0, 0, 0, 0];
      d[c]++;
      dagilim.set(soruId, d);
    }
  }
  const adaylar = [...dagilim].filter(([, d]) => d.reduce((a, b) => a + b, 0) >= 3);
  const sorular = await prisma.denemeSoru.findMany({
    where: { id: { in: adaylar.map(([id]) => id) } },
    select: { id: true, soruMetni: true, ders: true, dogruCevap: true },
  });
  return sorular
    .map((s) => {
      const d = dagilim.get(s.id)!;
      const toplam = d.reduce((a, b) => a + b, 0);
      const enCok = d.indexOf(Math.max(...d));
      return { ...s, d, toplam, enCok, oran: d[s.dogruCevap] / toplam };
    })
    .filter((s) => s.oran < 0.25 && s.enCok !== s.dogruCevap)
    .sort((a, b) => a.oran - b.oran)
    .slice(0, 10);
}

export default async function AdminKpssPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await adminSayfasi();
  const q = (await searchParams).q?.trim() ?? "";
  const [gunluk, bildirimler, supheli, aramaSonucu] = await Promise.all([
    prisma.$queryRaw<{ gun: Date; duzey: EducationLevel; giren: bigint; biten: bigint; ort: number | null }[]>`
      SELECT g.tarih AS gun, g.duzey, count(k.id) AS giren, count(k."bitisZamani") AS biten, avg(k.puan) AS ort
      FROM "GunlukDeneme" g LEFT JOIN "DenemeKatilim" k ON k."gunlukDenemeId" = g.id
      WHERE g.tarih >= ${new Date(Date.now() - 14 * GUN_MS)}
      GROUP BY g.tarih, g.duzey ORDER BY g.tarih DESC, g.duzey`,
    prisma.soruHataBildirimi.findMany({
      where: { cozuldu: null },
      orderBy: { createdAt: "desc" },
      include: { soru: { select: { id: true, soruMetni: true, ders: true, duzey: true } } },
    }),
    supheliSorular(),
    q.length >= 3
      ? prisma.denemeSoru.findMany({
          where: { OR: [{ id: q }, { soruMetni: { contains: q, mode: "insensitive" } }] },
          take: 20,
          select: { id: true, soruMetni: true, ders: true, duzey: true },
        })
      : Promise.resolve([]),
  ]);

  // Ayni sorunun bildirimleri tek kartta.
  const soruBazli = [...Map.groupBy(bildirimler, (b) => b.soruId).values()];

  return (
    <>
      <AdminBaslik baslik="KPSS denemesi" aciklama="Katılım istatistikleri, öğrencilerin hata bildirimleri ve cevap anahtarı şüpheli sorular. Soruyu düzeltince eski sonuçlar yeniden puanlanır." />

      <AdminKart
        baslik={`Hata bildirimleri · ${soruBazli.length} soru`}
        aciklama="Öğrenciler çözüm ekranındaki “Bu soruda hata var” bağlantısıyla bildirir."
        className={cn(soruBazli.length > 0 && "border-red-200")}
      >
        <ul className="space-y-3">
          {soruBazli.map((liste) => {
            const s = liste[0].soru;
            return (
              <li key={s.id} className="rounded-2xl border border-primary/10 p-3">
                <p className="line-clamp-2 text-sm font-semibold text-slate-900">{s.soruMetni}</p>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {DUZEY_LABEL[s.duzey]} · {DERS_LABEL[s.ders]} · {liste.length} bildirim
                </p>
                <ul className="mt-2 space-y-1">
                  {liste.map((b) => (
                    <li key={b.id} className="rounded-lg bg-slate-50 px-3 py-1.5 text-xs text-slate-700">
                      “{b.aciklama}”
                    </li>
                  ))}
                </ul>
                <div className="mt-2 flex gap-1.5">
                  <Link href={`/admin/kpss/soru/${s.id}`} className="rounded-lg bg-primary px-2.5 py-1.5 text-xs font-semibold text-primary-foreground">
                    Soruyu incele / düzelt
                  </Link>
                  <AdminIslemButonu yol="/api/admin/kpss/bildirim" govde={{ soruId: s.id }} etiket="Hata yok, kapat" />
                </div>
              </li>
            );
          })}
          {soruBazli.length === 0 && <li className="text-sm text-muted-foreground">Açık bildirim yok.</li>}
        </ul>
      </AdminKart>

      <AdminKart
        baslik="Cevap anahtarı şüpheli sorular · son 7 gün"
        aciklama="En az 3 kişinin cevapladığı, doğru oranı %25'in altında olan ve çoğunluğun aynı yanlış şıkkı seçtiği sorular. Anahtar yanlış olabilir, kontrol et."
      >
        <ul className="divide-y divide-primary/10">
          {supheli.map((s) => (
            <li key={s.id} className="flex flex-wrap items-center justify-between gap-3 py-2.5">
              <span className="min-w-0 flex-1">
                <Link href={`/admin/kpss/soru/${s.id}`} className="line-clamp-1 text-sm font-medium text-slate-900 hover:text-primary">
                  {s.soruMetni}
                </Link>
                <span className="text-xs text-muted-foreground">
                  {DERS_LABEL[s.ders]} · anahtar {harf(s.dogruCevap)} (%{Math.round(s.oran * 100)}) · en çok seçilen {harf(s.enCok)} (%{Math.round((s.d[s.enCok] / s.toplam) * 100)}) · {s.toplam} cevap
                </span>
              </span>
            </li>
          ))}
          {supheli.length === 0 && <li className="py-2 text-sm text-muted-foreground">Şüpheli soru yok.</li>}
        </ul>
      </AdminKart>

      <AdminKart baslik="Günlük katılım · son 14 gün">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-semibold">Gün</th>
                <th className="py-2 pr-3 font-semibold">Düzey</th>
                <th className="py-2 pr-3 font-semibold">Başlayan</th>
                <th className="py-2 pr-3 font-semibold">Bitiren</th>
                <th className="py-2 font-semibold">Ort. puan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5 tabular-nums">
              {gunluk.map((g) => (
                <tr key={`${g.gun.toISOString()}-${g.duzey}`}>
                  <td className="py-2 pr-3 text-slate-800">{GUN.format(g.gun)}</td>
                  <td className="py-2 pr-3">{DUZEY_LABEL[g.duzey]}</td>
                  <td className="py-2 pr-3">{Number(g.giren)}</td>
                  <td className="py-2 pr-3">{Number(g.biten)}</td>
                  <td className="py-2">{g.ort == null ? "—" : g.ort.toFixed(1)}</td>
                </tr>
              ))}
              {gunluk.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-4 text-center text-muted-foreground">
                    Son 14 günde deneme yok.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </AdminKart>

      <AdminKart baslik="Soru bul">
        <form className="flex gap-2">
          <input name="q" defaultValue={q} placeholder="Soru metninden bir parça ya da soru kimliği (en az 3 harf)" className="h-10 min-w-56 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm" />
          <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Ara
          </button>
        </form>
        <ul className="mt-3 divide-y divide-primary/10">
          {aramaSonucu.map((s) => (
            <li key={s.id} className="py-2">
              <Link href={`/admin/kpss/soru/${s.id}`} className="line-clamp-1 text-sm text-slate-900 hover:text-primary">
                {s.soruMetni}
              </Link>
              <span className="text-xs text-muted-foreground">
                {DUZEY_LABEL[s.duzey]} · {DERS_LABEL[s.ders]}
              </span>
            </li>
          ))}
          {q.length >= 3 && aramaSonucu.length === 0 && <li className="py-2 text-sm text-muted-foreground">Soru bulunamadı.</li>}
        </ul>
      </AdminKart>
    </>
  );
}
