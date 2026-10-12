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
        // <img> ile: icindeki <script>/on* calismaz (XSS kapali). SVG'ler xmlns'li ve kendi fontunu tasiyor.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={`data:image/svg+xml;charset=utf-8,${encodeURIComponent(soru.gorselSvg)}`}
          alt="Soru görseli"
          className="mx-auto mt-4 h-auto w-full max-w-md"
        />
      )}
    </>
  );
}
