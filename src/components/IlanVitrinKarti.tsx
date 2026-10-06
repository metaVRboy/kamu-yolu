import Link from "next/link";
import { ArrowRight, CalendarClock, GraduationCap, Layers, MapPin } from "lucide-react";
import { IlanGorsel } from "@/components/IlanGorsel";
import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";
import { duzgunHarf, kadroAdi, konumMetni, type IlanVitrinGrubu } from "@/lib/ilanVitrin";
import { slugify } from "@/lib/slug";

/** Ana sayfa "Yeni Eklenen Ilanlar" vitrini icin kurum bazli ilan karti. */
export function IlanVitrinKarti({ grup, logoUrl }: { grup: IlanVitrinGrubu; logoUrl: string | null }) {
  const { ilk, ilanSayisi, kadroSayisi, yeni, kalanGun } = grup;
  const kurum = duzgunHarf(ilk.institutionName);
  const href =
    ilanSayisi > 1
      ? `/ilanlar?kurumAdi=${encodeURIComponent(ilk.institutionName)}`
      : `/ilan/${ilk.id}/${slugify(ilk.title)}`;
  const konum = konumMetni(ilk.iller, ilk.institutionName);
  const duzeyler = ilk.educationLevels.map((d) => LEVEL_LABEL[d] ?? d).join(", ");

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-primary/10 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-primary/10">
      <Link href={href} className="relative block">
        <IlanGorsel logoUrl={logoUrl} kurumTuru={ilk.institutionType} kurumAdi={kurum} />
        <div className="absolute inset-x-3 top-3 flex items-start justify-between gap-2">
          <div className="flex flex-wrap gap-1.5">
            {yeni && <span className="rounded-full bg-red-600 px-2.5 py-0.5 text-[11px] font-bold text-white shadow">YENİ</span>}
            <span className="rounded-full bg-black/25 px-2.5 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
              {INSTITUTION_TYPE_LABEL[ilk.institutionType] ?? "Kurum"}
            </span>
          </div>
          {kalanGun !== null && kalanGun >= 0 && (
            <span
              className={`shrink-0 rounded-full px-2.5 py-0.5 text-[11px] font-bold shadow ${
                kalanGun <= 3 ? "bg-red-600 text-white" : kalanGun <= 7 ? "bg-amber-400 text-amber-950" : "bg-white text-primary"
              }`}
            >
              {kalanGun === 0 ? "Son gün" : `${kalanGun} gün kaldı`}
            </span>
          )}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        <p className="line-clamp-1 text-xs font-semibold tracking-wide text-primary">{kurum}</p>
        <h3 className="mt-1 line-clamp-2 font-semibold leading-snug text-slate-900">
          <Link href={href} className="hover:text-primary">
            {kadroAdi(ilk.title, ilk.institutionName)}
          </Link>
        </h3>
        {kadroSayisi > 1 && (
          <p className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-slate-500">
            <Layers className="h-3.5 w-3.5" />+{kadroSayisi - 1} farklı kadro daha
          </p>
        )}

        <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
          {duzeyler && (
            <li className="flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              {duzeyler}
            </li>
          )}
          {konum && (
            <li className="flex items-center gap-1.5">
              <MapPin className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              <span className="line-clamp-1">{konum}</span>
            </li>
          )}
          {ilk.applicationEnd && (
            <li className="flex items-center gap-1.5">
              <CalendarClock className="h-3.5 w-3.5 shrink-0 text-primary/70" />
              Son başvuru: {ilk.applicationEnd.toLocaleDateString("tr-TR", { day: "2-digit", month: "long", year: "numeric" })}
            </li>
          )}
        </ul>

        <div className="mt-auto flex items-center justify-between border-t border-primary/10 pt-3">
          <span className="text-xs text-muted-foreground">{ilk.sourceName}</span>
          <Link
            href={href}
            className="inline-flex items-center gap-1 rounded-full bg-primary px-3.5 py-1.5 text-xs font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
          >
            {ilanSayisi > 1 ? `${ilanSayisi} İlanı Gör` : "İlanı İncele"}
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        </div>
      </div>
    </article>
  );
}
