import Link from "next/link";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";
import { adminSayfasi } from "@/lib/admin";
import { AdminBaslik, AdminKart } from "@/components/admin/AdminUI";
import { AdminIslemButonu } from "@/components/admin/AdminIslemButonu";
import { cn } from "@/lib/utils";

export const metadata = { title: "Becayiş — Admin" };

const SAYFA_BOYU = 30;
const TARIH = new Intl.DateTimeFormat("tr-TR", { day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit", timeZone: "Europe/Istanbul" });
const YOL = "/api/admin/becayis";

export default async function AdminBecayisPage({ searchParams }: { searchParams: Promise<{ q?: string; durum?: string; sayfa?: string }> }) {
  await adminSayfasi();
  const p = await searchParams;
  const q = p.q?.trim() ?? "";
  const durum = p.durum === "pasif" ? "pasif" : "aktif";
  const sayfa = Math.max(1, Number(p.sayfa) || 1);
  const where: Prisma.BecayisTalepWhereInput = {
    isActive: durum === "aktif",
    ...(q && {
      OR: [
        { meslek: { contains: q, mode: "insensitive" } },
        { mevcutIl: { contains: q, mode: "insensitive" } },
        { user: { email: { contains: q, mode: "insensitive" } } },
        { user: { adSoyad: { contains: q, mode: "insensitive" } } },
      ],
    }),
  };

  const [sikayetler, toplam, talepler] = await Promise.all([
    prisma.becayisMesaj.findMany({
      where: { sikayetEdildi: { not: null }, sikayetIncelendi: null },
      orderBy: { sikayetEdildi: "asc" },
      take: 50,
      select: { id: true, mesaj: true, createdAt: true, gonderen: { select: { id: true, adSoyad: true, email: true } }, talep: { select: { meslek: true, mevcutIl: true } } },
    }),
    prisma.becayisTalep.count({ where }),
    prisma.becayisTalep.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (sayfa - 1) * SAYFA_BOYU,
      take: SAYFA_BOYU,
      include: { user: { select: { id: true, adSoyad: true, email: true } }, _count: { select: { mesajlar: true } } },
    }),
  ]);
  const sayfaSayisi = Math.max(1, Math.ceil(toplam / SAYFA_BOYU));
  const url = (ek: Record<string, string | number>) => `/admin/becayis?${new URLSearchParams({ ...(q && { q }), durum, sayfa: "1", ...Object.fromEntries(Object.entries(ek).map(([k, v]) => [k, String(v)])) })}`;

  return (
    <>
      <AdminBaslik baslik="Becayiş" aciklama="Üyelerin şikayet ettiği mesajları incele, uygunsuz talepleri yayından kaldır ya da sil." />

      <AdminKart
        baslik={`Şikayet edilen mesajlar · ${sikayetler.length}`}
        aciklama="Yalnızca şikayet edilen mesajı görürsün, sohbetin geri kalanını değil. Gönderen sürekli sorun çıkarıyorsa üye sayfasından askıya alabilirsin."
        className={cn(sikayetler.length > 0 && "border-red-200")}
      >
        <ul className="space-y-3">
          {sikayetler.map((m) => (
            <li key={m.id} className="rounded-2xl border border-red-100 bg-red-50/40 p-3">
              <p className="whitespace-pre-line text-sm text-slate-900">{m.mesaj}</p>
              <p className="mt-1.5 text-xs text-muted-foreground">
                Gönderen:{" "}
                {m.gonderen ? (
                  <Link href={`/admin/uyeler/${m.gonderen.id}`} className="font-semibold text-primary hover:underline">
                    {m.gonderen.adSoyad} ({m.gonderen.email})
                  </Link>
                ) : (
                  "silinmiş kullanıcı"
                )}{" "}
                · {m.talep.meslek} · {m.talep.mevcutIl} · {TARIH.format(m.createdAt)}
              </p>
              <div className="mt-2 flex flex-wrap gap-1.5">
                <AdminIslemButonu yol={YOL} govde={{ islem: "mesaj-sil", mesajId: m.id }} etiket="Mesajı sil" tehlikeli onay={{ baslik: "Mesaj silinsin mi?", aciklama: "Mesaj iki taraftan da kalıcı olarak silinir." }} />
                <AdminIslemButonu yol={YOL} govde={{ islem: "sikayet-yoksay", mesajId: m.id }} etiket="Sorun yok, yok say" />
              </div>
            </li>
          ))}
          {sikayetler.length === 0 && <li className="text-sm text-muted-foreground">Bekleyen şikayet yok.</li>}
        </ul>
      </AdminKart>

      <AdminKart>
        <form className="flex flex-wrap gap-2">
          <input type="hidden" name="durum" value={durum} />
          <input name="q" defaultValue={q} placeholder="Meslek, il, ad ya da e-posta ara" className="h-10 min-w-56 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm" />
          <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
            Ara
          </button>
        </form>
        <div className="mt-3 flex gap-1.5">
          {[
            ["aktif", "Yayında"],
            ["pasif", "Yayından kalkan"],
          ].map(([k, ad]) => (
            <Link
              key={k}
              href={url({ durum: k })}
              className={cn("rounded-full border px-3 py-1 text-xs font-semibold", durum === k ? "border-primary bg-primary text-primary-foreground" : "border-primary/15 text-slate-600 hover:bg-slate-50")}
            >
              {ad}
            </Link>
          ))}
        </div>

        <p className="mt-4 text-xs font-semibold text-muted-foreground">{toplam.toLocaleString("tr-TR")} talep</p>
        <ul className="mt-2 divide-y divide-primary/10">
          {talepler.map((t) => (
            <li key={t.id} className="flex flex-wrap items-center justify-between gap-3 py-3">
              <div className="min-w-0 flex-1">
                <p className="text-sm font-semibold text-slate-900">
                  {t.meslek} · {t.mevcutIl}
                  {t.mevcutIlce && ` / ${t.mevcutIlce}`} → {t.istenenIller.join(", ")}
                </p>
                {t.aciklama && <p className="mt-0.5 line-clamp-2 text-xs text-slate-600">{t.aciklama}</p>}
                <p className="mt-0.5 text-xs text-muted-foreground">
                  <Link href={`/admin/uyeler/${t.user.id}`} className="text-primary hover:underline">
                    {t.user.adSoyad}
                  </Link>{" "}
                  · {TARIH.format(t.createdAt)} · {t._count.mesajlar} mesaj
                </p>
              </div>
              <div className="flex gap-1.5">
                {t.isActive && (
                  <Link href={`/becayis/${t.id}`} target="_blank" className="rounded-lg border border-primary/15 px-2.5 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50">
                    Sitede gör
                  </Link>
                )}
                {t.isActive && (
                  <AdminIslemButonu
                    yol={YOL}
                    govde={{ islem: "talep-kaldir", talepId: t.id }}
                    etiket="Yayından kaldır"
                    onay={{ baslik: "Talep yayından kaldırılsın mı?", aciklama: "Talep listeden çıkar, sahibine bildirim gider. Mesajlar silinmez." }}
                  />
                )}
                <AdminIslemButonu
                  yol={YOL}
                  govde={{ islem: "talep-sil", talepId: t.id }}
                  etiket="Sil"
                  tehlikeli
                  onay={{ baslik: "Talep kalıcı olarak silinsin mi?", aciklama: "Talep ve ona ait tüm mesajlar silinir. Geri alınamaz." }}
                />
              </div>
            </li>
          ))}
          {talepler.length === 0 && <li className="py-6 text-center text-sm text-muted-foreground">Sonuç yok.</li>}
        </ul>
        {sayfaSayisi > 1 && (
          <div className="mt-4 flex items-center justify-between text-sm">
            {sayfa > 1 ? <Link href={url({ sayfa: sayfa - 1 })} className="font-semibold text-primary">← Önceki</Link> : <span />}
            <span className="text-muted-foreground">
              {sayfa} / {sayfaSayisi}
            </span>
            {sayfa < sayfaSayisi ? <Link href={url({ sayfa: sayfa + 1 })} className="font-semibold text-primary">Sonraki →</Link> : <span />}
          </div>
        )}
      </AdminKart>
    </>
  );
}
