import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { destroySession, getCurrentUser, sifreyiTeyitEt } from "@/lib/auth";
import { sendEmail } from "@/lib/email";
import { SILME_ONAY_METNI } from "@/lib/authValidation";
import { prisma } from "@/lib/prisma";
import { yasalKayitYaz } from "@/lib/yasalKayit";
import { davetOdulunuVer } from "@/lib/davet";

const EDUCATION_LEVELS = [
  "ILKOGRETIM",
  "LISE",
  "ONLISANS",
  "LISANS",
  "YUKSEK_LISANS",
] as const;

const bodySchema = z.object({
  adSoyad: z.string().trim().min(2, "Ad soyad en az 2 karakter olmalı.").max(100).optional(),
  telefon: z.string().trim().max(30).optional().nullable(),
  meslek: z.string().trim().max(80).optional().nullable(),
  kurumTuru: z.string().trim().max(80).optional().nullable(),
  kamuCalisaniDegil: z.boolean().optional(),
  departmentId: z.string().min(1).optional().nullable(),
  educationLevel: z.enum(EDUCATION_LEVELS).optional().nullable(),
});

export async function PATCH(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });
  }

  // "Kamu çalışanı değilim" işaretliyse kurumTuru/meslek istemciden ne
  // gelirse gelsin gecersiz sayilir.
  const data = { ...parsed.data };
  if (data.kamuCalisaniDegil) {
    data.kurumTuru = null;
    data.meslek = null;
  }

  // Dogrulanmis numara elle degistirilirse SMS'ler yeni numaraya gitmesin: dogrulama sifirlanir.
  const telefonDegisti = data.telefon !== undefined && (data.telefon || null) !== user.telefon;

  const updated = await prisma.user.update({
    where: { id: user.id },
    data: { ...data, ...(telefonDegisti ? { telefonDogrulandi: null } : {}) },
  });
  // Davetle gelen uye ilk kez bolumunu secince profil tamam sayilir: iki tarafa davet hediyesi.
  if (updated.departmentId && !user.departmentId && updated.davetEdenId) await davetOdulunuVer(updated.id);

  return NextResponse.json({
    adSoyad: updated.adSoyad,
    telefon: updated.telefon,
    meslek: updated.meslek,
    kurumTuru: updated.kurumTuru,
    kamuCalisaniDegil: updated.kamuCalisaniDegil,
    departmentId: updated.departmentId,
    educationLevel: updated.educationLevel,
  });
}

const silmeSchema = z.object({ sifre: z.string().optional(), onayMetni: z.string().optional() });

/**
 * Hesabi kalici olarak siler (KVKK m.7). Becayis ilanlari, bildirimler, deneme
 * sonuclari, oturumlar ve foto kullaniciyla birlikte silinir (cascade); baskasinin
 * ilanina gonderdigi mesajlar karsi tarafin sohbeti bozulmasin diye kalir,
 * gonderen bosalir ve "Silinmis kullanici" gorunur (onDelete: SetNull).
 */
export async function DELETE(req: NextRequest) {
  const user = await getCurrentUser();
  if (!user) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });

  const parsed = silmeSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "Geçersiz bilgiler." }, { status: 400 });

  if (user.passwordHash) {
    const sifreHatasi = await sifreyiTeyitEt(user, parsed.data.sifre);
    if (sifreHatasi) return NextResponse.json({ error: sifreHatasi }, { status: 400 });
  } else if (parsed.data.onayMetni?.trim().toLocaleUpperCase("tr-TR") !== SILME_ONAY_METNI) {
    return NextResponse.json({ error: `Onaylamak için "${SILME_ONAY_METNI}" yaz.` }, { status: 400 });
  }

  await prisma.$transaction([
    prisma.emailVerificationCode.deleteMany({ where: { email: user.email } }),
    // Destek kayitlari (yanit gecmisi) kalir ama kime ait oldugu cikarilir; userId cascade ile null olur.
    prisma.destekMesaji.updateMany({ where: { userId: user.id }, data: { ad: "Silinmiş kullanıcı", email: "" } }),
    prisma.user.delete({ where: { id: user.id } }),
  ]);
  // KVKK Silme Yonetmeligi m.7/3: silme isleminin kaydi 3 yil (kim/ne zaman; kisisel veri icermez, yalniz id).
  await yasalKayitYaz("hesap-silindi", user.id);
  await destroySession();

  try {
    await sendEmail({
      to: user.email,
      subject: "Kamu Yolu — Hesabın silindi",
      html: `<p>Merhaba,</p><p>Kamu Yolu hesabın ve hesabınla ilişkili kişisel verilerin talebin üzerine silindi. Becayiş yazışmalarında gönderdiğin mesajlar karşı tarafın kutusunda "Silinmiş kullanıcı" adıyla, destek kayıtların ise adın ve e-posta adresin çıkarılarak saklanır. Bizi tercih ettiğin için teşekkür ederiz.</p>`,
    });
  } catch (err) {
    console.error("Hesap silme e-postası gönderilemedi:", err);
  }
  return NextResponse.json({ ok: true });
}
