import { ScrollView } from "react-native";
import { GraduationCap } from "lucide-react-native";
import { Kart, T } from "@/bilesenler/ui";
import { renk } from "@/lib/tema";

// Asama 2: sitedeki KPSS denemesi ve puan hesaplama buraya tasinacak.
export default function Kpss() {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <Kart style={{ padding: 24, alignItems: "center", gap: 10 }}>
        <GraduationCap size={40} color={renk.birincil} />
        <T w="kalin" style={{ fontSize: 18 }}>
          KPSS Denemesi
        </T>
        <T style={{ textAlign: "center", color: renk.soluk }}>Bu bölüm bir sonraki aşamada ekleniyor.</T>
      </Kart>
    </ScrollView>
  );
}
