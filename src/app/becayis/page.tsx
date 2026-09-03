import Link from "next/link";
import { ArrowUpRight, MapPin, Repeat } from "lucide-react";
import { getAktifTalepler } from "@/lib/becayis";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export const revalidate = 60;

export const metadata = {
  title: "Becayiş İlanları — Kamu Yolu",
  description: "Kamu personeli arasında il/ilçe değişimi (becayiş) talepleri.",
};

export default async function BecayisPage() {
  const talepler = await getAktifTalepler();

  return (
    <div className="mx-auto max-w-4xl px-4 py-14 sm:px-6 sm:py-20">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            <Repeat className="h-6 w-6 text-primary" />
            Becayiş İlanları
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Kamu personeli arasında il/ilçe değişimi talepleri.
          </p>
        </div>
        <Link href="/becayis/talep-olustur" className={buttonVariants()}>
          Talep Oluştur
        </Link>
      </div>

      <div className="mt-8 space-y-3">
        {talepler.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz becayiş talebi yok.</p>
        )}
        {talepler.map((talep) => (
          <Link key={talep.id} href={`/becayis/${talep.id}`}>
            <Card
              className={cn(
                "gap-2 border-primary/20 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/10",
              )}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="font-semibold text-slate-900">{talep.meslek}</h3>
                <span className="flex items-center gap-1 text-xs text-primary">
                  <ArrowUpRight className="h-3.5 w-3.5" />
                  Detay
                </span>
              </div>
              {talep.kurumTuru && (
                <p className="text-sm text-muted-foreground">{talep.kurumTuru}</p>
              )}
              <div className="flex flex-wrap items-center gap-2 text-sm text-slate-700">
                <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-primary">
                  <MapPin className="h-3.5 w-3.5" />
                  {talep.mevcutIl}{talep.mevcutIlce ? ` / ${talep.mevcutIlce}` : ""}
                </span>
                <span className="text-muted-foreground">→</span>
                <span className="text-slate-600">{talep.istenenIller.join(", ")}</span>
              </div>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
