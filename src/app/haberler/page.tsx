import { getAllHaberler } from "@/lib/haberler";
import { HaberlerSection } from "@/components/HaberlerSection";

export const revalidate = 300;

export const metadata = {
  title: "Haberler — Kamu Yolu",
  description: "Kamu personel alımları, toplu alım duyuruları ve gündemdeki gelişmeler.",
};

export default async function HaberlerPage() {
  const haberler = await getAllHaberler();

  return (
    <div className="mx-auto max-w-6xl px-4 py-14 sm:px-6 sm:py-20">
      <HaberlerSection
        haberler={haberler.map((h) => ({ ...h, yayinTarihi: h.yayinTarihi.toISOString() }))}
        showAllLink={false}
      />
    </div>
  );
}
