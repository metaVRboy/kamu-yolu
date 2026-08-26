import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { zodOutputFormat } from "@anthropic-ai/sdk/helpers/zod";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic } from "@/lib/anthropic";
import {
  createDepartmentFromResearch,
  linkDepartmentToExistingPostings,
  matchDepartmentForQuery,
} from "@/lib/matching";
import { researchDepartment } from "@/lib/departmentResearch";
import { prisma } from "@/lib/prisma";
import { LEVEL_ENUM_TO_SLUG } from "@/lib/levels";
import { LEVEL_LABEL } from "@/lib/labels";

// Bilinmeyen bir bolum sorulduğunda internet arastirmasi (2 ekstra Claude
// cagrisi) gerekebilir; bu yuzden normal bir chat cevabindan daha uzun
// surebilir.
export const maxDuration = 60;

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

async function resolveDepartmentAction(
  departmentQuery: string,
): Promise<{ action: Action; note: string | null } | null> {
  let match = await matchDepartmentForQuery(departmentQuery);
  let note: string | null = null;

  if (!match) {
    // Veritabanimizda yok: internetten arastir, gercek bir alan/bolumse
    // kalici olarak ekle ve mevcut ilanlarla geriye donuk eslestir.
    const research = await researchDepartment(departmentQuery);
    if (research?.isRealField && research.canonicalName && research.level) {
      const dept = await createDepartmentFromResearch({
        name: research.canonicalName,
        level: research.level,
        aliases: research.aliases,
      });
      const linkedCount = await linkDepartmentToExistingPostings(dept.id);
      match = { departmentId: dept.id, matchedAlias: dept.name };
      note =
        linkedCount > 0
          ? `"${dept.name}" bölümünü sistemimize yeni ekledim ve sana uygun ${linkedCount} ilan buldum!`
          : `"${dept.name}" bölümünü sistemimize yeni ekledim. Şu anda bu bölüme özel açık bir ilan yok ama bundan sonra takipte olacağız; bu arada aynı öğrenim düzeyindeki (bölüm şartı olmayan) genel ilanları da aşağıda görebilirsin.`;
    }
  }

  if (!match) return null;

  const dept = await prisma.department.findUnique({
    where: { id: match.departmentId },
    select: { slug: true, name: true },
  });
  if (!dept) return null;

  return {
    action: { label: `${dept.name} ilanlarını gör`, href: `/bolum/${dept.slug}` },
    note,
  };
}

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
      output_config: { format: zodOutputFormat(ChatResponseSchema), effort: "low" },
    });

    const parsed = response.parsed_output;
    if (!parsed) {
      return NextResponse.json(
        { reply: "Üzgünüm, isteğini anlayamadım. Tekrar dener misin?", action: null },
        { status: 200 },
      );
    }

    let action: Action | null = null;
    let reply = parsed.reply;

    if (parsed.departmentQuery) {
      const resolved = await resolveDepartmentAction(parsed.departmentQuery);
      if (resolved) {
        action = resolved.action;
        if (resolved.note) reply = resolved.note;
      }
    }

    // Bolume ozel sayfa bulunamadi (arastirma da basarisiz oldu) ama
    // ogrenim duzeyi belli: kullaniciyi asla elini bos birakmayip duzeye
    // gore genel ilanlar sayfasina yonlendiren bir buton sun.
    if (!action && parsed.educationLevel) {
      const levelSlug = LEVEL_ENUM_TO_SLUG[parsed.educationLevel];
      const levelLabel = LEVEL_LABEL[parsed.educationLevel] ?? parsed.educationLevel;
      action = {
        label: `${levelLabel} düzeyi ilanlarını gör`,
        href: `/seviye/${levelSlug}`,
      };
      if (parsed.departmentQuery) {
        reply = `"${parsed.departmentQuery}" için özel bir bölüm bulamadım, ama ${levelLabel.toLocaleLowerCase("tr-TR")} düzeyinde bölüm şartı olmayan güncel ilanları senin için gösterebilirim.`;
      }
    } else if (!action && parsed.departmentQuery) {
      reply = `"${parsed.departmentQuery}" için şu anda elimizde bir bilgi bulamadım. Mezuniyet düzeyini (lise/önlisans/lisans) söylersen, o düzeydeki genel ilanları hemen gösterebilirim.`;
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
