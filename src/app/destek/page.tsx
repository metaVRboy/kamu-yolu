import { LifeBuoy } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { getCurrentUser } from "@/lib/auth";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { DestekFormu } from "@/components/DestekFormu";

export const metadata = {
  title: "İletişim ve Destek — Kamu Yolu",
  description: "Kamu Yolu ekibine soru, öneri ya da hata bildirimi gönder; yanıtımız e-postana gelsin.",
};

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

export default async function DestekPage() {
  const user = await getCurrentUser();
  const gecmis = user
    ? await prisma.destekMesaji.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, take: 20 })
    : [];

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi
        ikon={LifeBuoy}
        breadcrumb={[{ ad: "Ana Sayfa", href: "/" }, { ad: "İletişim ve Destek" }]}
        baslik="İletişim ve Destek"
        aciklama="Soru, öneri ya da bir hata mı buldun? Yaz, yanıtımızı e-postana gönderelim."
        cipler={[{ etiket: "Genelde 1-2 iş günü içinde yanıt" }, { etiket: "Pro+ üyelere öncelikli destek" }]}
      />

      <div className="mt-6">
        <DestekFormu uye={user ? { adSoyad: user.adSoyad, email: user.email } : null} />
      </div>

      {gecmis.length > 0 && (
        <section className="mt-10">
          <h2 className="text-lg font-bold text-slate-900">Önceki mesajların</h2>
          <ul className="mt-3 space-y-3">
            {gecmis.map((m) => (
              <li key={m.id} className="rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
                <p className="flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                  <span className="font-semibold text-slate-700">{m.konu}</span>
                  <span>{TARIH.format(m.createdAt)}</span>
                </p>
                <p className="mt-1.5 whitespace-pre-line text-sm text-slate-700">{m.mesaj}</p>
                {m.yanit ? (
                  <div className="mt-3 rounded-xl bg-primary/5 p-3">
                    <p className="text-xs font-semibold text-primary">Kamu Yolu yanıtı · {TARIH.format(m.yanitlandi!)}</p>
                    <p className="mt-1 whitespace-pre-line text-sm text-slate-800">{m.yanit}</p>
                  </div>
                ) : (
                  <p className="mt-2 text-xs font-medium text-amber-700">{m.kapatildi ? "Kapatıldı" : "Yanıt bekleniyor"}</p>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
