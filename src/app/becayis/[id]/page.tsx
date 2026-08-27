import { notFound } from "next/navigation";
import { MapPin, User } from "lucide-react";
import { getTalepDetay } from "@/lib/becayis";
import { getCurrentUser } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { MessageWidget } from "@/components/MessageWidget";

export default async function BecayisDetayPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [talep, user] = await Promise.all([getTalepDetay(id), getCurrentUser()]);

  if (!talep || !talep.isActive) notFound();

  const isSahibi = user?.id === talep.userId;

  return (
    <div className="mx-auto max-w-2xl px-4 py-14 sm:px-6 sm:py-20">
      <Card className="gap-4 border-primary/20 bg-white/70 p-6 backdrop-blur-md">
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">{talep.meslek}</h1>
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
          <p className="rounded-xl bg-white/70 p-3 text-sm text-slate-700">{talep.aciklama}</p>
        )}

        <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
          <User className="h-3.5 w-3.5" />
          {talep.user.adSoyad}
        </p>

        {!isSahibi && (
          <div className="pt-2">
            <MessageWidget
              talepId={talep.id}
              talepBaslik={`${talep.meslek} — ${talep.mevcutIl}`}
              isLoggedIn={!!user}
            />
          </div>
        )}
        {isSahibi && (
          <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
            Bu senin kendi talebin. Gelen mesajları &quot;Mevcut Taleplerim&quot; sayfandan görebilirsin.
          </p>
        )}
      </Card>
    </div>
  );
}
