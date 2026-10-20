import Link from "next/link";
import { redirect } from "next/navigation";
import { BellRing } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getOkunmamisIlgilendiklerimSayisi, getOkunmamisMesajSayisi } from "@/lib/becayis";
import { ProfilLayout } from "@/components/ProfilLayout";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { TakibiBirakButonu } from "@/components/IlanTakipButonu";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { kalanGunSayisi, kalanGunStili } from "@/lib/ilanVitrin";
import { slugify } from "@/lib/slug";
import { cn } from "@/lib/utils";

export const metadata = { title: "Takip Ettiğim İlanlar — Kamu Yolu" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "long", year: "numeric", timeZone: "Europe/Istanbul" });

/** Son basvurusu en yakin olan once; suresi gecmisler en sona. */
function sonGuneGore<T extends { posting: { applicationEnd: Date | null } }>(takipler: T[], simdi = Date.now()) {
  return takipler.sort((a, b) => {
    const ta = a.posting.applicationEnd?.getTime() ?? Infinity;
    const tb = b.posting.applicationEnd?.getTime() ?? Infinity;
    return (ta < simdi ? 1 : 0) - (tb < simdi ? 1 : 0) || ta - tb;
  });
}

export default async function TakipPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris?sonra=/profilim/takip");

  const [okunmamis, okunmamisIlgi, takipler] = await Promise.all([
    getOkunmamisMesajSayisi(user.id),
    getOkunmamisIlgilendiklerimSayisi(user.id),
    prisma.ilanTakip.findMany({
      where: { userId: user.id, posting: { adminGizli: false } },
      include: { posting: { select: { id: true, title: true, institutionName: true, applicationEnd: true } } },
    }),
  ]);
  const sirali = sonGuneGore(takipler);
  const pro = user.abonelikPlani !== "UCRETSIZ";

  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamis} okunmamisIlgilendiklerimSayisi={okunmamisIlgi}>
      <SayfaBasligi kompakt ikon={BellRing} baslik="Takip Ettiğim İlanlar" aciklama="Takibe aldığın ilanlar, son başvuru günü en yakın olandan başlayarak." />

      {!pro && sirali.length > 0 && (
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-primary/20 bg-primary/5 p-4 text-sm">
          <p className="text-slate-700">Pro&apos;da takip ettiğin her ilan için son başvuruya 3 gün ve 1 gün kala hatırlatma gelir.</p>
          <YukseltButonu plan="PRO" kaynak="ilan-takip" className="rounded-xl bg-primary px-4 py-2 font-semibold text-primary-foreground">
            Hatırlatmaları aç
          </YukseltButonu>
        </div>
      )}

      {sirali.length === 0 ? (
        <p className="mt-6 rounded-2xl border border-primary/10 bg-white p-6 text-sm text-muted-foreground">
          Henüz takip ettiğin ilan yok. Bir ilanın sayfasında <strong>İlanı takip et</strong> düğmesine bas;{" "}
          <Link href="/ilanlar" className="font-medium text-primary hover:underline">
            ilanlara göz at
          </Link>
          .
        </p>
      ) : (
        <ul className="mt-6 space-y-3">
          {sirali.map(({ posting: p }) => {
            const stil = kalanGunStili(kalanGunSayisi(p.applicationEnd));
            return (
              <li key={p.id} className="flex flex-wrap items-center gap-3 rounded-2xl border border-primary/10 bg-white p-4 shadow-sm">
                <div className="min-w-0 flex-1">
                  <Link href={`/ilan/${p.id}/${slugify(p.title)}`} className="font-semibold text-slate-900 hover:text-primary">
                    {p.title}
                  </Link>
                  <p className="text-sm text-muted-foreground">
                    {p.institutionName}
                    {p.applicationEnd && ` · Son başvuru ${TARIH.format(p.applicationEnd)}`}
                  </p>
                </div>
                <span className={cn("rounded-full px-2.5 py-1 text-xs font-bold", stil.zemin, stil.renk)}>{stil.metin}</span>
                <TakibiBirakButonu ilanId={p.id} />
              </li>
            );
          })}
        </ul>
      )}
    </ProfilLayout>
  );
}
