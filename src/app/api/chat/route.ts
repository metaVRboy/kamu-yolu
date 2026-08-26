import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import { matchDepartmentsForText } from "@/lib/matching";
import { prisma } from "@/lib/prisma";

export const maxDuration = 30;

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
      "Kullanıcının bahsettiği bölüm/meslek alanının yaygın Türkçe akademik adı (ör. 'Bilgisayar Mühendisliği'). Belirsizse veya bölümle ilgisiz bir soruysa null.",
    ),
});

const SYSTEM_PROMPT = `Sen "Kamu Yolu" adlı bir web sitesinin karşılama asistanısın.

Site şunu yapar: kullanıcı mezun olduğu bölümü ya da ilgilendiği alanı söyler,
site de o bölüme uygun (veya bölüm şartı olmayan) güncel kamu personeli/memur
ilanlarını listeler.

Görevin: kullanıcının mesajından bahsettiği bölümü/meslek alanını anlamak.
- Eğer bir bölüm/alan anlaşılıyorsa, bunu yaygın Türkçe akademik bölüm adıyla
  (ör. "Bilgisayar Mühendisliği", "Hemşirelik", "Kamu Yönetimi") departmentQuery
  alanına yaz ve reply alanında kısaca "sana X bölümü ilanlarını gösteriyorum"
  gibi bir şey söyle.
- Eğer kullanıcı belirsiz konuşuyorsa, bölümden bağımsız genel bir soru
  soruyorsa (site nasıl çalışır, KPSS nedir vb.) departmentQuery'yi null
  bırak ve reply alanında kısaca yanıtla veya nazikçe bölümünü sormasını iste.
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
        { reply: "Üzgünüm, isteğini anlayamadım. Tekrar dener misin?", department: null },
        { status: 200 },
      );
    }

    let department: { slug: string; name: string } | null = null;
    if (parsed.departmentQuery) {
      const matches = await matchDepartmentsForText(parsed.departmentQuery);
      if (matches.length > 0) {
        const dept = await prisma.department.findUnique({
          where: { id: matches[0].departmentId },
          select: { slug: true, name: true },
        });
        department = dept;
      }
    }

    // Model bir bolum tespit etti ama veritabanimizda karsiligi bulunamadi:
    // modelin "listeliyorum" gibi yanlis bir izlenim vermesini onlemek icin
    // yaniti burada, gercek durumu yansitacak sekilde yeniden yaziyoruz.
    const reply =
      parsed.departmentQuery && !department
        ? `"${parsed.departmentQuery}" için şu anda elimizde ayrı bir bölüm sayfası yok, bu yüzden sana özel bir ilan listesi gösteremiyorum. Yukarıdaki arama kutusundan yakın bir bölüm adı deneyebilir ya da öğrenim derecene (lise/önlisans/lisans) uygun genel ilanlara bakabilirsin.`
        : parsed.reply;

    return NextResponse.json({ reply, department });
  } catch (err) {
    console.error("Chat API hatası:", err);
    return NextResponse.json(
      { error: "Bir şeyler ters gitti, lütfen tekrar dene." },
      { status: 500 },
    );
  }
}
