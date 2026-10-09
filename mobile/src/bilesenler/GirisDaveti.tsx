import { ScrollView, View } from "react-native";
import { router } from "expo-router";
import { LogIn, UserPlus, UserRound } from "lucide-react-native";
import { Buton, Kart, T } from "@/bilesenler/ui";
import { renk } from "@/lib/tema";

type Metin = { baslik?: string; metin?: string };

/** Giris gerektiren ekranlarda (sitede /giris'e yonlendirme) giris/kayit daveti. */
export function GirisDaveti(p: Metin) {
  return (
    <ScrollView contentContainerStyle={{ padding: 16 }}>
      <GirisKarti {...p} />
    </ScrollView>
  );
}

export function GirisKarti({
  baslik = "Giriş yapmalısın",
  metin = "Bu sayfayı kullanmak için hesabına giriş yap.",
}: Metin) {
  return (
    <Kart style={{ padding: 24, alignItems: "center", gap: 12 }}>
      <View
        style={{
          width: 64,
          height: 64,
          borderRadius: 32,
          backgroundColor: renk.birincilZemin,
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <UserRound size={32} color={renk.birincil} />
      </View>
      <T w="kalin" style={{ fontSize: 20 }}>
        {baslik}
      </T>
      <T style={{ textAlign: "center", color: renk.soluk, lineHeight: 20 }}>
        {metin}
      </T>
      <Buton
        etiket="Giriş Yap"
        ikon={LogIn}
        onPress={() => router.push("/giris")}
        style={{ alignSelf: "stretch", marginTop: 8 }}
      />
      <Buton
        etiket="Kayıt Ol"
        tur="cerceve"
        ikon={UserPlus}
        onPress={() => router.push("/kayit")}
        style={{ alignSelf: "stretch" }}
      />
    </Kart>
  );
}
