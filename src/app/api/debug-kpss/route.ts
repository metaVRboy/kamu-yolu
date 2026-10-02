import { NextResponse } from "next/server";

// GECICI TEShIS ENDPOINT'I - memurlar.net'e giden fetch'in Vercel'de
// gercekte ne dondurdugunu gormek icin. Sorun teshis edilince silinecek.
export async function GET() {
  try {
    const res = await fetch("https://kpss.memurlar.net/istatistik/unvan/default.aspx?Type=4", {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; KamuYoluBot/1.0)" },
      signal: AbortSignal.timeout(9000),
    });
    const buffer = await res.arrayBuffer();
    const text = new TextDecoder("iso-8859-9").decode(buffer);
    return NextResponse.json({
      status: res.status,
      ok: res.ok,
      headers: Object.fromEntries(res.headers.entries()),
      bodyPreview: text.slice(0, 1500),
    });
  } catch (e) {
    return NextResponse.json({
      hata: e instanceof Error ? e.message : String(e),
      isim: e instanceof Error ? e.name : undefined,
    });
  }
}
