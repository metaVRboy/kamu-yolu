import { useEffect } from "react";
import { useLocalSearchParams, useNavigation } from "expo-router";
import { IlanListesi } from "@/bilesenler/IlanListesi";
import { DUZEY_ADI, SEVIYE_ENUM } from "@/lib/bicim";

/** Sitedeki /bolum/[slug], /seviye/[level] ve /ilanlar?kurumAdi= sayfalari. */
export default function Liste() {
  const p = useLocalSearchParams<{ kapsam: "tum" | "seviye" | "bolum"; deger?: string; kurumAdi?: string }>();
  const navigation = useNavigation();
  useEffect(() => {
    navigation.setOptions({ title: p.kapsam === "seviye" ? `${DUZEY_ADI[SEVIYE_ENUM[p.deger ?? ""]] ?? ""} Mezunları` : p.kapsam === "bolum" ? "Bölüm İlanları" : "İlanlar" });
  }, [navigation, p.kapsam, p.deger]);
  return <IlanListesi kapsam={p.kapsam ?? "tum"} deger={p.deger} kurumAdi={p.kurumAdi} />;
}
