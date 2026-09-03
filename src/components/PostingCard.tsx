import Link from "next/link";
import { ArrowUpRight, Building2, CalendarClock, MapPin } from "lucide-react";
import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

export type PostingCardData = {
  id: string;
  title: string;
  institutionName: string;
  institutionType: string;
  ilanTuru: string | null;
  iller: string[];
  sourceName: string;
  sourceUrl: string;
  educationLevels: string[];
  departmentRequirementRaw: string | null;
  isDepartmentRestricted: boolean;
  isDemo: boolean;
  applicationEnd: Date | null;
  publishedAt: Date | null;
};

export function PostingCard({ posting }: { posting: PostingCardData }) {
  const levels = posting.educationLevels
    .map((l) => LEVEL_LABEL[l] ?? l)
    .join(", ");

  const illerLabel = posting.iller.length > 0 ? posting.iller.join(", ") : null;

  return (
    <Card className="group gap-3 border-primary/20 bg-white p-5 shadow-sm transition-shadow hover:shadow-md hover:shadow-primary/10">
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <Badge className="gap-1 border-primary/15 bg-primary/10 font-normal text-primary">
          <Building2 className="h-3 w-3" />
          {INSTITUTION_TYPE_LABEL[posting.institutionType] ?? posting.institutionType}
        </Badge>
        <Badge className="border-primary/15 bg-primary/10 font-normal text-primary">
          {levels}
        </Badge>
        {posting.ilanTuru && (
          <Badge className="border-primary/15 bg-primary/10 font-normal text-primary">
            {posting.ilanTuru}
          </Badge>
        )}
        {illerLabel && (
          <Badge className="gap-1 border-primary/15 bg-primary/10 font-normal text-primary">
            <MapPin className="h-3 w-3" />
            {illerLabel}
          </Badge>
        )}
        {!posting.isDepartmentRestricted && (
          <Badge className="border-transparent bg-emerald-100 font-normal text-emerald-700 hover:bg-emerald-100">
            Bölüm şartı yok
          </Badge>
        )}
        {posting.isDemo && (
          <Badge className="border-transparent bg-amber-100 font-medium text-amber-800 hover:bg-amber-100">
            ÖRNEK VERİ — gerçek ilan değildir
          </Badge>
        )}
      </div>

      <h3 className="text-lg font-semibold leading-snug text-foreground">
        {posting.title}
      </h3>
      <p className="-mt-2 text-sm text-muted-foreground">{posting.institutionName}</p>

      {posting.departmentRequirementRaw && (
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {posting.departmentRequirementRaw}
        </p>
      )}

      <div className="mt-1 flex items-center justify-between gap-3 border-t border-border/60 pt-4">
        <div className="flex flex-col gap-0.5 text-xs text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <CalendarClock className="h-3.5 w-3.5" />
            {posting.applicationEnd
              ? `Son başvuru: ${posting.applicationEnd.toLocaleDateString("tr-TR")}`
              : "Son başvuru tarihi belirtilmemiş"}
          </span>
          <span>Kaynak: {posting.sourceName}</span>
        </div>
        <Link
          href={posting.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className={buttonVariants({ size: "sm", className: "shrink-0" })}
        >
          İlana Git
          <ArrowUpRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </Card>
  );
}
