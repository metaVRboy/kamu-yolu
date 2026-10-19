import { Fragment, type ReactNode } from "react";

// Kesrin bir tarafi: rakam/harf/kok/faktoriyel/ust simgeleri, binlik ayrac ("500.000") ve ondalik kismi ("0,03").
const TERIM = "[0-9A-Za-z√!¹²³⁰⁴-⁹⁺⁻ˣ]+(?:\\.[0-9]{3})*(?:,[0-9]+)?";
const BASIT_KESIR = new RegExp(`(${TERIM})/(${TERIM})`, "g");

function Kesir({ pay, payda }: { pay: ReactNode; payda: ReactNode }) {
  return (
    <span className="mx-0.5 inline-flex flex-col items-center gap-0.5 py-0.5 text-center align-middle leading-tight">
      <span className="px-0.5">{pay}</span>
      <span aria-hidden className="self-stretch border-t-[1.5px] border-current" />
      <span className="px-0.5">{payda}</span>
    </span>
  );
}

/** Boşluksuz "a/3", "0,9/0,03", "5!/3!" -> dikey kesir. "km/sa" gibi rakamsız çok harfli ifadelere dokunmaz. */
function basitKesirler(metin: string): ReactNode[] {
  const parcalar: ReactNode[] = [];
  let son = 0;
  for (const m of metin.matchAll(BASIT_KESIR)) {
    const [tumu, pay, payda] = m;
    if (!/\d/.test(tumu) && (pay.length > 1 || payda.length > 1)) continue;
    parcalar.push(metin.slice(son, m.index), <Kesir pay={pay} payda={payda} />);
    son = m.index + tumu.length;
  }
  parcalar.push(metin.slice(son));
  return parcalar;
}

/** `{pay|payda}` blogunun ayracini ve kapanisini bulur (ic ice bloklar atlanir). */
function blokSinirlari(metin: string, acilis: number) {
  let derinlik = 0;
  let ayrac = -1;
  for (let i = acilis; i < metin.length; i++) {
    if (metin[i] === "{") derinlik++;
    else if (metin[i] === "}" && --derinlik === 0) return ayrac >= 0 ? { ayrac, kapanis: i } : null;
    else if (metin[i] === "|" && derinlik === 1 && ayrac < 0) ayrac = i;
  }
  return null;
}

/** `^{...}` / `√{...}` blogunun kapanis parantezi (ic ice bloklar atlanir); yoksa -1. */
function kapanisBul(metin: string, acilis: number) {
  let derinlik = 0;
  for (let i = acilis; i < metin.length; i++) {
    if (metin[i] === "{") derinlik++;
    else if (metin[i] === "}" && --derinlik === 0) return i;
  }
  return -1;
}

function parcala(metin: string): ReactNode {
  const parcalar: ReactNode[] = [];
  let duz = "";
  for (let i = 0; i < metin.length; i++) {
    // Ust: 2^{x+1}; kok: √{x − 8} (ustu cizgili kok).
    const ozel = (metin[i] === "^" || metin[i] === "√") && metin[i + 1] === "{" ? kapanisBul(metin, i + 1) : -1;
    if (ozel > 0) {
      parcalar.push(...basitKesirler(duz));
      duz = "";
      const ic = parcala(metin.slice(i + 2, ozel));
      parcalar.push(
        metin[i] === "^" ? (
          <sup className="text-[0.7em]">{ic}</sup>
        ) : (
          <span className="inline-flex items-start">
            <span>√</span>
            <span className="mt-[0.15em] border-t-[1.5px] border-current pt-px leading-tight">{ic}</span>
          </span>
        ),
      );
      i = ozel;
      continue;
    }
    const blok = metin[i] === "{" ? blokSinirlari(metin, i) : null;
    if (!blok) {
      duz += metin[i];
      continue;
    }
    parcalar.push(...basitKesirler(duz));
    duz = "";
    parcalar.push(<Kesir pay={parcala(metin.slice(i + 1, blok.ayrac))} payda={parcala(metin.slice(blok.ayrac + 1, blok.kapanis))} />);
    i = blok.kapanis;
  }
  parcalar.push(...basitKesirler(duz));
  return parcalar.map((p, k) => <Fragment key={k}>{p}</Fragment>);
}

/**
 * Deneme soru/şık/açıklama metinlerini kesirler dikey (pay üstte, payda altta)
 * gösterilecek biçimde basar. Bileşik kesir veride `{pay|payda}` ile yazılır;
 * iç içe olabilir: `{1|2 + 3/4}`. Üs `2^{x+1}`, üstü çizgili kök `√{x − 8}`.
 */
export function KesirliMetin({ metin }: { metin: string }) {
  return <>{parcala(metin)}</>;
}
