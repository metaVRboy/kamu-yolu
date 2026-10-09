import { Fragment, type ReactNode } from "react";
import { View, type StyleProp, type TextStyle } from "react-native";
import { T } from "@/bilesenler/ui";

// Sitedeki KesirliMetin ile ayni kurallar: "a/3", "0,9/0,03" ve {pay|payda} bloklari dikey kesir.
const TERIM = "[0-9A-Za-z√!¹²³⁰⁴-⁹⁺⁻ˣ]+(?:\\.[0-9]{3})*(?:,[0-9]+)?";
const BASIT_KESIR = new RegExp(`(${TERIM})/(${TERIM})`, "g");

type Stil = StyleProp<TextStyle>;

function Kesir({ pay, payda, stil, renk }: { pay: ReactNode; payda: ReactNode; stil: Stil; renk: string }) {
  return (
    <View style={{ alignItems: "center", marginHorizontal: 2, transform: [{ translateY: 6 }] }}>
      <T style={[stil, { fontSize: 13, lineHeight: 16 }]}>{pay}</T>
      <View style={{ alignSelf: "stretch", height: 1.5, backgroundColor: renk, marginVertical: 1 }} />
      <T style={[stil, { fontSize: 13, lineHeight: 16 }]}>{payda}</T>
    </View>
  );
}

function basitKesirler(metin: string, stil: Stil, renk: string): ReactNode[] {
  const parcalar: ReactNode[] = [];
  let son = 0;
  for (const m of metin.matchAll(BASIT_KESIR)) {
    const [tumu, pay, payda] = m;
    if (!/\d/.test(tumu) && (pay.length > 1 || payda.length > 1)) continue;
    parcalar.push(metin.slice(son, m.index), <Kesir pay={pay} payda={payda} stil={stil} renk={renk} />);
    son = (m.index ?? 0) + tumu.length;
  }
  parcalar.push(metin.slice(son));
  return parcalar;
}

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

function parcala(metin: string, stil: Stil, renk: string): ReactNode {
  const parcalar: ReactNode[] = [];
  let duz = "";
  for (let i = 0; i < metin.length; i++) {
    const blok = metin[i] === "{" ? blokSinirlari(metin, i) : null;
    if (!blok) {
      duz += metin[i];
      continue;
    }
    parcalar.push(...basitKesirler(duz, stil, renk));
    duz = "";
    parcalar.push(
      <Kesir pay={parcala(metin.slice(i + 1, blok.ayrac), stil, renk)} payda={parcala(metin.slice(blok.ayrac + 1, blok.kapanis), stil, renk)} stil={stil} renk={renk} />,
    );
    i = blok.kapanis;
  }
  parcalar.push(...basitKesirler(duz, stil, renk));
  return parcalar.map((p, k) => <Fragment key={k}>{p}</Fragment>);
}

/** Soru/sik/aciklama metni; kesirler pay ustte payda altta. */
export function KesirliMetin({ metin, style, w, renk = "#1e293b" }: { metin: string; style?: Stil; w?: "normal" | "orta" | "yariKalin" | "kalin"; renk?: string }) {
  return (
    <T w={w} style={[{ color: renk }, style]}>
      {parcala(metin, [{ color: renk }], renk)}
    </T>
  );
}
