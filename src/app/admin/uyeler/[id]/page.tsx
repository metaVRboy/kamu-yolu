import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { proAktifMi, telefonMaskele } from "@/lib/sms";
import { sonDenemeler } from "@/lib/kpssDeneme";
import { LEVEL_LABEL } from "@/lib/labels";
import { DUZEY_LABEL } from "@/lib/kpssDenemeSabitler";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminUyePlani } from "@/components/AdminUyePlani";
import { AdminUyeIslemleri } from "@/components/admin/AdminUyeIslemleri";

export const metadata = { title: "Üye detayı — Admin" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
const GUN = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }); // YYYY-MM-DD

function Satir({ ad, children }: { ad: string; children: React.ReactNode }) {
  return (
    <div className="flex justify-between gap-4 py-2 text-sm">
      <dt className="text-muted-foreground">{ad}</dt>
      <dd className="text-right font-medium text-slate-900">{children}</dd>
    </div>
  );
}

export default async function AdminUyeDetayPage({ params }: { params: Promise<{ id: string }> }) {
  const admin = await adminSayfasi();
  const { id } = await params;
  const uye = await prisma.user.findUnique({
    where: { id },
    include: {
      department: { select: { name: true } },
      oturumlar: { orderBy: { sonGorulme: "desc" }, take: 8 },
      becayisTalepleri: { orderBy: { createdAt: "desc" }, take: 10, select: { id: true, meslek: true, mevcutIl: true, isActive: true, createdAt: true } },
      yukseltmeTalebi: true,
    },
  });
  if (!uye) notFound();
  const denemeler = await sonDenemeler(id, 6);
  const acikOturum = uye.oturumlar.filter((o) => !o.kapatildi).length;

  return (
    <>
      <Link href="/admin/uyeler" className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-slate-900">
        <ArrowLeft className="h-4 w-4" /> Üyeler
      </Link>
      <AdminBaslik baslik={uye.adSoyad} aciklama={uye.email} />

      {uye.askiyaAlindi && (
        <p className="rounded-2xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-800">
          <strong>Askıda</strong> · {TARIH.format(uye.askiyaAlindi)}
          {uye.askiNedeni && ` · ${uye.askiNedeni}`}
        </p>
      )}

      <div className="grid gap-6 xl:grid-cols-2">
        <AdminKart baslik="Profil">
          <dl className="divide-y divide-primary/5">
            <Satir ad="Kayıt">{TARIH.format(uye.createdAt)}</Satir>
            <Satir ad="Bölüm">{uye.department?.name ?? "—"}</Satir>
            <Satir ad="Öğrenim düzeyi">{uye.educationLevel ? LEVEL_LABEL[uye.educationLevel] : "—"}</Satir>
            <Satir ad="Telefon">
              {uye.telefon ? telefonMaskele(uye.telefon) : "—"}
              {uye.telefonDogrulandi && " · doğrulanmış"}
            </Satir>
            <Satir ad="Giriş yöntemi">{[uye.passwordHash && "E-posta", uye.googleId && "Google"].filter(Boolean).join(" + ") || "—"}</Satir>
            <Satir ad="Plan">
              {proAktifMi(uye) ? (uye.abonelikPlani === "PRO_PLUS" ? "Pro+" : "Pro") : "Ücretsiz"}
              {uye.abonelikBitis && ` · bitiş ${TARIH.format(uye.abonelikBitis)}`}
            </Satir>
            <Satir ad="Yükseltme talebi">
              {uye.yukseltmeTalebi ? `${uye.yukseltmeTalebi.plan === "PRO_PLUS" ? "Pro+" : "Pro"} · ${uye.yukseltmeTalebi.yillik ? "yıllık" : "aylık"}` : "—"}
            </Satir>
          </dl>
        </AdminKart>

        <div className="space-y-6">
          <AdminKart baslik="Plan" aciklama="Bitiş tarihi boşsa süresiz; tarih geçince üye otomatik Ücretsiz plana döner.">
            <AdminUyePlani userId={uye.id} plan={uye.abonelikPlani} bitis={uye.abonelikBitis ? GUN.format(uye.abonelikBitis) : null} />
          </AdminKart>
          <AdminKart baslik="İşlemler">
            <AdminUyeIslemleri userId={uye.id} askida={!!uye.askiyaAlindi} admin={uye.isAdmin} kendisi={uye.id === admin.id} acikOturum={acikOturum} />
          </AdminKart>
        </div>
      </div>

      <div className="grid gap-6 xl:grid-cols-3">
        <AdminKart baslik="Oturumlar">
          <ul className="space-y-2 text-sm">
            {uye.oturumlar.map((o) => (
              <li key={o.id} className="flex justify-between gap-2">
                <span className="truncate text-slate-800">{o.cihaz}</span>
                <span className="shrink-0 text-xs text-muted-foreground">{o.kapatildi ? "kapalı" : TARIH.format(o.sonGorulme)}</span>
              </li>
            ))}
            {uye.oturumlar.length === 0 && <li className="text-muted-foreground">Oturum yok.</li>}
          </ul>
        </AdminKart>
        <AdminKart baslik="Becayiş talepleri">
          <ul className="space-y-2 text-sm">
            {uye.becayisTalepleri.map((t) => (
              <li key={t.id} className="flex justify-between gap-2">
                <Link href={`/becayis/${t.id}`} className="truncate text-primary hover:underline">
                  {t.meslek} · {t.mevcutIl}
                </Link>
                <span className="shrink-0 text-xs text-muted-foreground">{t.isActive ? "aktif" : "pasif"}</span>
              </li>
            ))}
            {uye.becayisTalepleri.length === 0 && <li className="text-muted-foreground">Talep yok.</li>}
          </ul>
        </AdminKart>
        <AdminKart baslik="KPSS denemeleri">
          <ul className="space-y-2 text-sm">
            {denemeler.map((d) => (
              <li key={d.id} className="flex justify-between gap-2">
                <span className="text-slate-800">
                  {DUZEY_LABEL[d.duzey]} · {GUN.format(d.tarih)}
                </span>
                <span className="shrink-0 font-semibold tabular-nums">{d.puan.toLocaleString("tr-TR", { maximumFractionDigits: 1 })} puan</span>
              </li>
            ))}
            {denemeler.length === 0 && <li className="text-muted-foreground">Deneme yok.</li>}
          </ul>
        </AdminKart>
      </div>
    </>
  );
}
