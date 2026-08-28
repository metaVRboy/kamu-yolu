import Link from "next/link";
import { CalendarDays, Newspaper, ExternalLink } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type HaberItem = {
  id: string;
  baslik: string;
  ozet: string;
  kaynakUrl: string | null;
  yayinTarihi: string;
};

const YENI_ESIGI_GUN = 3;

function isYeni(yayinTarihi: string): boolean {
  const fark = Date.now() - new Date(yayinTarihi).getTime();
  return fark < YENI_ESIGI_GUN * 24 * 60 * 60 * 1000;
}

export function HaberlerSection({ haberler, showAllLink = true }: { haberler: HaberItem[]; showAllLink?: boolean }) {
  return (
    <section>
      <div className="flex items-baseline justify-between">
        <div>
          <h2 className="flex items-center gap-2 text-xl font-semibold text-foreground">
            <Newspaper className="h-5 w-5 text-primary" />
            Haberler
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Kamu personel alımları, toplu alım duyuruları ve gündemdeki gelişmeler.
          </p>
        </div>
        {showAllLink && (
          <Link href="/haberler" className="text-sm font-medium text-primary hover:underline">
            Tümü »
          </Link>
        )}
      </div>

      <div className="mt-6 space-y-3">
        {haberler.length === 0 && (
          <p className="text-sm text-muted-foreground">Henüz haber eklenmedi.</p>
        )}
        {haberler.map((h) => (
          <Card
            key={h.id}
            className="gap-1.5 border-primary/20 bg-white/70 p-5 shadow-sm shadow-primary/5 backdrop-blur-md"
          >
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-semibold text-slate-900">{h.baslik}</h3>
              {isYeni(h.yayinTarihi) && (
                <Badge className={cn("border-transparent bg-red-600 text-white")}>YENİ</Badge>
              )}
            </div>
            <p className="text-sm text-muted-foreground">{h.ozet}</p>
            <div className="mt-1 flex flex-wrap items-center justify-between gap-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <CalendarDays className="h-3.5 w-3.5" />
                {new Date(h.yayinTarihi).toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
              </span>
              {h.kaynakUrl && (
                <a
                  href={h.kaynakUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={cn(buttonVariants({ size: "sm", variant: "outline" }), "border-primary/25")}
                >
                  Kaynağı Gör
                  <ExternalLink className="h-3.5 w-3.5" />
                </a>
              )}
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
