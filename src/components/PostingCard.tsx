import { INSTITUTION_TYPE_LABEL, LEVEL_LABEL } from "@/lib/labels";

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
    <div className="rounded-xl border border-neutral-200 bg-white p-5 shadow-sm">
      <div className="flex flex-wrap items-center gap-2 text-xs text-neutral-500">
        <span className="rounded-full bg-neutral-100 px-2 py-1">
          {INSTITUTION_TYPE_LABEL[posting.institutionType] ?? posting.institutionType}
        </span>
        <span className="rounded-full bg-neutral-100 px-2 py-1">{levels}</span>
        {posting.ilanTuru && (
          <span className="rounded-full bg-neutral-100 px-2 py-1">
            {posting.ilanTuru}
          </span>
        )}
        {illerLabel && (
          <span className="rounded-full bg-neutral-100 px-2 py-1">{illerLabel}</span>
        )}
        {!posting.isDepartmentRestricted && (
          <span className="rounded-full bg-emerald-100 px-2 py-1 text-emerald-700">
            Bölüm şartı yok
          </span>
        )}
        {posting.isDemo && (
          <span className="rounded-full bg-amber-100 px-2 py-1 font-medium text-amber-800">
            ÖRNEK VERİ — gerçek ilan değildir
          </span>
        )}
      </div>

      <h3 className="mt-3 text-lg font-semibold text-neutral-900">
        {posting.title}
      </h3>
      <p className="text-sm text-neutral-600">{posting.institutionName}</p>

      {posting.departmentRequirementRaw && (
        <p className="mt-2 line-clamp-3 text-sm text-neutral-500">
          {posting.departmentRequirementRaw}
        </p>
      )}

      <div className="mt-4 flex items-center justify-between">
        <div className="text-xs text-neutral-500">
          {posting.applicationEnd
            ? `Son başvuru: ${posting.applicationEnd.toLocaleDateString("tr-TR")}`
            : "Son başvuru tarihi belirtilmemiş"}
          <span className="mx-1">·</span>
          Kaynak: {posting.sourceName}
        </div>
        <a
          href={posting.sourceUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-700"
        >
          İlana Git
        </a>
      </div>
    </div>
  );
}
