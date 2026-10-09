import { NextRequest, NextResponse } from "next/server";
import { adminApi } from "@/lib/admin";
import { islemKaydet } from "@/lib/islemKaydi";
import { siteAyarlariniKaydet, siteAyarlariSchema } from "@/lib/siteAyarlari";

export async function PUT(req: NextRequest) {
  const admin = await adminApi();
  if (!admin) return NextResponse.json({ error: "Yetkiniz yok." }, { status: 403 });
  const parsed = siteAyarlariSchema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: parsed.error.issues[0]?.message ?? "Geçersiz bilgiler." }, { status: 400 });

  await siteAyarlariniKaydet(parsed.data);
  const a = parsed.data;
  await islemKaydet(admin, "ayar.guncelle", `Bakım modu ${a.bakimModu ? "AÇIK" : "kapalı"} · şerit: ${a.seritMetni || "yok"}`, "/admin/ayarlar");
  return NextResponse.json({ ok: true });
}
