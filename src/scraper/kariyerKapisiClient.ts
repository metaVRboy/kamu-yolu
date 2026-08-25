import { Agent, request as undiciRequest } from "undici";

const BASE_URL = "https://api.kariyerkapisi.gov.tr/api";

// Next.js, sunucu bilesenlerinde/route handler'larda global fetch'i kendi
// onbellekleme katmaniyla sarmalar; bu yuzden global fetch yerine undici'nin
// dusuk seviyeli request() fonksiyonu dogrudan kullanilir.
//
// NOT: Bu API, Vercel'in (ve muhtemelen diger bulut saglayicilarinin)
// veri merkezi IP araliklarindan gelen baglantilari engelliyor gibi
// gorunuyor - yerelden calisirken sorunsuz, Vercel'den denendiginde
// baglanti asamasinda hicbir yanit donmeden takiliyor (30sn+ bekletildi).
// Bu yuzden zaman asimi kisa tutulup hizli basarisiz olmasi saglaniyor;
// otomatik tarama bu ortamda calistirilmamali, bkz. scripts/run-scrape.cmd.
const dispatcher = new Agent({ connectTimeout: 8_000 });

// Kariyer Kapisi resmi kamu ise alim portalinin herkese acik (girissiz)
// JSON API'leri. Bu uc noktalar tarayicidan devtools ile tespit edilmistir;
// resmi bir API sozlesmesi yoktur, bu yuzden alan adlari degisebilir.
const HEADERS = {
  "Content-Type": "application/json",
  "User-Agent":
    "KamuYoluBot/0.1 (kamu ilanlarini bolume gore listeleyen acik kaynak proje; iletisim: emirhan.koc@sonayyatirim.com)",
};

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function post<T>(path: string, body: unknown, retries = 3): Promise<T> {
  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await undiciRequest(`${BASE_URL}${path}`, {
        method: "POST",
        headers: HEADERS,
        body: JSON.stringify(body),
        dispatcher,
      });
      if (res.statusCode < 200 || res.statusCode >= 300) {
        throw new Error(`Kariyer Kapisi API hatasi: ${path} -> ${res.statusCode}`);
      }
      return (await res.body.json()) as T;
    } catch (err) {
      if (attempt === retries) throw err;
      await sleep(1000 * attempt);
    }
  }
  throw new Error("unreachable");
}

export type SearchIlan = {
  guid: string;
  kurumAdi: string;
  birimAdi: string | null;
  ilanBaslik: string;
  ilanTipi: number;
  ilanTuru: string;
  sonDurumu: string; // "Aktif" | ...
  basTarih: string | null;
  bitTarih: string | null;
};

export async function fetchIlanList(): Promise<SearchIlan[]> {
  const data = await post<{ searchIlan: SearchIlan[] }>("/ilan/GetIseAlimPage", {
    krM_ID: 0,
    searchText: "",
    il: "0",
    ilanTuru: "0",
  });
  return data.searchIlan ?? [];
}

export type AltIlan = {
  ilanBaslik: string;
  ilanMetni: string; // pozisyona ozel aranan nitelikler/bolum sarti (serbest metin)
  unvan: string;
  kontenjanList: { il: string; kontenjan: number }[];
};

export async function fetchAltIlanlar(ilanGuid: string): Promise<AltIlan[]> {
  return post<AltIlan[]>("/altilan/GetAltIlanInfoByIlanIdPublic", { ilanGuid });
}

export function ilanDetayUrl(guid: string): string {
  return `https://kariyerkapisi.gov.tr/IlanDetay?i=${guid}`;
}
