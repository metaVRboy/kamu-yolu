import { soruMetniNumarali, type GrupAraligi } from "@/lib/kpssDenemeSabitler";
import type { DenemeDers } from "@/generated/prisma/client";

/** Sinav ve sonuc ekranlarinda ortak: grup basligi + numarali soru metni + gorsel. */
export function SoruGovdesi({
  soru,
  grupAraligi,
}: {
  soru: { ders: DenemeDers; soruMetni: string; gorselSvg: string | null };
  grupAraligi: GrupAraligi | null;
}) {
  return (
    <>
      {grupAraligi && (
        <p className="mt-3 text-sm font-semibold text-primary">
          {grupAraligi.ilk}-{grupAraligi.son}. soruları aşağıdaki {soru.ders === "MATEMATIK" ? "bilgiye" : "parçaya"} göre
          cevaplayınız.
        </p>
      )}
      <p className="mt-3 whitespace-pre-line text-base font-medium text-slate-800">
        {grupAraligi ? soruMetniNumarali(soru.soruMetni, grupAraligi.bu) : soru.soruMetni}
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
