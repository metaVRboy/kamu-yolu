import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { smsSaglayiciTanimli, telefonMaskele } from "@/lib/sms";
import { cn } from "@/lib/utils";

export const metadata = { title: "SMS Kayıtları — Kamu Yolu" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { dateStyle: "short", timeStyle: "short", timeZone: "Europe/Istanbul" });
const TUR_ADI: Record<string, string> = { DOGRULAMA: "Doğrulama", ILAN: "İlan", BECAYIS: "Becayiş" };
const DURUM_RENGI: Record<string, string> = {
  TEST: "bg-amber-50 text-amber-800",
  GONDERILDI: "bg-emerald-50 text-emerald-700",
  HATA: "bg-red-50 text-red-700",
};

export default async function AdminSmsPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (!user.isAdmin) redirect("/");

  const [kayitlar, ozet] = await Promise.all([
    prisma.smsGonderim.findMany({ orderBy: { olusturma: "desc" }, take: 100 }),
    prisma.smsGonderim.groupBy({
      by: ["durum"],
      // eslint-disable-next-line react-hooks/purity -- sunucu bileseni, istek basina bir kez calisir
      where: { olusturma: { gt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } },
      _count: true,
    }),
  ]);

  return (
    <div className="max-w-5xl">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-slate-900">SMS Kayıtları</h1>
      <p className="mt-1 text-sm text-muted-foreground">Son 100 SMS. Numaralar maskelidir.</p>

      {!smsSaglayiciTanimli() && (
        <p className="mt-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
          <strong>Test modu:</strong> SMS sağlayıcısı henüz bağlı değil. Hiçbir SMS gerçekten gönderilmiyor; gönderilecek mesajlar
          yalnızca buraya “TEST” olarak yazılıyor.
        </p>
      )}

      <div className="mt-4 flex flex-wrap gap-2 text-sm">
        <span className="text-muted-foreground">Son 30 gün:</span>
        {ozet.length === 0 && <span>kayıt yok</span>}
        {ozet.map((o) => (
          <span key={o.durum} className={cn("rounded-full px-2.5 py-0.5 text-xs font-semibold", DURUM_RENGI[o.durum])}>
            {o.durum} {o._count}
          </span>
        ))}
      </div>

      <div className="mt-4 overflow-x-auto rounded-2xl border border-primary/15 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-primary/10 text-xs text-muted-foreground">
            <tr>
              <th className="px-3 py-2 font-semibold">Tarih</th>
              <th className="px-3 py-2 font-semibold">Tür</th>
              <th className="px-3 py-2 font-semibold">Numara</th>
              <th className="px-3 py-2 font-semibold">Mesaj</th>
              <th className="px-3 py-2 font-semibold">Durum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-primary/5">
            {kayitlar.map((k) => (
              <tr key={k.id}>
                <td className="px-3 py-2 whitespace-nowrap">{TARIH.format(k.olusturma)}</td>
                <td className="px-3 py-2">{TUR_ADI[k.tur] ?? k.tur}</td>
                <td className="px-3 py-2 whitespace-nowrap">{telefonMaskele(k.telefon)}</td>
                {/* Dogrulama kodlari admin ekraninda da gizli kalir. */}
                <td className="px-3 py-2 text-slate-600">{k.tur === "DOGRULAMA" ? k.metin.replace(/\d{6}/, "******") : k.metin}</td>
                <td className="px-3 py-2">
                  <span className={cn("rounded-full px-2 py-0.5 text-xs font-semibold", DURUM_RENGI[k.durum])} title={k.hata ?? undefined}>
                    {k.durum}
                  </span>
                </td>
              </tr>
            ))}
            {kayitlar.length === 0 && (
              <tr>
                <td colSpan={5} className="px-3 py-6 text-center text-muted-foreground">
                  Henüz SMS kaydı yok.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
