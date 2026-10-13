import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { adminApi } from "@/lib/admin";
import { kaynakTemizle } from "@/lib/kaynak";

const hucre = (v: unknown) => `"${String(v ?? "").replace(/"/g, '""')}"`;

/**
 * Bekleme listesi CSV (odeme acilinca haber verilecekler). Acik alan listesi: sifre/oturum gibi
 * alanlar asla cikmaz. ticariIletiOnay kampanya iletisi gonderilip gonderilemeyecegini gosterir.
 */
export async function GET() {
  if (!(await adminApi())) return NextResponse.json({ error: "Yetkisiz." }, { status: 403 });
  const talepler = await prisma.yukseltmeTalebi.findMany({
    orderBy: { olusturma: "asc" },
    select: {
      plan: true,
      yillik: true,
      kaynak: true,
      olusturma: true,
      user: { select: { adSoyad: true, email: true, ticariIletiOnay: true, kaynak: true, createdAt: true } },
    },
  });
  const satirlar = [
    ["Ad Soyad", "E-posta", "Plan", "Dönem", "Buton", "Talep tarihi", "Kayıt tarihi", "Ticari ileti onayı", "utm_source", "utm_campaign", "ref"],
    ...talepler.map((t) => {
      const k = kaynakTemizle(t.user.kaynak);
      return [
        t.user.adSoyad,
        t.user.email,
        t.plan === "PRO_PLUS" ? "Pro+" : "Pro",
        t.yillik ? "yıllık" : "aylık",
        t.kaynak,
        t.olusturma.toISOString(),
        t.user.createdAt.toISOString(),
        t.user.ticariIletiOnay ? "evet" : "hayır",
        k?.utm_source,
        k?.utm_campaign,
        k?.ref,
      ];
    }),
  ];
  // BOM: Excel Turkce karakterleri dogru acsin.
  const csv = "﻿" + satirlar.map((s) => s.map(hucre).join(";")).join("\r\n");
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="bekleme-listesi-${new Date().toISOString().slice(0, 10)}.csv"`,
      "Cache-Control": "no-store",
    },
  });
}
