import Link from "next/link";
import { adminSayfasi } from "@/lib/admin";
import { getAllHaberler } from "@/lib/haberler";
import { AdminHaberPanel } from "@/components/AdminHaberPanel";
import { AdminBaslik } from "@/components/admin/AdminUI";

export const metadata = { title: "Haberler — Admin" };

export default async function AdminHaberlerPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await adminSayfasi();
  const q = (await searchParams).q?.trim() ?? "";
  const haberler = await getAllHaberler(q);

  return (
    <>
      <AdminBaslik
        baslik="Haberler"
        aciklama="Haber ekle, hatalı haberi düzelt ya da sil. Değişiklik ana sayfaya ve /haberler sayfasına hemen yansır."
        sag={
          <Link href="/admin/taramalar" className="rounded-full border border-primary/15 px-4 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50">
            Haberleri şimdi araştır →
          </Link>
        }
      />
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Haber ara" className="h-10 min-w-56 flex-1 rounded-xl border border-primary/20 bg-white px-3 text-sm" />
        <button type="submit" className="h-10 rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground">
          Ara
        </button>
      </form>
      <div className="max-w-3xl">
        <AdminHaberPanel haberler={haberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))} />
      </div>
    </>
  );
}
