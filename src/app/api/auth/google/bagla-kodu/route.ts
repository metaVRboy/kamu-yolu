import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAktifOturumId, getCurrentUser, googleBaglaJetonu, sifreyiTeyitEt } from "@/lib/auth";

const bodySchema = z.object({ sifre: z.string().optional() });

/**
 * Google baglamadan once: sifreli hesapta sifre teyidi (calinmis cerezle kalici Google arka kapisi
 * acilamasin), sonra bu oturuma bagli kisa omurlu (3 dk) jeton. Site /api/auth/google?bagla=<jeton>,
 * uygulama ayrica &uygulama=1 ile acar.
 */
export async function POST(req: NextRequest) {
  const user = await getCurrentUser();
  const oturumId = await getAktifOturumId();
  if (!user || !oturumId) return NextResponse.json({ error: "Giriş yapmalısınız." }, { status: 401 });
  const parsed = bodySchema.safeParse(await req.json().catch(() => ({})));
  const sifreHatasi = await sifreyiTeyitEt(user, parsed.success ? parsed.data.sifre : undefined);
  if (sifreHatasi) return NextResponse.json({ error: sifreHatasi }, { status: 400 });
  return NextResponse.json({ kod: await googleBaglaJetonu({ userId: user.id, oturumId }, 180) });
}
