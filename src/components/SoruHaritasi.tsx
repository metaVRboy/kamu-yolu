import { DERS_LABEL, type ExamSoru } from "@/lib/kpssDenemeSabitler";

/** Sinav ve sonuc ekranlarinda ortak: derse gore gruplanmis soru numarasi izgarasi. */
export function SoruHaritasi({
  sorular,
  aktifIndex,
  onSec,
  butonSinifi,
  aciklamalar,
}: {
  sorular: ExamSoru[];
  aktifIndex: number;
  onSec: (index: number) => void;
  butonSinifi: (index: number) => string;
  aciklamalar: { etiket: string; sinif: string }[];
}) {
  // Ardisik ayni bolumdeki sorular tek grup; geometri, matematikten ayri grup.
  const gruplar: { ad: string; indeksler: number[] }[] = [];
  sorular.forEach((s, i) => {
    const ad = s.geometri ? "Geometri" : DERS_LABEL[s.ders];
    const son = gruplar.at(-1);
    if (son?.ad === ad) son.indeksler.push(i);
    else gruplar.push({ ad, indeksler: [i] });
  });

  return (
    <div className="rounded-xl border border-primary/15 bg-white p-4">
      <h2 className="text-sm font-semibold text-slate-800">Soru Haritası</h2>
      {gruplar.map((g) => (
        <div key={g.indeksler[0]} className="mt-4">
          <p className="mb-2 text-xs font-semibold tracking-wide text-muted-foreground">
            {g.ad.toLocaleUpperCase("tr-TR")} ({g.indeksler.length})
          </p>
          <div className="grid grid-cols-4 gap-2">
            {g.indeksler.map((i) => (
              <button
                key={sorular[i].id}
                type="button"
                onClick={() => onSec(i)}
                className={`flex h-9 items-center justify-center rounded-md text-xs font-medium transition-colors ${butonSinifi(i)} ${
                  i === aktifIndex ? "ring-2 ring-primary ring-offset-2" : ""
                }`}
              >
                {i + 1}
              </button>
            ))}
          </div>
        </div>
      ))}
      <div className="mt-4 flex flex-wrap gap-x-4 gap-y-1.5 border-t border-primary/10 pt-3 text-xs text-muted-foreground">
        {aciklamalar.map((a) => (
          <span key={a.etiket} className="flex items-center gap-1.5">
            <span className={`h-3.5 w-3.5 rounded-sm ${a.sinif}`} />
            {a.etiket}
          </span>
        ))}
      </div>
    </div>
  );
}
