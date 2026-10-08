import { AlertTriangle, CheckCircle2, Info } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { taramaKaynaklari } from "@/lib/adminIlan";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminTaramaButonu } from "@/components/admin/AdminTaramaButonu";
import { cn } from "@/lib/utils";

export const metadata = { title: "Taramalar — Admin" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
const TAKILMA_MS = 15 * 60_000;

/** RUNNING ama 15 dk'dan uzun: islem yarida kesilmis (bilgisayar kapandi, zaman asimi). */
function durumEtiketi(r: { status: string; startedAt: Date }, simdi = Date.now()) {
  if (r.status === "SUCCESS") return { ad: "başarılı", renk: "bg-emerald-50 text-emerald-700" };
  if (r.status === "FAILED") return { ad: "başarısız", renk: "bg-red-50 text-red-700" };
  return simdi - r.startedAt.getTime() > TAKILMA_MS ? { ad: "yarıda kaldı", renk: "bg-amber-50 text-amber-700" } : { ad: "çalışıyor", renk: "bg-sky-50 text-sky-700" };
}

export default async function AdminTaramalarPage() {
  await adminSayfasi();
  const [kaynaklar, gecmis] = await Promise.all([taramaKaynaklari(), prisma.scrapeRun.findMany({ orderBy: { startedAt: "desc" }, take: 40 })]);
  const kk = kaynaklar.find((k) => k.sourceName === "Kariyer Kapısı");

  return (
    <>
      <AdminBaslik baslik="Taramalar" aciklama="İlan ve haber taramaları her gün 09, 12, 15 ve 18'de kendiliğinden çalışır. Beklemek istemezsen buradan şimdi çalıştırabilirsin." />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {kaynaklar.map((k) => (
          <div key={k.sourceName} className={cn("rounded-3xl border bg-white p-5 shadow-sm", k.gecikti ? "border-red-200 bg-red-50/60" : "border-primary/10")}>
            <p className="flex items-center gap-2 text-sm font-bold text-slate-900">
              {k.gecikti ? <AlertTriangle className="h-4 w-4 text-red-600" /> : <CheckCircle2 className="h-4 w-4 text-emerald-600" />}
              {k.sourceName}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              Son başarılı: {k.sonBasari ? TARIH.format(k.sonBasari) : "hiç"}
              {k.ilanSayisi != null && ` · ${k.ilanSayisi} ilan`}
            </p>
          </div>
        ))}
      </div>

      <AdminKart baslik="Şimdi çalıştır">
        <div className="flex flex-wrap gap-2">
          <AdminTaramaButonu yol="/api/scrape-memurlar" etiket="Memurlar.net ilanlarını tara" />
          <AdminTaramaButonu yol="/api/haber-arastir" etiket="Haberleri araştır" />
          <AdminTaramaButonu yol="/api/kamu-alim-haber-arastir" etiket="Kamu alım haberlerini araştır" />
        </div>
      </AdminKart>

      <div className="flex items-start gap-3 rounded-3xl border border-sky-200 bg-sky-50 p-4 text-sm text-sky-900">
        <Info className="mt-0.5 h-5 w-5 shrink-0" />
        <div className="space-y-1">
          <p className="font-bold">Kariyer Kapısı neden buradan taranmıyor?</p>
          <p>
            Kariyer Kapısı, sitenin barındığı yurt dışı sunuculardan gelen bağlantıyı kabul etmiyor; o yüzden listedeki &quot;başarısız&quot; denemeler normal. Asıl tarama, bilgisayarındaki
            <b> KamuYoluScraper</b> zamanlanmış göreviyle yapılıyor. Bilgisayar kapalıyken ya da uykudayken Kariyer Kapısı ilanları güncellenmez.
          </p>
          {kk?.gecikti && <p className="font-semibold text-red-700">Şu an 24 saati aşkın süredir başarılı Kariyer Kapısı taraması yok: bilgisayarın açık ve internete bağlı olduğundan emin ol.</p>}
        </div>
      </div>

      <AdminKart baslik="Son 40 tarama">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="py-2 pr-3 font-semibold">Kaynak</th>
                <th className="py-2 pr-3 font-semibold">Başlangıç</th>
                <th className="py-2 pr-3 font-semibold">Durum</th>
                <th className="py-2 pr-3 font-semibold">İlan</th>
                <th className="py-2 font-semibold">Ayrıntı</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-primary/5">
              {gecmis.map((r) => {
                const d = durumEtiketi(r);
                return (
                  <tr key={r.id}>
                    <td className="py-2 pr-3 font-medium text-slate-800">{r.sourceName}</td>
                    <td className="whitespace-nowrap py-2 pr-3 text-muted-foreground">{TARIH.format(r.startedAt)}</td>
                    <td className="py-2 pr-3">
                      <span className={cn("rounded-full px-2 py-0.5 text-xs font-bold", d.renk)}>{d.ad}</span>
                    </td>
                    <td className="py-2 pr-3 tabular-nums">{r.postingsFound ?? "—"}</td>
                    <td className="max-w-md truncate py-2 text-xs text-muted-foreground" title={r.errorMessage ?? undefined}>
                      {r.errorMessage ??
                        [r.unmatchedCount != null && `${r.unmatchedCount} eşleşmeyen`, r.staleDeactivated != null && `${r.staleDeactivated} kaldırılan`].filter(Boolean).join(" · ")}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </AdminKart>
    </>
  );
}
