import { soruMetniNumarali, type ExamSoru } from "@/lib/kpssDenemeSabitler";
import { KesirliMetin } from "@/components/KesirliMetin";

/** Sinav ve sonuc ekranlarinda ortak: grup basligi + numarali soru metni + gorsel. */
export function SoruGovdesi({ sorular, index }: { sorular: ExamSoru[]; index: number }) {
  const soru = sorular[index];
  const ayniGrup = (s: ExamSoru) => s.grupId === soru.grupId;
  return (
    <>
      {soru.grupId && (
        <p className="mt-3 text-sm font-semibold text-primary">
          {sorular.findIndex(ayniGrup) + 1}-{sorular.findLastIndex(ayniGrup) + 1}. soruları aşağıdaki{" "}
          {soru.ders === "MATEMATIK" ? "bilgiye" : "parçaya"} göre cevaplayınız.
        </p>
      )}
      <p className="mt-3 whitespace-pre-line text-base font-medium text-slate-800">
        <KesirliMetin metin={soru.grupId ? soruMetniNumarali(soru.soruMetni, index + 1) : soru.soruMetni} />
      </p>
      {soru.gorselSvg && (
        <div
          className="mx-auto mt-4 max-w-md [&_svg]:h-auto [&_svg]:w-full"
          dangerouslySetInnerHTML={{ __html: soru.gorselSvg }}
        />
      )}
    </>
  );
}
