import Link from "next/link";
import { BookOpen, ChartColumnBig, Clock, GraduationCap, History, ListChecks, MousePointerClick, School, Timer } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { bugunkuDurumlar, haftalikHak, sonDenemeler } from "@/lib/kpssDeneme";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { KilitliOzellik } from "@/components/KilitliOzellik";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import {
  DENEME_DUZEYLERI,
  DERS_DAGILIMI,
  DERS_LABEL,
  DERS_RENGI,
  DERS_SIRASI,
  DUZEY_LABEL,
  DUZEY_TEMA,
  SINAV_SURESI_DK,
  TOPLAM_SORU,
  type DenemeDuzeyi,
} from "@/lib/kpssDenemeSabitler";
import { cn } from "@/lib/utils";

export const metadata = { title: "KPSS Deneme Sınavı — Kamu Yolu" };

const DUZEY_IKONU = { LISE: School, ONLISANS: BookOpen, LISANS: GraduationCap } as const;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" }); // GunlukDeneme.tarih UTC gece yarisi
const fmt = (n: number) => n.toLocaleString("tr-TR", { maximumFractionDigits: 2 });

const ADIMLAR = [
  { ikon: MousePointerClick, baslik: "Düzeyini seç", metin: "Ortaöğretim, Önlisans ya da Lisans; her düzeyin kendi günlük denemesi var." },
  { ikon: Timer, baslik: `${SINAV_SURESI_DK} dakikada ${TOPLAM_SORU} soru`, metin: "Gerçek KPSS formatı ve süresi. Soruları işaretleyip sonra dönebilirsin." },
  { ikon: ChartColumnBig, baslik: "Raporunu al", metin: "Pro'da ders karnen ve konu bazlı uyarılar, Pro+'da önceki denemene göre gelişimin hazır." },
];

export default async function KpssDenemesiHubPage() {
  const user = await getCurrentUser();
  const [havuzSayilari, durumlar, gecmis, hak] = await Promise.all([
    prisma.denemeSoru.groupBy({ by: ["duzey"], _count: { _all: true } }),
    user ? bugunkuDurumlar(user.id) : null,
    user ? sonDenemeler(user.id) : [],
    user ? haftalikHak(user.id, user.abonelikPlani) : null,
  ]);
  const sayiByDuzey = new Map(havuzSayilari.map((h) => [h.duzey, h._count._all]));

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={GraduationCap}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "KPSS Denemesi" }]}
        baslik="KPSS Deneme Sınavı"
        aciklama="Her gün yenilenen, gerçek KPSS formatında deneme. O gün giren herkes aynı soruları görür; Pro'da sınav sonunda ders karnen ve konu bazlı çalışma tavsiyelerin hazırlanır."
        cipler={[
          { etiket: `${TOPLAM_SORU} soru`, ikon: ListChecks },
          { etiket: `${SINAV_SURESI_DK} dakika`, ikon: Clock },
          { etiket: "Her gün yenilenir", durum: "vurgu" },
        ]}
      />

      <div className="mt-8 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/10 bg-white px-5 py-3 text-sm shadow-sm">
        <p className="text-slate-700">
          {!user ? (
            "Ücretsiz planda haftada toplam 1, Pro'da toplam 3 deneme; Pro+'da sınırsız. Sınav sonu rapor Pro ile açılır."
          ) : hak?.limit === null ? (
            <>
              <strong className="text-slate-900">Pro+</strong> · Sınırsız deneme, rapor ve konu gelişim takibi açık.
            </>
          ) : (
            <>
              Bu hafta toplam <strong className="text-slate-900 tabular-nums">{hak?.kullanilan}/{hak?.limit}</strong> deneme hakkını kullandın (tüm düzeyler dahil)
              {user.abonelikPlani === "UCRETSIZ" ? " · Sınav sonu rapor Pro'da" : " · Konu gelişim takibi Pro+'da"}. Hak pazartesi yenilenir.
            </>
          )}
        </p>
        {user?.abonelikPlani !== "PRO_PLUS" && (
          <YukseltButonu
            plan={user?.abonelikPlani === "PRO" ? "PRO_PLUS" : undefined}
            kaynak="deneme-hakki"
            className="shrink-0 text-sm font-semibold text-primary hover:underline"
          >
            Planları gör →
          </YukseltButonu>
        )}
      </div>

      <div className="mt-5 grid gap-5 md:grid-cols-3">
        {DENEME_DUZEYLERI.map((d) => {
          const duzey = d as DenemeDuzeyi;
          const tema = DUZEY_TEMA[duzey];
          const Ikon = DUZEY_IKONU[duzey];
          const hazir = (sayiByDuzey.get(duzey) ?? 0) >= TOPLAM_SORU;
          const bugun = durumlar?.get(duzey);
          const href = `/kpss-denemesi/${duzey.toLowerCase()}`;
          return (
            <article key={duzey} className="flex flex-col overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm transition-shadow hover:shadow-xl hover:shadow-primary/10">
              <div className={cn("relative overflow-hidden bg-gradient-to-br px-6 pt-6 pb-5 text-white", tema.zemin)}>
                <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:18px_18px]" />
                <Ikon aria-hidden className="absolute -right-5 -bottom-7 h-32 w-32 text-white/15" strokeWidth={1.25} />
                <div className="relative">
                  <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/15 ring-1 ring-white/30">
                    <Ikon className="h-6 w-6" />
                  </span>
                  <h2 className="mt-3 font-sans text-2xl font-bold tracking-tight">{DUZEY_LABEL[duzey]}</h2>
                  <p className="mt-1 text-xs font-semibold text-white/85">{hazir ? "Bugünün denemesi hazır" : "Soru havuzu hazırlanıyor"}</p>
                </div>
              </div>

              <div className="flex flex-1 flex-col p-6">
                <p className="flex items-center gap-3 text-sm text-slate-600">
                  <span className="flex items-center gap-1.5">
                    <ListChecks className="h-4 w-4" /> {TOPLAM_SORU} soru
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="h-4 w-4" /> {SINAV_SURESI_DK} dk
                  </span>
                </p>
                <div className="mt-4 flex h-2 gap-0.5 overflow-hidden rounded-full" title="Derslerin soru dağılımı">
                  {DERS_SIRASI.map((ders) => (
                    <div key={ders} className={DERS_RENGI[ders]} style={{ width: `${(DERS_DAGILIMI[ders] / TOPLAM_SORU) * 100}%` }} />
                  ))}
                </div>
                <ul className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
                  {DERS_SIRASI.map((ders) => (
                    <li key={ders} className="flex items-center gap-1">
                      <span className={cn("h-1.5 w-1.5 rounded-full", DERS_RENGI[ders])} />
                      {DERS_LABEL[ders]} {DERS_DAGILIMI[ders]}
                    </li>
                  ))}
                </ul>

                <div className="mt-auto pt-6">
                  {!hazir ? (
                    <span className="flex justify-center rounded-full border border-dashed border-primary/25 px-4 py-2.5 text-sm font-medium text-muted-foreground">Yakında</span>
                  ) : bugun?.durum === "bitti" ? (
                    <div className="space-y-3">
                      <p className={cn("flex items-baseline justify-between rounded-2xl px-4 py-3", tema.acik)}>
                        <span className="text-xs font-semibold text-slate-600">Bugünkü puanın</span>
                        <span className={cn("text-2xl font-bold tabular-nums", tema.metin)}>{bugun.puan === null ? "—" : fmt(bugun.puan)}</span>
                      </p>
                      <Link href={href} className="flex justify-center rounded-full border border-primary/20 px-4 py-2.5 text-sm font-bold text-slate-800 hover:bg-slate-50">
                        {user?.abonelikPlani === "UCRETSIZ" ? "Sonucunu gör" : "Raporunu gör"}
                      </Link>
                    </div>
                  ) : bugun?.durum === "suruyor" ? (
                    <Link href={href} className="flex justify-center rounded-full bg-amber-500 px-4 py-2.5 text-sm font-bold text-white hover:bg-amber-600">
                      Süren işliyor · Devam et
                    </Link>
                  ) : hak?.doldu && user ? (
                    <KilitliOzellik
                      kompakt
                      mevcutPlan={user.abonelikPlani}
                      gerekenPlan={user.abonelikPlani === "UCRETSIZ" ? "PRO" : "PRO_PLUS"}
                      kaynak="deneme-hakki"
                      baslik={`Haftalık toplam ${hak.limit} hakkın doldu`}
                    >
                      <div className="flex min-h-40 items-end">
                        <span className={cn("flex w-full justify-center rounded-full px-4 py-2.5 text-sm font-bold text-white", tema.buton)}>
                          Sınava Başla
                        </span>
                      </div>
                    </KilitliOzellik>
                  ) : (
                    <Link href={href} className={cn("flex justify-center rounded-full px-4 py-2.5 text-sm font-bold text-white", tema.buton)}>
                      Sınava Başla
                    </Link>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <section className="mt-12">
        <h2 className="font-sans text-xl font-bold tracking-tight text-slate-900">Nasıl çalışır?</h2>
        <ol className="mt-4 grid gap-4 md:grid-cols-3">
          {ADIMLAR.map(({ ikon: Ikon, baslik, metin }, i) => (
            <li key={baslik} className="flex gap-4 rounded-3xl border border-primary/10 bg-white p-5 shadow-sm">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                <Ikon className="h-5 w-5" />
              </span>
              <span>
                <span className="text-xs font-bold text-muted-foreground">{i + 1}. adım</span>
                <span className="block font-semibold text-slate-900">{baslik}</span>
                <span className="mt-0.5 block text-sm text-slate-600">{metin}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {gecmis.length > 0 && (
        <section className="mt-12">
          <h2 className="flex items-center gap-2 font-sans text-xl font-bold tracking-tight text-slate-900">
            <History className="h-5 w-5 text-primary" />
            Son denemelerin
          </h2>
          <div className="mt-4 overflow-x-auto rounded-3xl border border-primary/10 bg-white shadow-sm">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-primary/10 text-xs text-muted-foreground">
                <tr>
                  <th className="px-5 py-3 font-semibold">Tarih</th>
                  <th className="px-5 py-3 font-semibold">Düzey</th>
                  <th className="px-5 py-3 text-right font-semibold">D / Y / B</th>
                  <th className="px-5 py-3 text-right font-semibold">Net</th>
                  <th className="px-5 py-3 text-right font-semibold">Puan</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {gecmis.map((g) => {
                  const tema = DUZEY_TEMA[g.duzey as DenemeDuzeyi];
                  return (
                    <tr key={g.id}>
                      <td className="px-5 py-3 whitespace-nowrap text-slate-700">{TARIH.format(g.tarih)}</td>
                      <td className="px-5 py-3">
                        <span className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", tema?.acik, tema?.metin)}>{DUZEY_LABEL[g.duzey]}</span>
                      </td>
                      <td className="px-5 py-3 text-right whitespace-nowrap text-slate-600 tabular-nums">
                        {g.dogru} / {g.yanlis} / {g.bos}
                      </td>
                      <td className="px-5 py-3 text-right font-semibold tabular-nums">{fmt(g.net)}</td>
                      <td className="px-5 py-3 text-right font-bold text-slate-900 tabular-nums">{fmt(g.puan)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
      )}

      <p className="mt-10 text-xs text-muted-foreground">
        Sorular gerçek ÖSYM soruları değildir; Kamu Yolu tarafından KPSS formatına uygun olarak hazırlanan özgün deneme sorularıdır. Sınav
        sonundaki puan resmi ÖSYM puanı değildir; net üzerinden hesaplanan pratik bir deneme puanıdır.
      </p>
    </div>
  );
}
