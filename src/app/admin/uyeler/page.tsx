import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { AdminUyePlani } from "@/components/AdminUyePlani";
import { aktifProKosulu, proAktifMi } from "@/lib/sms";

export const metadata = { title: "Üye Yönetimi — Kamu Yolu" };

const ISTANBUL_GUNU = new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Istanbul" }); // YYYY-MM-DD

export default async function AdminUyelerPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");
  if (!user.isAdmin) redirect("/");

  const q = (await searchParams).q?.trim() ?? "";
  // Arama yoksa ucretli plani AKTIF olanlar listelenir (bitis tarihi gecmisler degil).
  const uyeler = await prisma.user.findMany({
    where: q
      ? { OR: [{ email: { contains: q, mode: "insensitive" } }, { adSoyad: { contains: q, mode: "insensitive" } }] }
      : aktifProKosulu(),
    orderBy: { createdAt: "desc" },
    take: 30,
    select: { id: true, adSoyad: true, email: true, abonelikPlani: true, abonelikBitis: true, telefonDogrulandi: true },
  });

  // "Acilinca haber ver" talepleri: odeme acilinca e-posta listesi + hangi plana/butona ilgi var.
  const [talepDagilimi, kaynakDagilimi] = await Promise.all([
    prisma.yukseltmeTalebi.groupBy({ by: ["plan", "yillik"], _count: { _all: true } }),
    prisma.yukseltmeTalebi.groupBy({ by: ["kaynak"], _count: { _all: true }, orderBy: { _count: { kaynak: "desc" } } }),
  ]);
  const toplamTalep = talepDagilimi.reduce((t, d) => t + d._count._all, 0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <h1 className="font-sans text-2xl font-bold tracking-tight text-primary sm:text-3xl">Üye Yönetimi</h1>

      <section className="mt-6 rounded-2xl border border-primary/15 bg-white p-4">
        <h2 className="text-sm font-bold text-slate-900">Yükseltme talepleri (açılınca haber ver) · {toplamTalep}</h2>
        <div className="mt-2 flex flex-wrap gap-2 text-xs">
          {talepDagilimi.map((d) => (
            <span key={`${d.plan}-${d.yillik}`} className="rounded-full bg-primary/10 px-2.5 py-1 font-semibold text-primary">
              {d.plan === "PRO_PLUS" ? "Pro+" : "Pro"} · {d.yillik ? "yıllık" : "aylık"}: {d._count._all}
            </span>
          ))}
          {toplamTalep === 0 && <span className="text-muted-foreground">Henüz talep yok.</span>}
        </div>
        {kaynakDagilimi.length > 0 && (
          <p className="mt-2 text-xs text-muted-foreground">
            Geldiği yer: {kaynakDagilimi.map((k) => `${k.kaynak} (${k._count._all})`).join(", ")}
          </p>
        )}
      </section>
      <p className="mt-1 text-sm text-muted-foreground">
        Ödeme altyapısı gelene kadar Pro / Pro+ üyelikleri buradan elle verilir. Bitiş tarihi boş bırakılırsa üyelik süresizdir;
        tarih geçince üye otomatik olarak Ücretsiz plana döner.
      </p>

      <form className="mt-6 flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="E-posta ya da ad soyad ara"
          className="h-10 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm"
        />
        <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Ara
        </button>
      </form>

      <p className="mt-4 text-xs font-semibold tracking-wide text-muted-foreground uppercase">
        {q ? `"${q}" için ${uyeler.length} sonuç` : `Aktif ücretli üyeler (${uyeler.length})`}
      </p>
      <ul className="mt-2 divide-y divide-primary/10 rounded-2xl border border-primary/15 bg-white">
        {uyeler.map((u) => (
          <li key={u.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">{u.adSoyad}</p>
              <p className="truncate text-xs text-muted-foreground">
                {u.email}
                {u.telefonDogrulandi && " · telefon doğrulanmış"}
              </p>
              {u.abonelikPlani !== "UCRETSIZ" && !proAktifMi(u) && (
                <span className="mt-1 inline-block rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-semibold text-amber-700">
                  Süresi doldu · Ücretsiz plan uygulanıyor
                </span>
              )}
            </div>
            <AdminUyePlani
              userId={u.id}
              plan={u.abonelikPlani}
              bitis={u.abonelikBitis ? ISTANBUL_GUNU.format(u.abonelikBitis) : null}
            />
          </li>
        ))}
        {uyeler.length === 0 && <li className="px-4 py-6 text-center text-sm text-muted-foreground">Sonuç yok.</li>}
      </ul>
    </div>
  );
}
