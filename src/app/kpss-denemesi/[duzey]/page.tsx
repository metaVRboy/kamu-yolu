import Link from "next/link";
import type { ReactNode } from "react";
import { notFound } from "next/navigation";
import { ArrowLeft, CalendarCheck, Clock, Flag, GraduationCap, LayoutGrid, ListChecks, MinusCircle, Target } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getBugununDenemesi,
  getDenemeSorulari,
  getKatilim,
  denemeyiBitir,
  kalanSureMs,
  oncekiDenemeOzeti,
  sinavaGuvenliHaleGetir,
} from "@/lib/kpssDeneme";
import {
  DUZEY_LABEL,
  DUZEY_TEMA,
  SINAV_SURESI_DK,
  TOPLAM_SORU,
  DERS_DAGILIMI,
  DERS_LABEL,
  DERS_RENGI,
  DERS_SIRASI,
  ONERILEN_SURE_DK,
  gecerliDenemeDuzeyiMi,
  type DenemeDuzeyi,
} from "@/lib/kpssDenemeSabitler";
import { DenemeBaslaButonu } from "@/components/DenemeBaslaButonu";
import { DenemeSinavi } from "@/components/DenemeSinavi";
import { DenemeSonucEkrani } from "@/components/DenemeSonucEkrani";
import { cn } from "@/lib/utils";

const GUN = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", weekday: "long", timeZone: "Europe/Istanbul" });
const KISA_GUN = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", timeZone: "UTC" }); // GunlukDeneme.tarih UTC gece yarisi

const KURALLAR = [
  { ikon: Clock, metin: `${SINAV_SURESI_DK} dakika; süre başladıktan sonra durdurulamaz.` },
  { ikon: MinusCircle, metin: "4 yanlış 1 doğruyu götürür; emin olmadığın soruyu boş bırakabilirsin." },
  { ikon: CalendarCheck, metin: "Bu düzeyde günde bir kez sınava girebilirsin." },
  { ikon: Flag, metin: "Soruları işaretleyip sonra dönebilirsin." },
  { ikon: LayoutGrid, metin: "Soru haritasıyla bölümler arasında serbestçe gezinebilirsin." },
];

/** Baslangic ekrani: duzey renginde bant, bolumler/sureler tablosu, kurallar ve eylem alani. */
function BaslangicKarti({ duzey, eylem }: { duzey: DenemeDuzeyi; eylem: ReactNode }) {
  const tema = DUZEY_TEMA[duzey];
  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6">
      <Link href="/kpss-denemesi" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-3.5 w-3.5" />
        Diğer düzeyler
      </Link>
      <section className="mt-4 overflow-hidden rounded-3xl border border-primary/10 bg-white shadow-sm">
        <div className={cn("relative overflow-hidden bg-gradient-to-br px-6 py-8 text-white sm:px-8", tema.zemin)}>
          <div aria-hidden className="absolute inset-0 opacity-20 [background-image:radial-gradient(circle,white_1px,transparent_1.5px)] [background-size:18px_18px]" />
          <GraduationCap aria-hidden className="absolute -right-6 -bottom-10 h-48 w-48 text-white/10" strokeWidth={1.25} />
          <div className="relative">
            <p className="text-xs font-bold tracking-widest text-white/80 uppercase">Bugünün denemesi · {GUN.format(new Date())}</p>
            <h1 className="mt-2 font-sans text-3xl font-bold tracking-tight">{DUZEY_LABEL[duzey]} KPSS Denemesi</h1>
            <div className="mt-4 flex flex-wrap gap-2 text-sm font-semibold">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25">
                <ListChecks className="h-4 w-4" /> {TOPLAM_SORU} soru
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25">
                <Clock className="h-4 w-4" /> {SINAV_SURESI_DK} dakika
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 ring-1 ring-white/25">60 Genel Yetenek + 60 Genel Kültür</span>
            </div>
          </div>
        </div>

        <div className="grid gap-8 p-6 sm:p-8 md:grid-cols-[minmax(0,1fr)_17rem]">
          <div>
            <h2 className="text-sm font-bold text-slate-900">Bölümler</h2>
            <div className="mt-3 flex h-2.5 gap-0.5 overflow-hidden rounded-full" aria-hidden>
              {DERS_SIRASI.map((d) => (
                <div key={d} className={DERS_RENGI[d]} style={{ width: `${(DERS_DAGILIMI[d] / TOPLAM_SORU) * 100}%` }} />
              ))}
            </div>
            <table className="mt-3 w-full text-sm">
              <thead className="text-xs text-muted-foreground">
                <tr>
                  <th className="py-1.5 text-left font-medium">Ders</th>
                  <th className="py-1.5 text-right font-medium">Soru</th>
                  <th className="py-1.5 text-right font-medium">Önerilen süre</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-primary/5">
                {DERS_SIRASI.map((d) => (
                  <tr key={d}>
                    <td className="py-2">
                      <span className="flex items-center gap-2 font-medium text-slate-800">
                        <span className={cn("h-2.5 w-2.5 rounded-full", DERS_RENGI[d])} />
                        {DERS_LABEL[d]}
                      </span>
                    </td>
                    <td className="py-2 text-right tabular-nums text-slate-700">{DERS_DAGILIMI[d]}</td>
                    <td className="py-2 text-right tabular-nums text-slate-700">~{ONERILEN_SURE_DK[d]} dk</td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t border-primary/10 font-bold text-slate-900">
                  <td className="pt-2">Toplam</td>
                  <td className="pt-2 text-right tabular-nums">{TOPLAM_SORU}</td>
                  <td className="pt-2 text-right tabular-nums">{SINAV_SURESI_DK} dk</td>
                </tr>
              </tfoot>
            </table>
          </div>

          <div>
            <h2 className="text-sm font-bold text-slate-900">Kurallar</h2>
            <ul className="mt-3 space-y-3">
              {KURALLAR.map(({ ikon: Ikon, metin }) => (
                <li key={metin} className="flex items-start gap-2.5 text-sm text-slate-700">
                  <span className={cn("flex h-7 w-7 shrink-0 items-center justify-center rounded-lg", tema.acik, tema.metin)}>
                    <Ikon className="h-4 w-4" />
                  </span>
                  {metin}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className={cn("flex flex-col items-center gap-3 border-t px-6 py-6 text-center sm:px-8", tema.kenar, tema.acik)}>
          {eylem}
          <p className="flex items-center gap-1.5 text-xs text-slate-600">
            <Target className={cn("h-3.5 w-3.5", tema.metin)} />
            Sınav sonunda ders karnen ve konu bazlı çalışma tavsiyelerin hazırlanır.
          </p>
        </div>
      </section>
    </div>
  );
}

export default async function KpssDenemesiDuzeyPage({ params }: { params: Promise<{ duzey: string }> }) {
  const { duzey: slug } = await params;
  const duzeyAdi = slug.toUpperCase();
  if (!gecerliDenemeDuzeyiMi(duzeyAdi) || !(duzeyAdi in DUZEY_TEMA)) notFound();
  const duzey = duzeyAdi as DenemeDuzeyi;
  const tema = DUZEY_TEMA[duzey];

  const user = await getCurrentUser();

  let gunlukDeneme;
  try {
    gunlukDeneme = await getBugununDenemesi(duzey);
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-slate-800">{DUZEY_LABEL[duzey]} denemesi henüz hazır değil</h1>
        <p className="mt-2 text-sm text-muted-foreground">Bu düzey için soru havuzu hazırlanıyor, çok yakında burada olacak.</p>
        <Link href="/kpss-denemesi" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          ← Diğer düzeylere dön
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <BaslangicKarti
        duzey={duzey}
        eylem={
          <>
            <p className="text-sm font-medium text-slate-700">Sınava girebilmek için giriş yapmalısın.</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link href="/giris" className={cn("rounded-full px-6 py-2.5 text-sm font-bold text-white", tema.buton)}>
                Giriş Yap
              </Link>
              <Link href="/kayit-ol" className="rounded-full border border-primary/20 bg-white px-6 py-2.5 text-sm font-bold text-primary hover:bg-primary/5">
                Ücretsiz Kayıt Ol
              </Link>
            </div>
          </>
        }
      />
    );
  }

  let katilim = await getKatilim(user.id, gunlukDeneme.id);

  // Sure dolmus ama hic bitirilmemis (ör. sekme kapatildi) - otomatik sonuclandir.
  if (katilim && !katilim.bitisZamani && kalanSureMs(katilim.baslangicZamani) <= 0) {
    katilim = await denemeyiBitir(katilim.id, user.id);
  }

  if (!katilim) {
    return <BaslangicKarti duzey={duzey} eylem={<DenemeBaslaButonu duzeySlug={slug} renk={tema.buton} />} />;
  }

  const sorular = await getDenemeSorulari(gunlukDeneme.soruIdler);

  if (katilim.bitisZamani) {
    const onceki = await oncekiDenemeOzeti(user.id, duzey, katilim.id);
    return (
      <DenemeSonucEkrani
        sorular={sorular}
        cevaplar={katilim.cevaplar as Record<string, number>}
        dogruSayisi={katilim.dogruSayisi ?? 0}
        yanlisSayisi={katilim.yanlisSayisi ?? 0}
        bosSayisi={katilim.bosSayisi ?? 0}
        puan={katilim.puan ?? 0}
        duzey={duzey}
        onceki={onceki && { ...onceki, tarihMetni: KISA_GUN.format(onceki.tarih) }}
      />
    );
  }

  return (
    <DenemeSinavi
      katilimId={katilim.id}
      ilkKalanMs={kalanSureMs(katilim.baslangicZamani)}
      sorular={sinavaGuvenliHaleGetir(sorular)}
      ilkCevaplar={katilim.cevaplar as Record<string, number>}
    />
  );
}
