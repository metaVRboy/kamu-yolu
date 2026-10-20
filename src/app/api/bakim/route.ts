import { NextRequest, NextResponse } from "next/server";
import { suresiDolanYasalKayitlariSil } from "@/lib/yasalKayit";
import { tazelikKaydet } from "@/lib/kpssTazelik";
import { prisma } from "@/lib/prisma";
import { sendEmail } from "@/lib/email";
import { ILETISIM_EPOSTA, SITE_URL } from "@/lib/site";

/**
 * Gunluk bakim (Vercel Cron, 04:00 TR): saklama suresi dolan yasal kayitlari siler (5651 trafik kaydi 2 yil,
 * hesap silme kaydi 3 yil; sonra KVKK geregi tutulmaz). Gunun KPSS denemelerini ilk ziyaretciden once
 * olusturur ve dunkulerden farkini (tazelik) Taramalar sayfasina yazar.
 */
export async function GET(req: NextRequest) {
  const sir = process.env.CRON_SECRET;
  if (!sir || req.headers.get("authorization") !== `Bearer ${sir}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const silinen = await suresiDolanYasalKayitlariSil();
  const temizlenen = await gereksizKayitlariSil();
  const tazelik = await tazelikKaydet().catch((e) => String(e).slice(0, 300));
  const btk = await btkHatirlatmasi().catch((e) => String(e).slice(0, 300));
  return NextResponse.json({ ok: true, silinen, temizlenen, tazelik, btk });
}

/**
 * 5651 yer saglayici (BTK bildirimi kabul: 20.10.2026): her ayin ilk haftasinda barindirilan alan adlarinin
 * bilgi dosyasi (CSV) BTK sistemine yuklenir. Ayin 1'inde (TR) kurumsal adrese hatirlatma gider.
 */
async function btkHatirlatmasi() {
  if (new Date(Date.now() + 3 * 3_600_000).getUTCDate() !== 1) return "gun degil";
  await sendEmail({
    to: ILETISIM_EPOSTA,
    subject: "Hatırlatma: BTK alan adı bilgi dosyası (bu hafta)",
    html: `<p>5651 sayılı Kanun kapsamında yer sağlayıcı olarak, bu ayın ilk haftası içinde barındırılan alan adlarının bilgi dosyasını (CSV) BTK sistemine yüklemen gerekiyor.</p>
<p>1. Dosyayı indir (admin girişiyle): <a href="${SITE_URL}/api/admin/btk-alan-adi">Barindirilan Alan Adlari.csv</a></p>
<p>2. Yükle: <a href="https://internet.btk.gov.tr">internet.btk.gov.tr</a> → Yer Sağlayıcı → Alan Adı Bilgi Dosyasını Yükle → "Barındırılan Alan Adları"</p>`,
  });
  return "gonderildi";
}

/**
 * KVKK m.4/2-d (gerektigi kadar saklama): yarim kalmis kayitlar (ad, e-posta, sifre ozeti), suresi dolmus
 * kod/jetonlar, 30 gunden eski kilit/sayac kayitlari (e-posta icerir) ve 90 gunden eski kapali oturumlar.
 */
async function gereksizKayitlariSil() {
  const once = (gun: number) => new Date(Date.now() - gun * 86_400_000);
  const simdi = new Date();
  const r = await prisma.$transaction([
    prisma.emailVerificationCode.deleteMany({ where: { expiresAt: { lt: once(1) } } }),
    prisma.passwordResetToken.deleteMany({ where: { expiresAt: { lt: once(1) } } }),
    prisma.telefonDogrulamaKodu.deleteMany({ where: { expiresAt: { lt: simdi } } }),
    prisma.epostaDegisiklikKodu.deleteMany({ where: { expiresAt: { lt: simdi } } }),
    prisma.authAbuse.deleteMany({ where: { lastFailAt: { lt: once(30) }, OR: [{ lockedUntil: null }, { lockedUntil: { lt: simdi } }] } }),
    prisma.oturum.deleteMany({ where: { kapatildi: { lt: once(90) } } }),
  ]);
  return r.reduce((t, x) => t + x.count, 0);
}
