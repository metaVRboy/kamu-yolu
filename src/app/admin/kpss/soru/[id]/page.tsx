import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { soruSikDagilimi } from "@/lib/kpssDeneme";
import { DERS_LABEL, DUZEY_LABEL } from "@/lib/kpssDenemeSabitler";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminSoruForm } from "@/components/admin/AdminSoruForm";
import { AdminIslemButonu } from "@/components/admin/AdminIslemButonu";
import { SoruGovdesi } from "@/components/SoruGovdesi";
import { cn } from "@/lib/utils";

export const metadata = { title: "Soru düzelt — Admin" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });

export default async function AdminSoruPage({ params }: { params: Promise<{ id: string }> }) {
  await adminSayfasi();
  const { id } = await params;
  const [soru, dagilim, bildirimler] = await Promise.all([
    prisma.denemeSoru.findUnique({ where: { id } }),
    soruSikDagilimi(id),
    prisma.soruHataBildirimi.findMany({ where: { soruId: id }, orderBy: { createdAt: "desc" }, include: { user: { select: { adSoyad: true } } } }),
  ]);
  if (!soru) notFound();
  const acik = bildirimler.filter((b) => !b.cozuldu).length;

  return (
    <>
      <AdminBaslik baslik="Soru düzelt" aciklama={`${DUZEY_LABEL[soru.duzey]} · ${DERS_LABEL[soru.ders]}${soru.konu ? ` · ${soru.konu}` : ""} · ${soru.kullanimSayisi} denemede kullanıldı`} />

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminKart>
          <AdminSoruForm
            soruId={soru.id}
            katilimSayisi={dagilim.toplam}
            baslangic={{ soruMetni: soru.soruMetni, secenekler: soru.secenekler, dogruCevap: soru.dogruCevap, aciklama: soru.aciklama, konu: soru.konu }}
          />
        </AdminKart>

        <div className="space-y-6">
          <AdminKart baslik="Öğrencilerin seçimleri" aciklama={`Bu soruyu içeren ${dagilim.toplam} bitmiş deneme.`}>
            <ul className="space-y-1.5">
              {dagilim.siklar.map((n, i) => {
                const yuzde = dagilim.toplam ? Math.round((n / dagilim.toplam) * 100) : 0;
                return (
                  <li key={i} className="flex items-center gap-2 text-sm">
                    <span className={cn("w-5 font-bold", i === soru.dogruCevap && "text-emerald-600")}>{String.fromCharCode(65 + i)}</span>
                    <span className="h-2.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                      <span className={cn("block h-full rounded-full", i === soru.dogruCevap ? "bg-emerald-500" : "bg-slate-400")} style={{ width: `${yuzde}%` }} />
                    </span>
                    <span className="w-16 text-right text-xs tabular-nums text-muted-foreground">
                      {n} · %{yuzde}
                    </span>
                  </li>
                );
              })}
              <li className="pt-1 text-xs text-muted-foreground">Boş: {dagilim.bos}</li>
            </ul>
          </AdminKart>

          <AdminKart baslik={`Hata bildirimleri · ${bildirimler.length}`}>
            <ul className="space-y-2">
              {bildirimler.map((b) => (
                <li key={b.id} className={cn("rounded-lg px-3 py-2 text-xs", b.cozuldu ? "bg-slate-50 text-muted-foreground" : "bg-red-50 text-slate-800")}>
                  “{b.aciklama}”
                  <span className="mt-0.5 block text-[11px] text-muted-foreground">
                    {b.user?.adSoyad ?? "Silinmiş kullanıcı"} · {TARIH.format(b.createdAt)}
                    {b.cozuldu && " · kapatıldı"}
                  </span>
                </li>
              ))}
              {bildirimler.length === 0 && <li className="text-sm text-muted-foreground">Bildirim yok.</li>}
            </ul>
            {acik > 0 && (
              <div className="mt-3">
                <AdminIslemButonu yol="/api/admin/kpss/bildirim" govde={{ soruId: soru.id }} etiket={`Açık ${acik} bildirimi kapat`} />
              </div>
            )}
          </AdminKart>
        </div>
      </div>

      <AdminKart baslik="Öğrencinin gördüğü hali (kayıtlı sürüm)">
        <SoruGovdesi sorular={[soru]} index={0} />
        <ol className="mt-3 space-y-1 text-sm text-slate-700">
          {soru.secenekler.map((s, i) => (
            <li key={i} className={cn(i === soru.dogruCevap && "font-semibold text-emerald-700")}>
              {String.fromCharCode(65 + i)}) {s}
            </li>
          ))}
        </ol>
      </AdminKart>
    </>
  );
}
