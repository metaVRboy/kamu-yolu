import Link from "next/link";
import { AlertTriangle, BadgePercent, Bell, CheckCircle2, Crown, GraduationCap, Newspaper, Radar, Rocket, UserPlus, Users } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { aktifProKosulu } from "@/lib/sms";
import { buHaftakiDenemeSayisi } from "@/lib/kpssDeneme";
import { AdminBaslik, AdminKart, IstatistikKutusu } from "@/components/admin/AdminUI";
import { cn } from "@/lib/utils";

export const metadata = { title: "Gösterge paneli — Admin" };

const GUN_MS = 86_400_000;
const sayi = (n: number) => n.toLocaleString("tr-TR");
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
const GUN = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", timeZone: "Europe/Istanbul" });

/** Son n gunun baslangici (sunucu saati). */
function gunOnce(n: number, simdi = Date.now()) {
  return new Date(simdi - n * GUN_MS);
}

export default async function AdminPanelPage() {
  await adminSayfasi();
  const [toplamUye, yedi, otuz, pro, proPlus, aktifIlan, sonTaramalar, haftalikDeneme, talepSayisi, haftalikHaber, sonUyeler, gunluk] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({ where: { createdAt: { gte: gunOnce(7) } } }),
    prisma.user.count({ where: { createdAt: { gte: gunOnce(30) } } }),
    prisma.user.count({ where: { ...aktifProKosulu(), abonelikPlani: "PRO" } }),
    prisma.user.count({ where: { ...aktifProKosulu(), abonelikPlani: "PRO_PLUS" } }),
    prisma.posting.count({ where: { isActive: true } }),
    // Her kaynagin bitmis son taramasi (RUNNING takili kalanlar sayilmaz)
    prisma.scrapeRun.findMany({ where: { status: { not: "RUNNING" } }, orderBy: { startedAt: "desc" }, distinct: ["sourceName"] }),
    buHaftakiDenemeSayisi(),
    prisma.yukseltmeTalebi.count(),
    prisma.haber.count({ where: { yayinTarihi: { gte: gunOnce(7) } } }),
    prisma.user.findMany({ orderBy: { createdAt: "desc" }, take: 6, select: { id: true, adSoyad: true, email: true, createdAt: true, abonelikPlani: true } }),
    // Son 30 gun, Istanbul gunune gore yeni uye sayisi
    prisma.$queryRaw<{ gun: string; sayi: bigint }[]>`
      SELECT to_char(("createdAt" AT TIME ZONE 'UTC') AT TIME ZONE 'Europe/Istanbul', 'YYYY-MM-DD') AS gun, count(*) AS sayi
      FROM "User" WHERE "createdAt" >= ${gunOnce(30)} GROUP BY 1`,
  ]);

  const sayiByGun = new Map(gunluk.map((g) => [g.gun, Number(g.sayi)]));
  const seri = Array.from({ length: 30 }, (_, i) => {
    const t = gunOnce(29 - i);
    const anahtar = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }).format(t);
    return { anahtar, etiket: GUN.format(t), sayi: sayiByGun.get(anahtar) ?? 0 };
  });
  const enCok = Math.max(1, ...seri.map((s) => s.sayi));
  const basarisizTarama = sonTaramalar.filter((t) => t.status === "FAILED");

  return (
    <>
      <AdminBaslik baslik="Gösterge paneli" aciklama="Sitenin genel durumu tek bakışta." />

      {basarisizTarama.length > 0 && (
        <div className="flex items-start gap-3 rounded-3xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div>
            <p className="font-bold">Son tarama başarısız: {basarisizTarama.map((t) => t.sourceName).join(", ")}</p>
            {basarisizTarama.map((t) => (
              <p key={t.id} className="mt-0.5 text-xs">
                {t.sourceName} · {TARIH.format(t.startedAt)} · {t.errorMessage?.slice(0, 160) ?? "hata mesajı yok"}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <IstatistikKutusu ikon={Users} etiket="Toplam üye" deger={sayi(toplamUye)} alt={`Son 7 gün +${sayi(yedi)} · 30 gün +${sayi(otuz)}`} />
        <IstatistikKutusu ikon={Crown} etiket="Aktif ücretli üye" deger={sayi(pro + proPlus)} alt={`Pro ${sayi(pro)} · Pro+ ${sayi(proPlus)}`} />
        <IstatistikKutusu ikon={Radar} etiket="Aktif ilan" deger={sayi(aktifIlan)} alt={`Bu hafta ${sayi(haftalikHaber)} yeni haber`} uyari={basarisizTarama.length > 0} />
        <IstatistikKutusu ikon={GraduationCap} etiket="Bu haftaki KPSS denemesi" deger={sayi(haftalikDeneme)} alt={`${sayi(talepSayisi)} kişi “açılınca haber ver” dedi`} />
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminKart baslik="Yeni üyeler · son 30 gün" aciklama={`Toplam ${sayi(otuz)} yeni üye; en yoğun gün ${sayi(enCok)} kayıt.`}>
          <div className="flex h-40 items-end gap-[3px]">
            {seri.map((s) => (
              <div key={s.anahtar} className="group relative flex h-full flex-1 items-end" title={`${s.etiket}: ${s.sayi} üye`}>
                <div className={cn("w-full rounded-t-md", s.sayi ? "bg-primary/70 group-hover:bg-primary" : "bg-slate-100")} style={{ height: `${Math.max(4, (s.sayi / enCok) * 100)}%` }} />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-[10px] text-muted-foreground">
            <span>{seri[0].etiket}</span>
            <span>{seri[29].etiket}</span>
          </div>
        </AdminKart>

        <AdminKart baslik="Taramalar">
          <ul className="space-y-2">
            {sonTaramalar.map((t) => (
              <li key={t.id} className="flex items-center justify-between gap-2 rounded-xl bg-slate-50 px-3 py-2 text-sm">
                <span className="flex items-center gap-2 font-medium text-slate-800">
                  {t.status === "SUCCESS" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <AlertTriangle className="h-4 w-4 text-red-600" />}
                  {t.sourceName}
                </span>
                <span className="text-xs text-muted-foreground">
                  {TARIH.format(t.startedAt)}
                  {t.postingsFound != null && ` · ${t.postingsFound} ilan`}
                </span>
              </li>
            ))}
          </ul>
        </AdminKart>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
        <AdminKart baslik="Son kayıt olanlar">
          <ul className="divide-y divide-primary/5">
            {sonUyeler.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span className="min-w-0">
                  <span className="block truncate font-medium text-slate-900">{u.adSoyad}</span>
                  <span className="block truncate text-xs text-muted-foreground">{u.email}</span>
                </span>
                <span className="shrink-0 text-xs text-muted-foreground">{TARIH.format(u.createdAt)}</span>
              </li>
            ))}
          </ul>
        </AdminKart>

        <AdminKart baslik="Hızlı işlemler">
          <div className="grid gap-2">
            {[
              { href: "/admin/bildirimler", ad: "Bildirim yayınla", ikon: Bell },
              { href: "/admin/fiyatlar", ad: "Kampanya oluştur", ikon: BadgePercent },
              { href: "/admin/uyeler", ad: "Üye ara / plan ver", ikon: UserPlus },
              { href: "/admin/haberler", ad: "Haber ekle", ikon: Newspaper },
              { href: "/", ad: "Siteye git", ikon: Rocket },
            ].map(({ href, ad, ikon: Ikon }) => (
              <Link key={href} href={href} className="flex items-center gap-2.5 rounded-xl border border-primary/10 px-3 py-2.5 text-sm font-semibold text-slate-800 transition-colors hover:border-primary/30 hover:bg-primary/5">
                <Ikon className="h-4 w-4 text-primary" />
                {ad}
              </Link>
            ))}
          </div>
        </AdminKart>
      </div>
    </>
  );
}
