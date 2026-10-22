import { prisma } from "@/lib/prisma";

/**
 * Habere konuya uygun, telifsiz fotograf (Unsplash Lisansi: ticari kullanim serbest; API kosulu: fotografciya ve
 * Unsplash'e baglanti + kullanilan fotografta indirme bildirimi). Kaynak haber sitelerinin fotograflari kullanilmaz
 * (FSEK; ajans fotograflari lisansli). Demo anahtar saatte 50 istek: arama sonucu calisma boyunca paylasilir.
 */
export type GorselKredi = { ad: string; profil: string; sayfa: string };
export type HaberFotografi = { url: string; kredi: GorselKredi };

const UTM = "utm_source=kamu_yolu&utm_medium=referral";

// Turkce konu -> Ingilizce arama terimi. Sira onemli: ilk eslesen kazanir (ozelden genele).
const KONULAR: [RegExp, string][] = [
  // \bebe\b: "muhasebe" eslesmesin; tıp\b: "tıpkı" eslesmesin.
  [/hemşire|\bebe\b|doktor|hekim|sağlık|hastane|tıp\b|tıbb|eczac|diyetisyen|fizyoterap|ambulans/i, "hospital doctor nurse"],
  [/öğretmen|milli eğitim|meb\b|okul|eğitim kurumu/i, "classroom teacher"],
  [/akademi|öğretim (üyesi|görevlisi|elemanı)|üniversite|araştırma görevlisi|profesör|doçent/i, "university campus students"],
  [/polis|emniyet|jandarma|bekçi|güvenlik korucu/i, "police officer"],
  [/asker|msb|savunma|subay|astsubay|uzman çavuş|harp/i, "military soldiers"],
  [/infaz|cezaevi|adalet|mahkeme|hakim|savcı|icra|zabıt katibi/i, "courthouse justice"],
  [/itfaiye/i, "firefighters"],
  [/zabıta|belediye|büyükşehir/i, "city hall street"],
  [/demiryol|tcdd|tren|raylı/i, "railway train"],
  [/iett|tramvay|metro|otobüs|toplu taşıma|ego genel/i, "city tram bus public transport"],
  [/karayol|kgm\b|otoyol|köprü/i, "highway road construction"],
  [/havaliman|dhmi|hava trafik|pilot/i, "airport airplane"],
  [/liman|denizcilik|kıyı emniyeti|gemi/i, "port ship"],
  [/orman|ogm\b/i, "forest"],
  [/tarım|tarim|hayvancılık|veteriner|ziraat/i, "agriculture field farm"],
  [/enerji|elektrik|teiaş|tedaş|doğalgaz|botaş/i, "power lines energy"],
  [/\bsu\b|kanalizasyon|baraj|dsi\b|aski|iski|kaski/i, "water dam"],
  [/vergi|gelir idaresi|maliye|hazine|gümrük|sgk|sosyal güvenlik|muhasebe|denetim|sigorta|mevduat|banka/i, "finance documents office"],
  [/meteoroloji/i, "weather sky clouds"],
  [/kütüphane|kültür|müze|turizm|saray/i, "museum library"],
  [/bilişim|yazılım|bilgisayar|tübitak|teknoloji|siber/i, "technology computer code"],
  [/kpss|sınav|ösym|tercih|atama/i, "exam students writing"],
  [/işçi|sürekli işçi|geçici işçi|iskur|işkur/i, "workers job"],
];
// "government" yabanci devlet binalari getiriyordu (Gelir Idaresi haberine Hindistan meclisi).
const VARSAYILAN = "office desk documents";

export function haberAramaTerimi(h: { baslik: string; kategori?: string | null; kurumAdi?: string | null; ozet?: string | null }) {
  // Once baslik + kategori (asil konu), sonra kurum ve ozet. tr kucultme: /i bayragi "İ"yi "i" saymaz ("Gelir İdaresi").
  for (const metin of [`${h.baslik} ${h.kategori ?? ""}`, `${h.kurumAdi ?? ""} ${h.ozet ?? ""}`]) {
    const kucuk = metin.toLocaleLowerCase("tr");
    for (const [desen, terim] of KONULAR) if (desen.test(kucuk)) return terim;
  }
  return VARSAYILAN;
}

type UnsplashFoto = {
  id: string;
  urls: { raw: string; regular: string };
  links: { html: string; download_location: string };
  user: { name: string; links: { html: string } };
};

function anahtar() {
  return process.env.UNSPLASH_ACCESS_KEY ?? null;
}

async function unsplash<T>(yol: string): Promise<T> {
  const k = anahtar();
  if (!k) throw new Error("UNSPLASH_ACCESS_KEY yok");
  const res = await fetch(`https://api.unsplash.com${yol}`, {
    headers: { Authorization: `Client-ID ${k}`, "Accept-Version": "v1" },
    signal: AbortSignal.timeout(10_000),
  });
  if (!res.ok) throw new Error(`Unsplash ${res.status}`);
  return (await res.json()) as T;
}

/**
 * Terim icin fotograf secer: daha once herhangi bir haberde kullanilmamis ilk fotograf (ayni gorsel tekrar etmesin).
 * `arama` onbellegi bir calismada ayni terimi tekrar sormaz. Unsplash yoksa ya da hata olursa null (logo/kapak kalir).
 */
export async function haberFotografiBul(
  h: { baslik: string; kategori?: string | null; kurumAdi?: string | null; ozet?: string | null },
  arama = new Map<string, UnsplashFoto[]>(),
): Promise<HaberFotografi | null> {
  if (!anahtar()) return null;
  try {
    const terim = haberAramaTerimi(h);
    let sonuc = arama.get(terim);
    if (!sonuc) {
      const r = await unsplash<{ results: UnsplashFoto[] }>(
        `/search/photos?query=${encodeURIComponent(terim)}&per_page=30&orientation=landscape&content_filter=high`,
      );
      sonuc = r.results;
      arama.set(terim, sonuc);
    }
    const kullanilan = new Set(
      (await prisma.haber.findMany({ where: { gorselUrl: { startsWith: "https://images.unsplash.com/" } }, select: { gorselUrl: true } })).map((x) =>
        x.gorselUrl!.split("?")[0],
      ),
    );
    const foto = sonuc.find((f) => !kullanilan.has(f.urls.raw.split("?")[0])) ?? sonuc[0];
    if (!foto) return null;
    // Unsplash API kosulu: kullanilan fotograf icin indirme bildirimi.
    await unsplash(new URL(foto.links.download_location).pathname + new URL(foto.links.download_location).search).catch(() => {});
    return {
      // raw + boyut parametreleri: 1600 genislik, otomatik bicim (webp/avif), iyi sikistirma.
      url: `${foto.urls.raw.split("?")[0]}?ixid=${new URL(foto.urls.raw).searchParams.get("ixid") ?? ""}&w=1600&q=75&auto=format&fit=crop`,
      kredi: { ad: foto.user.name, profil: `${foto.user.links.html}?${UTM}`, sayfa: `https://unsplash.com/?${UTM}` },
    };
  } catch {
    return null;
  }
}
