import { notFound } from "next/navigation";
import { Eye, MapPin, MessageCircle, User } from "lucide-react";
import { KilitliOzellik } from "@/components/KilitliOzellik";
import { getTalepDetay, goruntulenmeSay } from "@/lib/becayis";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { MessageWidget } from "@/components/MessageWidget";
import { ILETISIM_EPOSTA } from "@/lib/site";

// Kisiye ait talep: arama motorlarinda listelenmesin (ad kisaltilsa da meslek + il tanimlayici).
export const metadata = { title: "Becayiş Talebi — Kamu Yolu", robots: { index: false } };

export default async function BecayisDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [talep, user] = await Promise.all([getTalepDetay(id), getCurrentUser()]);

  if (!talep || !talep.isActive) notFound();

  const isSahibi = user?.id === talep.userId;
  const isPremium = !!user && user.abonelikPlani !== "UCRETSIZ";
  const goruntulenme = goruntulenmeSay(talep, user?.id);

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <Card className="gap-4 border-primary/20 bg-white p-6 shadow-sm">
        <h1 className="font-sans text-2xl font-bold tracking-tight text-primary">{talep.meslek}</h1>
        {talep.kurumTuru && <p className="text-sm text-muted-foreground">{talep.kurumTuru}</p>}

        <div className="flex flex-wrap items-center gap-2 text-sm">
          <span className="flex items-center gap-1 rounded-full bg-primary/10 px-3 py-1.5 text-primary">
            <MapPin className="h-3.5 w-3.5" />
            Mevcut: {talep.mevcutIl}{talep.mevcutIlce ? ` / ${talep.mevcutIlce}` : ""}
          </span>
          <span className="text-muted-foreground">→</span>
          <span className="rounded-full bg-emerald-100 px-3 py-1.5 text-emerald-700">
            İstenen: {talep.istenenIller.join(", ")}
          </span>
        </div>

        {talep.aciklama && (
          <p className="rounded-xl bg-primary/5 p-3 text-sm text-slate-700">{talep.aciklama}</p>
        )}

        <p className="flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <User className="h-3.5 w-3.5" />
            {talep.user.adSoyad}
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="h-3.5 w-3.5" />
            {goruntulenme} kez görüntülendi
          </span>
        </p>

        {!isSahibi && (
          <div className="pt-2">
            {user && !isPremium ? (
              <KilitliOzellik
                mevcutPlan={user.abonelikPlani}
                gerekenPlan="PRO"
                kaynak="becayis-mesaj"
                baslik="Becayiş mesajlaşması Pro'da"
                ozellikler={["Talep sahibine site içinden mesaj gönder", "Cevap gelince bildirim ve WhatsApp ile haberdar ol"]}
              >
                <div className="flex min-h-64 items-center justify-center">
                  <span className={buttonVariants({ className: "w-full sm:w-auto sm:px-8" })}>
                    <MessageCircle className="h-4 w-4" />
                    Mesaj Gönder
                  </span>
                </div>
              </KilitliOzellik>
            ) : (
              <MessageWidget
                talepId={talep.id}
                talepBaslik={`${talep.meslek} — ${talep.mevcutIl}`}
                isLoggedIn={!!user}
              />
            )}
          </div>
        )}
        {isSahibi && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Bu senin kendi talebin. Gelen mesajları &quot;Mevcut Taleplerim&quot; sayfandan görebilirsin.
          </p>
        )}
        {/* 5651: barindirilan kullanici icerigi icin bildirim kanali; talep numarasi konuya yazilir. */}
        {!isSahibi && (
          <a
            href={`mailto:${ILETISIM_EPOSTA}?subject=${encodeURIComponent(`Becayiş ilanı bildirimi #${talep.id}`)}&body=${encodeURIComponent("Bildirme nedeniniz:\n")}`}
            className="self-start text-xs text-muted-foreground underline hover:text-slate-700"
          >
            Uygunsuz içeriği bildir
          </a>
        )}
      </Card>
    </div>
  );
}
