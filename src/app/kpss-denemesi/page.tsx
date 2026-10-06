import Link from "next/link";
import { GraduationCap, Clock, ListChecks } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { DENEME_DUZEYLERI, DUZEY_LABEL, SINAV_SURESI_DK, TOPLAM_SORU } from "@/lib/kpssDenemeSabitler";

export const metadata = { title: "KPSS Deneme Sınavı — Kamu Yolu" };
export const revalidate = 60;

export default async function KpssDenemesiHubPage() {
  const havuzSayilari = await prisma.denemeSoru.groupBy({ by: ["duzey"], _count: { _all: true } });
  const sayiByDuzey = new Map(havuzSayilari.map((h) => [h.duzey, h._count._all]));

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
      <SayfaBasligi
        ikon={GraduationCap}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "KPSS Denemesi" }]}
        baslik="KPSS Deneme Sınavı"
        aciklama="Her gün yenilenen, gerçek KPSS formatında deneme sınavına gir. O gün giren herkes aynı soruları görür; sınav bitince doğru/yanlış/boş sayılarını ve puanını görebilir, yanlış yaptığın sorulara dönüp doğru cevabı inceleyebilirsin."
        cipler={[
          { etiket: `${TOPLAM_SORU} soru`, ikon: ListChecks },
          { etiket: `${SINAV_SURESI_DK} dakika`, ikon: Clock },
          { etiket: "Her gün yenilenir", durum: "vurgu" },
        ]}
      />

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        {DENEME_DUZEYLERI.map((duzey) => {
          const hazirSoruSayisi = sayiByDuzey.get(duzey) ?? 0;
          const hazirMi = hazirSoruSayisi >= TOPLAM_SORU;
          return (
            <div key={duzey} className="flex flex-col rounded-2xl border border-primary/15 bg-white p-5">
              <h2 className="text-lg font-semibold text-slate-800">{DUZEY_LABEL[duzey]}</h2>
              <div className="mt-2 space-y-1 text-xs text-muted-foreground">
                <p className="flex items-center gap-1.5">
                  <ListChecks className="h-3.5 w-3.5" /> {TOPLAM_SORU} soru (60 Genel Yetenek + 60 Genel Kültür)
                </p>
                <p className="flex items-center gap-1.5">
                  <Clock className="h-3.5 w-3.5" /> {SINAV_SURESI_DK} dakika
                </p>
              </div>
              {hazirMi ? (
                <Link
                  href={`/kpss-denemesi/${duzey.toLowerCase()}`}
                  className="mt-4 inline-flex items-center justify-center rounded-lg bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  Sınava Başla
                </Link>
              ) : (
                <span className="mt-4 inline-flex items-center justify-center rounded-lg border border-dashed border-primary/25 px-4 py-2 text-sm font-medium text-muted-foreground">
                  Yakında
                </span>
              )}
            </div>
          );
        })}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        Sorular gerçek ÖSYM soruları değildir; Kamu Yolu tarafından KPSS formatına uygun olarak hazırlanan özgün
        deneme sorularıdır. Sınav sonundaki puan, resmi ÖSYM puanı değildir; sadece net üzerinden hesaplanan
        pratik bir deneme puanıdır.
      </p>
    </div>
  );
}
