import Link from "next/link";
import { notFound } from "next/navigation";
import { Clock, ListChecks } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import {
  getBugununDenemesi,
  getDenemeSorulari,
  getKatilim,
  denemeyiBitir,
  kalanSureMs,
  sinavaGuvenliHaleGetir,
} from "@/lib/kpssDeneme";
import {
  DUZEY_LABEL,
  SINAV_SURESI_DK,
  TOPLAM_SORU,
  DERS_DAGILIMI,
  DERS_LABEL,
  DERS_SIRASI,
  gecerliDenemeDuzeyiMi,
} from "@/lib/kpssDenemeSabitler";
import { DenemeBaslaButonu } from "@/components/DenemeBaslaButonu";
import { DenemeSinavi } from "@/components/DenemeSinavi";
import { DenemeSonucEkrani } from "@/components/DenemeSonucEkrani";

export default async function KpssDenemesiDuzeyPage({ params }: { params: Promise<{ duzey: string }> }) {
  const { duzey: slug } = await params;
  const duzey = slug.toUpperCase();
  if (!gecerliDenemeDuzeyiMi(duzey)) notFound();

  const user = await getCurrentUser();

  let gunlukDeneme;
  try {
    gunlukDeneme = await getBugununDenemesi(duzey);
  } catch {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-slate-800">{DUZEY_LABEL[duzey]} denemesi henüz hazır değil</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bu düzey için soru havuzu hazırlanıyor, çok yakında burada olacak.
        </p>
        <Link href="/kpss-denemesi" className="mt-4 inline-block text-sm font-medium text-primary hover:underline">
          ← Diğer düzeylere dön
        </Link>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-slate-800">{DUZEY_LABEL[duzey]} KPSS Denemesi</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Bugünün {TOPLAM_SORU} soruluk, {SINAV_SURESI_DK} dakikalık denemesine girebilmek için giriş yapmalısın.
        </p>
        <div className="mt-5 flex items-center justify-center gap-3">
          <Link href="/giris" className="rounded-lg bg-primary px-5 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90">
            Giriş Yap
          </Link>
          <Link href="/kayit-ol" className="rounded-lg border border-primary/20 px-5 py-2.5 text-sm font-semibold text-primary hover:bg-primary/5">
            Kayıt Ol
          </Link>
        </div>
      </div>
    );
  }

  let katilim = await getKatilim(user.id, gunlukDeneme.id);

  // Sure dolmus ama hic bitirilmemis (ör. sekme kapatildi) - otomatik sonuclandir.
  if (katilim && !katilim.bitisZamani && kalanSureMs(katilim.baslangicZamani) <= 0) {
    katilim = await denemeyiBitir(katilim.id, user.id);
  }

  if (!katilim) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-16 text-center sm:px-6">
        <h1 className="text-xl font-semibold text-slate-800">{DUZEY_LABEL[duzey]} KPSS Denemesi</h1>
        <div className="mx-auto mt-4 flex max-w-xs justify-center gap-4 text-sm text-muted-foreground">
          <span className="flex items-center gap-1.5">
            <ListChecks className="h-4 w-4" /> {TOPLAM_SORU} soru
          </span>
          <span className="flex items-center gap-1.5">
            <Clock className="h-4 w-4" /> {SINAV_SURESI_DK} dakika
          </span>
        </div>
        <ul className="mx-auto mt-4 max-w-xs space-y-1 text-left text-sm text-muted-foreground">
          {DERS_SIRASI.map((ders) => (
            <li key={ders} className="flex items-center justify-between">
              <span>{DERS_LABEL[ders]}</span>
              <span className="font-medium text-slate-600">{DERS_DAGILIMI[ders]} soru</span>
            </li>
          ))}
        </ul>
        <p className="mx-auto mt-4 max-w-sm text-xs text-muted-foreground">
          Süre, &quot;Sınava Başla&quot;ya bastığın anda başlar ve duraklatılamaz. Bu düzey için bugün sadece bir kez
          sınava girebilirsin.
        </p>
        <div className="mt-5">
          <DenemeBaslaButonu duzeySlug={slug} />
        </div>
      </div>
    );
  }

  const sorular = await getDenemeSorulari(gunlukDeneme.soruIdler);

  if (katilim.bitisZamani) {
    return (
      <DenemeSonucEkrani
        sorular={sorular}
        cevaplar={katilim.cevaplar as Record<string, number>}
        dogruSayisi={katilim.dogruSayisi ?? 0}
        yanlisSayisi={katilim.yanlisSayisi ?? 0}
        bosSayisi={katilim.bosSayisi ?? 0}
        puan={katilim.puan ?? 0}
      />
    );
  }

  return (
    <DenemeSinavi
      katilimId={katilim.id}
      ilkKalanMs={kalanSureMs(katilim.baslangicZamani)}
      sorular={sinavaGuvenliHaleGetir(sorular)}
      ilkCevaplar={katilim.cevaplar as Record<string, number>}
    />
  );
}
