import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { WebView } from "react-native-webview";
import * as WebBrowser from "expo-web-browser";
import * as Linking from "expo-linking";
import Svg, { Path } from "react-native-svg";
import { T } from "@/bilesenler/ui";
import { api, SITE } from "@/lib/api";
import { renk } from "@/lib/tema";

// Sitedeki Cloudflare Turnstile anahtari (herkese acik "site key"; .env NEXT_PUBLIC_TURNSTILE_SITE_KEY).
const TURNSTILE_ANAHTARI = "0x4AAAAAAEu50UBAMsngar07";

/**
 * Sitedeki TurnstileWidget: robot dogrulamasi. Yalniz bu kutu kucuk bir web gorunumunde
 * calisir (Cloudflare'in yerel SDK'si yok); sayfa site adresiyle yuklenir ki anahtar gecerli olsun.
 */
export function RobotDogrulama({ dogrulandi }: { dogrulandi: (token: string | null) => void }) {
  const html = `<!DOCTYPE html><html><head><meta name="viewport" content="width=device-width,initial-scale=1">
<script src="https://challenges.cloudflare.com/turnstile/v0/api.js?onload=yukle" async defer></script></head>
<body style="margin:0;display:flex;justify-content:center;background:transparent">
<div id="k"></div>
<script>function gonder(t){window.ReactNativeWebView.postMessage(t||"")}
function yukle(){turnstile.render("#k",{sitekey:"${TURNSTILE_ANAHTARI}",language:"tr",callback:gonder,"expired-callback":function(){gonder("")},"error-callback":function(){gonder("")}})}</script>
</body></html>`;
  return (
    <View style={{ height: 70, alignItems: "center" }}>
      <WebView
        source={{ html, baseUrl: "https://www.kamuyolu.com" }}
        onMessage={(e) => dogrulandi(e.nativeEvent.data || null)}
        style={{ width: 310, height: 70, backgroundColor: "transparent" }}
        scrollEnabled={false}
        originWhitelist={["*"]}
      />
    </View>
  );
}

export const GOOGLE_HATALARI: Record<string, string> = {
  google: "Google ile giriş başarısız oldu. Lütfen tekrar deneyin.",
  "google-email": "Google hesabının e-postası doğrulanmamış görünüyor.",
  "google-yapilandirma": "Google ile giriş şu anda kullanılamıyor.",
  askida: "Hesabın askıya alındı. Bir hata olduğunu düşünüyorsan bizimle iletişime geç.",
};

/**
 * Google ile giris: telefonun tarayicisinda sitenin Google akisi acilir (Google, uygulama ici
 * web gorunumune izin vermez). Bitince site tek kullanimlik kodla uygulamaya doner,
 * kod sunucuda oturuma cevrilir. Hata mesaji doner; basariliysa null.
 */
export async function googleIleGiris(): Promise<string | null> {
  const sonuc = await WebBrowser.openAuthSessionAsync(`${SITE}/api/auth/google?uygulama=1`, "kamuyolu://giris");
  if (sonuc.type !== "success") return null;
  const { kod, hata } = Linking.parse(sonuc.url).queryParams ?? {};
  if (typeof hata === "string") return GOOGLE_HATALARI[hata] ?? GOOGLE_HATALARI.google;
  if (typeof kod !== "string") return GOOGLE_HATALARI.google;
  try {
    await api("/api/auth/uygulama-giris", { govde: { kod } });
    return null;
  } catch (e) {
    return e instanceof Error ? e.message : GOOGLE_HATALARI.google;
  }
}

export function GoogleButonu({ basarili }: { basarili: () => void }) {
  const [hata, setHata] = useState<string | null>(null);
  return (
    <View style={{ gap: 6 }}>
      <Pressable
        onPress={async () => {
          setHata(null);
          const h = await googleIleGiris();
          if (h) setHata(h);
          else basarili();
        }}
        style={({ pressed }) => [s.google, pressed && { backgroundColor: "#f8fafc" }]}
      >
        <Svg width={16} height={16} viewBox="0 0 48 48">
          <Path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3c-1.6 4.7-6.1 8-11.3 8-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z" />
          <Path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.6 15.9 18.9 13 24 13c3.1 0 5.9 1.1 8 3l5.7-5.7C34.6 6.1 29.6 4 24 4 16.3 4 9.7 8.3 6.3 14.7z" />
          <Path fill="#4CAF50" d="M24 44c5.5 0 10.4-2.1 14.1-5.6l-6.5-5.5C29.5 34.6 26.9 35.5 24 35.5c-5.2 0-9.6-3.3-11.2-7.9l-6.5 5C9.6 39.6 16.3 44 24 44z" />
          <Path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.8 2.3-2.2 4.2-4.1 5.6l6.5 5.5C40.9 36.4 44 30.9 44 24c0-1.3-.1-2.7-.4-3.5z" />
        </Svg>
        <T w="orta" style={{ color: "#334155" }}>
          Google
        </T>
      </Pressable>
      {!!hata && <T style={{ color: renk.hata, fontSize: 13 }}>{hata}</T>}
    </View>
  );
}

const s = StyleSheet.create({
  google: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, borderWidth: 1, borderColor: renk.kenar, borderRadius: 12, backgroundColor: "#fff", paddingVertical: 12 },
});
