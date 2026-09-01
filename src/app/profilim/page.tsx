import Link from "next/link";
import { redirect } from "next/navigation";
import { Inbox, Lock, MessageCircle, Repeat, Sparkles } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { getOkunmamisMesajSayisi, getTaleplerim } from "@/lib/becayis";
import { getPostingsForDepartment, getPostingsForLevel } from "@/lib/matching";
import { ProfilLayout } from "@/components/ProfilLayout";
import { LogoutButton } from "@/components/LogoutButton";
import { PostingCard } from "@/components/PostingCard";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export const metadata = { title: "Profilim — Kamu Yolu" };

export default async function ProfilimPage() {
  const user = await getCurrentUser();
  if (!user) redirect("/giris");

  const [taleplerim, okunmamisSayisi] = await Promise.all([
    getTaleplerim(user.id),
    getOkunmamisMesajSayisi(user.id),
  ]);

  const aktifTalepler = taleplerim.filter((t) => t.isActive);

  const sonMesajlar = taleplerim
    .flatMap((t) => t.threads.map((th) => ({ talep: t, thread: th })))
    .flatMap(({ talep, thread }) =>
      thread.mesajlar.map((m) => ({
        talepId: talep.id,
        karsiAdSoyad: thread.karsiAdSoyad,
        mesaj: m.mesaj,
        createdAt: m.createdAt,
        okundu: m.okundu || m.gonderenId === user.id,
      })),
    )
    .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
    .slice(0, 5);

  const isPremium = user.abonelikPlani !== "UCRETSIZ";
  const kisiselIlanlar = user.departmentId
    ? await getPostingsForDepartment(user.departmentId)
    : user.educationLevel
      ? await getPostingsForLevel(user.educationLevel)
      : [];

  return (
    <ProfilLayout okunmamisMesajSayisi={okunmamisSayisi}>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Profilim</h1>
          <p className="mt-1 text-sm text-muted-foreground">{user.adSoyad} — {user.email}</p>
        </div>
        <LogoutButton />
      </div>

      <div className="mt-6 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Card className="gap-3 border-primary/20 bg-white/70 p-5 backdrop-blur-md">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Repeat className="h-4 w-4 text-primary" />
            Aktif Becayiş İlanlarım
          </h2>
          {aktifTalepler.length === 0 ? (
            <div>
              <p className="text-sm text-muted-foreground">Henüz aktif bir becayiş ilanın yok.</p>
              <Link
                href="/becayis/talep-olustur"
                className={cn(buttonVariants({ size: "sm" }), "mt-3")}
              >
                Talep Oluştur
              </Link>
            </div>
          ) : (
            <div className="space-y-2">
              {aktifTalepler.slice(0, 3).map((t) => (
                <Link
                  key={t.id}
                  href="/becayis/taleplerim"
                  className="block rounded-xl border border-primary/10 px-3 py-2 text-sm hover:bg-primary/5"
                >
                  <p className="font-medium text-slate-800">{t.meslek}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.mevcutIl}
                    {t.mevcutIlce ? ` / ${t.mevcutIlce}` : ""}
                  </p>
                </Link>
              ))}
              <Link
                href="/becayis/taleplerim"
                className="block pt-1 text-sm font-medium text-primary hover:underline"
              >
                Tümünü gör »
              </Link>
            </div>
          )}
        </Card>

        <Card className="gap-3 border-primary/20 bg-white/70 p-5 backdrop-blur-md">
          <h2 className="flex items-center gap-2 font-semibold text-slate-900">
            <Inbox className="h-4 w-4 text-primary" />
            Gelen Mesajlarım
            {okunmamisSayisi > 0 && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-primary px-1.5 text-xs font-semibold text-primary-foreground">
                {okunmamisSayisi}
              </span>
            )}
          </h2>
          {sonMesajlar.length === 0 ? (
            <p className="text-sm text-muted-foreground">Henüz bir mesajın yok.</p>
          ) : (
            <div className="space-y-2">
              {sonMesajlar.map((m, i) => (
                <Link
                  key={i}
                  href="/becayis/taleplerim"
                  className={cn(
                    "flex items-start gap-2 rounded-xl border border-primary/10 px-3 py-2 text-sm hover:bg-primary/5",
                    !m.okundu && "bg-primary/5",
                  )}
                >
                  <MessageCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <div className="min-w-0">
                    <p className="font-medium text-slate-800">{m.karsiAdSoyad}</p>
                    <p className="truncate text-xs text-muted-foreground">{m.mesaj}</p>
                  </div>
                </Link>
              ))}
              <Link
                href="/becayis/taleplerim"
                className="block pt-1 text-sm font-medium text-primary hover:underline"
              >
                Tümünü gör »
              </Link>
            </div>
          )}
        </Card>
      </div>

      <div className="mt-6">
        <h2 className="flex items-center gap-2 font-semibold text-slate-900">
          <Sparkles className="h-4 w-4 text-primary" />
          Bana Özel İlanlar
        </h2>
        <p className="mt-1 text-sm text-muted-foreground">
          Profilinde belirttiğin bölüm/öğrenim düzeyine uygun ilanlar burada listelenir.
        </p>

        {kisiselIlanlar.length === 0 ? (
          <p className="mt-4 text-sm text-muted-foreground">
            Eşleşen ilan bulabilmemiz için{" "}
            <Link href="/profilim/ayarlar" className="font-medium text-primary hover:underline">
              profilindeki bölüm veya öğrenim düzeyi bilgini
            </Link>{" "}
            tamamla.
          </p>
        ) : (
          <div className="relative mt-4">
            <div
              className={cn(
                "grid grid-cols-1 gap-4 sm:grid-cols-2",
                !isPremium && "pointer-events-none blur-sm select-none",
              )}
            >
              {kisiselIlanlar.slice(0, 4).map((posting) => (
                <PostingCard key={posting.id} posting={posting} />
              ))}
            </div>

            {!isPremium && (
              <div className="absolute inset-0 flex items-center justify-center">
                <Card className="items-center gap-3 border-primary/25 bg-white/95 p-6 text-center shadow-xl shadow-primary/20 backdrop-blur-md">
                  <Lock className="h-6 w-6 text-primary" />
                  <p className="max-w-xs text-sm font-medium text-slate-800">
                    Sana özel {kisiselIlanlar.length} ilan bulundu. Görmek için hesabını yükselt.
                  </p>
                  <Link href="/profilim/abonelik" className={buttonVariants({ size: "sm" })}>
                    Hesabınızı Yükseltin
                  </Link>
                </Card>
              </div>
            )}
          </div>
        )}
      </div>
    </ProfilLayout>
  );
}
