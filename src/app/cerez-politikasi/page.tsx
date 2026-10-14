import { Cookie } from "lucide-react";
import Link from "next/link";
import { SayfaBasligi } from "@/components/SayfaBasligi";
import { CerezTercihiDegistir } from "@/components/CerezOnayi";

export const metadata = {
  title: "Çerez Politikası — Kamu Yolu",
  description: "Kamu Yolu'nda kullanılan zorunlu ve ölçüm çerezleri ile çerez tercihini değiştirme.",
};

// Tablo koddaki gercek kullanimla ayni olmali (bkz. CerezOnayi, olcum.ts, auth).
const ZORUNLU: [string, string, string][] = [
  ["kamu_yolu_session", "Giriş yaptığında oturumunu açık tutar", "30 gün"],
  ["google_oauth_*", "Google ile giriş sırasında güvenlik doğrulaması", "Giriş süresince (dakikalar)"],
  ["Cloudflare Turnstile", "Kayıt/giriş formlarında robot doğrulaması", "Oturum"],
  ["kyCerezOnay (yerel depolama)", "Çerez tercihini (ölçüm) hatırlar", "12 ay"],
  ["kyTanitimSon, kyReklamOturumu, kyBekleyenTalep (yerel/oturum depolama)", "Tanıtım penceresinin sıklığı (kampanya linkiyle geldiğin ilk oturumda açılmaz), kayıttan önce seçtiğin plan", "Siz silene kadar / sekme kapanana kadar"],
];

const ONAYLI: [string, string, string][] = [
  ["ky_kaynak", "Siteye geldiğin kampanyayı (utm) kayıt olursan ölçmek için", "30 gün"],
  ["Google Analytics (_ga, _ga_*) — etkinse", "Ziyaret ve dönüşüm ölçümü", "2 yıla kadar"],
  ["Meta pikseli (_fbp) — etkinse", "Meta reklamlarının dönüşüm ölçümü", "3 ay"],
  ["TikTok pikseli (_ttp) — etkinse", "TikTok reklamlarının dönüşüm ölçümü", "13 ay"],
];

function Tablo({ satirlar }: { satirlar: [string, string, string][] }) {
  return (
    <div className="not-prose overflow-x-auto">
      <table className="w-full text-left text-xs">
        <thead className="text-slate-500">
          <tr>
            <th className="py-1.5 pr-3 font-semibold">Çerez / depolama</th>
            <th className="py-1.5 pr-3 font-semibold">Amaç</th>
            <th className="py-1.5 font-semibold">Süre</th>
          </tr>
        </thead>
        <tbody>
          {satirlar.map(([ad, amac, sure]) => (
            <tr key={ad} className="border-t border-slate-100 align-top">
              <td className="py-1.5 pr-3 font-medium text-slate-800">{ad}</td>
              <td className="py-1.5 pr-3">{amac}</td>
              <td className="py-1.5">{sure}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CerezPolitikasiPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-14 sm:px-6 sm:py-20">
      <SayfaBasligi kompakt ikon={Cookie} baslik="Çerez Politikası" />

      <div className="prose prose-slate mt-6 max-w-none space-y-6 rounded-2xl border border-primary/10 bg-white p-6 text-sm leading-relaxed text-slate-700 shadow-sm sm:p-8">
        <section>
          <h2 className="font-sans text-base font-semibold text-primary">1. Çerez Nedir?</h2>
          <p>
            Çerezler ve benzeri teknolojiler (yerel depolama, pikseller), bir siteyi ziyaret ettiğinde tarayıcına kaydedilen küçük
            verilerdir. Sitenin çalışması, tercihlerinin hatırlanması ve ziyaretlerin ölçülmesi için kullanılır. Kamu Yolu&apos;nda
            reklam gösterilmez.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">2. Zorunlu Çerezler (onay gerekmez)</h2>
          <p>Sitenin çalışması ve senin istediğin işlemlerin yapılabilmesi için gereklidir; kapatılırsa giriş yapamazsın.</p>
          <Tablo satirlar={ZORUNLU} />
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">3. Ölçüm Çerezleri (yalnızca onayınla)</h2>
          <p>
            Çerez bildirimindeki <strong>&quot;Kabul et&quot;</strong> ile açık rıza verirsen yüklenir. <strong>&quot;Reddet&quot;</strong> dersen
            hiçbiri yüklenmez; sitenin tüm özelliklerini yine kullanabilirsin. Tercihin 12 ay geçerlidir, sonra yeniden sorulur;
            verdiğin kararın tarihi ve içeriği, rızanın ispatı için kayıt altına alınır. &quot;Etkinse&quot; yazanlar yalnızca ilgili ölçüm aracı sitede açıkken kullanılır. Bu araçların sağlayıcıları
            (Google, Meta, TikTok) yurt dışında yerleşiktir; ayrıntılar{" "}
            <Link href="/kvkk" className="text-primary underline">
              KVKK Aydınlatma Metni
            </Link>
            &apos;ndedir.
          </p>
          <Tablo satirlar={ONAYLI} />
          <p>
            Ölçüm pikselleri etkinse Meta ve TikTok, kampanyalarımızın sonucunu (ör. kayıt olup olmadığını) ölçmek için bu
            sitedeki ziyaretine ait bilgileri alabilir ve bu bilgilerle kendi platformlarında sana reklam gösterebilir. Bunu
            kapatmak için:{" "}
            <a href="https://www.facebook.com/adpreferences" target="_blank" rel="noopener noreferrer" className="text-primary underline">
              facebook.com/adpreferences
            </a>
            ; TikTok: uygulamada Ayarlar &gt; Gizlilik &gt; Reklamlar.
          </p>
        </section>

        <section>
          <h2 className="font-sans text-base font-semibold text-primary">4. Tercihini Değiştir</h2>
          <p>Onayını istediğin an geri alabilir ya da yeniden verebilirsin:</p>
          <CerezTercihiDegistir />
          <p>Tarayıcı ayarlarından da çerezleri silebilir veya engelleyebilirsin; zorunlu çerezleri engellersen giriş yapamazsın.</p>
        </section>

        <p className="text-xs text-muted-foreground">Son güncelleme: 14 Ekim 2026.</p>
      </div>
    </div>
  );
}
