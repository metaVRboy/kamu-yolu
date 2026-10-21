import Link from "next/link";
import { Handshake, Inbox } from "lucide-react";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisIlgilendiklerimSayisi, getTaleplerim, karsilikliEslesmeler } from "@/lib/becayis";
import { YukseltButonu } from "@/components/YukseltmePenceresi";
import { TaleplerimList } from "@/components/TaleplerimList";
import { ProfilLayout } from "@/components/ProfilLayout";

export const metadata = { title: "Mevcut Taleplerim — Kamu Yolu" };

export default async function TaleplerimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [talepler, okunmamisIlgilendiklerimSayisi] = await Promise.all([
    getTaleplerim(user.id),
    getOkunmamisIlgilendiklerimSayisi(user.id),
  ]);
  const okunmamisSayisi = talepler.reduce(
    (sum, t) => sum + t.threads.reduce((s, th) => s + th.okunmamisSayisi, 0),
    0,
  );
  const eslesmeler = await karsilikliEslesmeler(talepler, user.id);
  const eslesenler = talepler.flatMap((t) => (eslesmeler.get(t.id) ?? []).map((e) => ({ talep: t, e })));
  const pro = user.abonelikPlani !== "UCRETSIZ";

  return (
    <ProfilLayout
      okunmamisMesajSayisi={okunmamisSayisi}
      okunmamisIlgilendiklerimSayisi={okunmamisIlgilendiklerimSayisi}
    >
      <SayfaBasligi
        kompakt
        ikon={Inbox}
        baslik="Mevcut Taleplerim"
        aciklama="Becayiş taleplerin ve sana gelen mesajlar."
      />
      {/* Karsilikli eslesme: ayni meslek, iki taraf da birbirinin iline gitmek istiyor. Mesaj Pro'da. */}
      {eslesenler.length > 0 && (
        <section className="mt-6 rounded-3xl border border-emerald-200 bg-emerald-50 p-5 sm:p-6">
          <p className="flex items-center gap-2 font-bold text-emerald-900">
            <Handshake className="h-5 w-5" aria-hidden />
            Talebinle karşılıklı eşleşen {eslesenler.length} kişi var
          </p>
          <p className="mt-1 text-sm text-emerald-900">Aynı meslekte; o senin iline, sen onun iline gitmek istiyorsunuz.</p>
          <ul className="mt-3 space-y-2">
            {eslesenler.map(({ talep, e }) => (
              <li key={`${talep.id}-${e.id}`} className="flex flex-wrap items-center justify-between gap-2 rounded-2xl bg-white p-3 text-sm shadow-sm">
                <span>
                  <strong className="text-slate-900">{e.adSoyad}</strong> · {e.meslek} · {e.mevcutIl}
                  {e.mevcutIlce ? ` / ${e.mevcutIlce}` : ""} → {talep.mevcutIl}
                </span>
                {pro ? (
                  <Link href={`/becayis/${e.id}`} className="rounded-xl bg-emerald-700 px-3 py-1.5 font-semibold text-white hover:bg-emerald-800">
                    Talebi aç, mesaj at
                  </Link>
                ) : (
                  <YukseltButonu plan="PRO" kaynak="becayis-mesaj" className="rounded-xl bg-emerald-700 px-3 py-1.5 font-semibold text-white hover:bg-emerald-800">
                    Mesaj atmak için Pro
                  </YukseltButonu>
                )}
              </li>
            ))}
          </ul>
        </section>
      )}
      <div className="mt-6">
        <TaleplerimList
          talepler={talepler.map((t) => ({
            ...t,
            threads: t.threads.map((th) => ({
              ...th,
              mesajlar: th.mesajlar.map((m) => ({ ...m, createdAt: m.createdAt.toISOString() })),
            })),
          }))}
          currentUserId={user.id}
        />
      </div>
    </ProfilLayout>
  );
}
