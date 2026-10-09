import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminIslemButonu } from "@/components/admin/AdminIslemButonu";
import { AdminDestekYanit } from "@/components/admin/AdminDestekYanit";
import { cn } from "@/lib/utils";

export const metadata = { title: "Destek — Admin" };

const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
const FILTRELER = [
  ["acik", "Bekleyen"],
  ["yanitlanan", "Yanıtlanan"],
  ["kapali", "Yanıtsız kapatılan"],
] as const;
const PLAN_ROZETI = { PRO_PLUS: "bg-violet-100 text-violet-700", PRO: "bg-sky-100 text-sky-700", UCRETSIZ: "" } as const;

export default async function AdminDestekPage({ searchParams }: { searchParams: Promise<{ filtre?: string }> }) {
  await adminSayfasi();
  const p = await searchParams;
  const filtre = FILTRELER.some(([k]) => k === p.filtre) ? p.filtre! : "acik";
  const where: Prisma.DestekMesajiWhereInput =
    filtre === "acik" ? { kapatildi: null } : filtre === "yanitlanan" ? { yanitlandi: { not: null } } : { kapatildi: { not: null }, yanitlandi: null };
  const mesajlar = await prisma.destekMesaji.findMany({
    where,
    // Bekleyenlerde Pro+ > Pro > ucretsiz (enum sirasi), sonra en eski once; digerlerinde en yeni once.
    orderBy: filtre === "acik" ? [{ plan: "desc" }, { createdAt: "asc" }] : [{ createdAt: "desc" }],
    take: 100,
  });

  return (
    <>
      <AdminBaslik baslik="Destek kutusu" aciklama="İletişim formundan gelen mesajlar. Yanıtın üyenin e-postasına gider; üyeyse sitede de görür. Pro+ mesajları en üstte." />
      <AdminKart>
        <div className="flex gap-1.5">
          {FILTRELER.map(([k, ad]) => (
            <Link
              key={k}
              href={`/admin/destek?filtre=${k}`}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold", filtre === k ? "border-primary bg-primary text-primary-foreground" : "border-primary/15 text-slate-600 hover:bg-slate-50")}
            >
              {ad}
            </Link>
          ))}
        </div>
        <ul className="mt-4 space-y-3">
          {mesajlar.map((m) => (
            <li key={m.id} className="rounded-2xl border border-primary/10 p-4">
              <p className="flex flex-wrap items-center gap-1.5 text-sm">
                <span className="font-semibold text-slate-900">{m.ad}</span>
                <span className="text-muted-foreground">{m.email}</span>
                {m.plan !== "UCRETSIZ" && <span className={cn("rounded-full px-2 py-0.5 text-[11px] font-bold", PLAN_ROZETI[m.plan])}>{m.plan === "PRO_PLUS" ? "Pro+" : "Pro"}</span>}
                {m.userId && (
                  <Link href={`/admin/uyeler/${m.userId}`} className="text-xs text-primary hover:underline">
                    üye sayfası
                  </Link>
                )}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">
                {m.konu} · {TARIH.format(m.createdAt)}
              </p>
              <p className="mt-2 whitespace-pre-line text-sm text-slate-800">{m.mesaj}</p>
              {m.yanit && (
                <div className="mt-3 rounded-xl bg-primary/5 p-3 text-sm">
                  <p className="text-xs font-semibold text-primary">Yanıtın · {TARIH.format(m.yanitlandi!)}</p>
                  <p className="mt-1 whitespace-pre-line text-slate-800">{m.yanit}</p>
                </div>
              )}
              {!m.kapatildi && (
                <>
                  <AdminDestekYanit id={m.id} />
                  <div className="mt-2">
                    <AdminIslemButonu yol="/api/admin/destek" govde={{ islem: "kapat", id: m.id }} etiket="Yanıtlamadan kapat" />
                  </div>
                </>
              )}
            </li>
          ))}
          {mesajlar.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Mesaj yok.</li>}
        </ul>
      </AdminKart>
    </>
  );
}
