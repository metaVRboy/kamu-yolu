import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { matchDepartmentsForText } from "@/lib/matching";
import { prisma } from "@/lib/prisma";
import { LEVEL_ENUM_TO_SLUG } from "@/lib/levels";
import { LEVEL_LABEL } from "@/lib/labels";

export const maxDuration = 30;

const EDUCATION_LEVELS = [
  "ILKOGRETIM",
  "LISE",
  "ONLISANS",
  "LISANS",
  "YUKSEK_LISANS",
] as const;

const ChatResponseSchema = z.object({
  reply: z
    .string()
    .describe(
      "Kullanıcıya gösterilecek kısa (1-3 cümle), sıcak ve samimi Türkçe yanıt.",
    ),
  departmentQuery: z
    .string()
    .nullable()
    .describe(
      "Kullanıcının bahsettiği SPESİFİK bölüm/meslek alanının yaygın Türkçe akademik adı (ör. 'Bilgisayar Mühendisliği'). Belirli bir bölüm anlaşılmıyorsa null.",
    ),
  educationLevel: z
    .enum(EDUCATION_LEVELS)
    .nullable()
    .describe(
      "Kullanıcının öğrenim derecesi/mezuniyet seviyesi belli oluyorsa (lise/önlisans/lisans/yüksek lisans/ilköğretim) bunu yaz; bölüm bilgisinden bağımsız olarak, 'lise düzeyinde ilanlar', 'X mezunuyum' gibi ifadelerden de çıkarılabilir. Anlaşılmıyorsa null.",
    ),
});

const SYSTEM_PROMPT = `Sen "Kamu Yolu" adlı bir web sitesinin karşılama asistanısın.

Site şunu yapar: kullanıcı mezun olduğu bölümü ya da ilgilendiği alanı söyler,
site de o bölüme uygun (veya bölüm şartı olmayan) güncel kamu personeli/memur
ilanlarını listeler. Sitede iki tür sonuç sayfası var:
1. Belirli bir bölüme özel sayfa (ör. "Bilgisayar Mühendisliği" sayfası)
2. Bölüm şartı olmayan, sadece öğrenim derecesine göre (lise/önlisans/lisans/
   yüksek lisans) genel ilanları gösteren bir sayfa

Görevin, kullanıcının mesajından iki şeyi ayrı ayrı çıkarmak:
- departmentQuery: Kullanıcı SPESİFİK bir bölümden/meslekten bahsediyorsa
  (ör. "Bilgisayar Mühendisliği", "Hemşirelik") yaygın Türkçe akademik adıyla
  yaz. Belirsizse veya bölümden bağımsızsa null bırak.
- educationLevel: Kullanıcının öğrenim derecesi anlaşılıyorsa (lise, önlisans,
  lisans, yüksek lisans, ilköğretim) bunu yaz. Bu, departmentQuery'den BAĞIMSIZ
  bir alandır — kullanıcı sadece "lise düzeyinde ilanlar var mı", "lise
  mezunuyum" gibi bölüm belirtmeden düzey söylediğinde de doldur; ayrıca
  kullanıcı bir bölüm VE mezuniyet düzeyini birlikte söylerse ikisini de
  doldur (böylece bölüm sayfası bulunamazsa düzeye göre genel ilanlara
  yönlendirebiliriz).

Kurallar:
- Kullanıcı "lise düzeyinde ilanları getir/göster" gibi net bir istek
  yaptığında, reply alanında "tamam, X düzeyi ilanlarını gösteriyorum" gibi
  DOĞRUDAN bir cevap ver; "arama kutusuna X yaz" gibi yönlendirme yapma —
  bunun yerine educationLevel alanını doldur, sistem otomatik olarak ilgili
  sayfaya yönlendiren bir buton gösterecek.
- Asla var olmayan bilgi uydurma. Emin değilsen bunu belirt.
- Yanıtların her zaman kısa, samimi ve Türkçe olsun.`;

const bodySchema = z.object({
  message: z.string().min(1).max(500),
  history: z
    .array(
      z.object({
        role: z.enum(["user", "assistant"]),
        content: z.string().max(2000),
      }),
    )
    .max(10)
    .optional()
    .default([]),
});

type Action = { label: string; href: string };

export async function POST(req: NextRequest) {
  if (!process.env.ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "Chatbot şu anda kullanılamıyor." },
      { status: 503 },
    );
  }

  const parsedBody = bodySchema.safeParse(await req.json().catch(() => null));
  if (!parsedBody.success) {
    return NextResponse.json({ error: "Geçersiz istek." }, { status: 400 });
  }
  const { message, history } = parsedBody.data;

  const messages: Anthropic.MessageParam[] = [
    ...history.map((h) => ({ role: h.role, content: h.content })),
    { role: "user" as const, content: message },
  ];

  try {
    const response = await anthropic.messages.parse({
      model: "claude-opus-5",
      max_tokens: 1024,
      system: SYSTEM_PROMPT,
      messages,
      output_config: { format: zodOutputFormat(ChatResponseSchema) },
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return NextResponse.json(
        { reply: "Üzgünüm, isteğini anlayamadım. Tekrar dener misin?", action: null },
        { status: 200 },
      );
    }

    let action: Action | null = null;

    if (parsed.departmentQuery) {
      const matches = await matchDepartmentsForText(parsed.departmentQuery);
      if (matches.length > 0) {
        const dept = await prisma.department.findUnique({
          where: { id: matches[0].departmentId },
          select: { slug: true, name: true },
        });
        if (dept) {
          action = { label: `${dept.name} ilanlarını gör`, href: `/bolum/${dept.slug}` };
        }
      }
    }

    // Bolume ozel sayfa bulunamadi ama ogrenim duzeyi belli: duzeye gore
    // genel ilanlar sayfasina yonlendiren bir buton sun (yaniti da buna gore
    // durustce guncelle).
    let reply = parsed.reply;
    if (!action && parsed.educationLevel) {
      const levelSlug = LEVEL_ENUM_TO_SLUG[parsed.educationLevel];
      const levelLabel = LEVEL_LABEL[parsed.educationLevel] ?? parsed.educationLevel;
      action = {
        label: `${levelLabel} düzeyi ilanlarını gör`,
        href: `/seviye/${levelSlug}`,
      };
      if (parsed.departmentQuery) {
        reply = `"${parsed.departmentQuery}" için ayrı bir bölüm sayfamız yok, ama ${levelLabel.toLocaleLowerCase("tr-TR")} düzeyinde bölüm şartı olmayan güncel ilanları senin için gösterebilirim.`;
      }
    } else if (!action && parsed.departmentQuery) {
      reply = `"${parsed.departmentQuery}" için şu anda elimizde ayrı bir bölüm sayfası yok. Mezuniyet düzeyini (lise/önlisans/lisans) söylersen, o düzeydeki genel ilanları gösterebilirim.`;
    }

    return NextResponse.json({ reply, action });
  } catch (err) {
    console.error("Chat API hatası:", err);
    return NextResponse.json(
      { error: "Bir şeyler ters gitti, lütfen tekrar dene." },
      { status: 500 },
    );
  }
}
