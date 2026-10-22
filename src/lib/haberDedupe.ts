import { randomUUID } from "crypto";
import { z } from "zod";
import { prisma } from "@/lib/prisma";
import { gemini, GEMINI_MODEL } from "@/lib/gemini";
import { toGeminiSchema, parseGeminiJson } from "@/lib/geminiSchema";
import { buildHaberSlug } from "@/lib/slug";
import { haberFotografiBul } from "@/lib/haberFoto";
import type { HaberDetayExtract } from "@/lib/haberDetayCikar";
import { EducationLevel } from "@/generated/prisma/enums";

const EslesmeSchema = z.object({
  eslesenId: z.string().nullable().describe("Ayni haberi anlatan mevcut haberin id'si, yoksa null."),
});

async function ayniHaberIdBul(
  yeni: { baslik: string; ozet: string },
  mevcutlar: { id: string; baslik: string; ozet: string }[],
): Promise<string | null> {
  if (mevcutlar.length === 0) return null;
  const liste = mevcutlar.map((m) => `- id=${m.id}: "${m.baslik}" — ${m.ozet}`).join("\n");
  try {
    const res = await gemini.models.generateContent({
      model: GEMINI_MODEL,
      contents: `Yeni haber: "${yeni.baslik}" — ${yeni.ozet}\n\nMevcut haberler:\n${liste}`,
      config: {
        systemInstruction:
          "Sana yeni bulunan bir haber ile mevcut haberlerin listesi verilecek. Yeni haber, " +
          "listedekilerden biriyle (farkli kaynaktan veya farkli tarihte yazilmis/guncellenmis olsa " +
          "bile) AYNI olayi/duyuruyu anlatiyorsa o haberin id'sini don. Hicbiri ayni konu degilse " +
          "eslesenId'yi null birak.",
        responseMimeType: "application/json",
        responseJsonSchema: toGeminiSchema(EslesmeSchema),
      },
    });
    const parsed = EslesmeSchema.safeParse(parseGeminiJson(res.text));
    if (!parsed.success || !parsed.data.eslesenId) return null;
    const gecerliMi = mevcutlar.some((m) => m.id === parsed.data.eslesenId);
    return gecerliMi ? parsed.data.eslesenId : null;
  } catch {
    return null;
  }
}

/**
 * Yeni bulunan haberleri veritabanina ekler; ayni olayi/duyuruyu anlatan
 * eski bir haber varsa (baslik/kaynak farkli olsa bile) onu silip yerine
 * yeni bulunani ekler - boylece ayni haber gunler boyu farkli kaynaklarla
 * tekrar tekrar listelenmez, hep en guncel hali kalir.
 */
export async function haberleriEkleVeTekillestir(
  adaylar: {
    baslik: string;
    ozet: string;
    kaynakUrl: string | null;
    gorselUrl: string | null;
    gorselLogoMu: boolean;
    departmentIds: string[];
    detay: HaberDetayExtract | null;
  }[],
): Promise<{ eklenen: number; degistirilen: number }> {
  if (adaylar.length === 0) return { eklenen: 0, degistirilen: 0 };

  let mevcutlar = await prisma.haber.findMany({
    select: { id: true, baslik: true, ozet: true },
    orderBy: { createdAt: "desc" },
    take: 80,
  });

  let eklenen = 0;
  let degistirilen = 0;
  // Unsplash arama sonuclari bu calismada paylasilir (saatte 50 istek siniri).
  const fotoArama = new Map();

  for (const { departmentIds, detay, ...aday } of adaylar) {
    const eslesenId = await ayniHaberIdBul(aday, mevcutlar);
    // Gorsel onceligi: konuya uygun telifsiz fotograf -> kurum logosu (aday.gorselUrl) -> kapak. Guncellenen haberin
    // zaten fotografi varsa o korunur (link paylasilmis olabilir, gorsel her guncellemede degismesin).
    const eskiFoto = eslesenId
      ? await prisma.haber.findUnique({ where: { id: eslesenId }, select: { gorselUrl: true, gorselKredi: true } })
      : null;
    const foto = eskiFoto?.gorselKredi
      ? null
      : await haberFotografiBul({ baslik: aday.baslik, ozet: aday.ozet, kategori: detay?.kategori, kurumAdi: detay?.kurumAdi }, fotoArama);
    const gorsel = eskiFoto?.gorselKredi
      ? { gorselUrl: eskiFoto.gorselUrl, gorselLogoMu: false, gorselKredi: eskiFoto.gorselKredi as object }
      : foto
        ? { gorselUrl: foto.url, gorselLogoMu: false, gorselKredi: foto.kredi }
        : {};
    const veri = {
      ...aday,
      ...gorsel,
      kurumAdi: detay?.kurumAdi ?? null,
      kadroPozisyon: detay?.kadroPozisyon ?? null,
      kontenjan: detay?.kontenjan ?? null,
      kategori: detay?.kategori ?? null,
      istihdamTuru: detay?.istihdamTuru ?? null,
      kpssTuru: detay?.kpssTuru ?? null,
      ustYas: detay?.ustYas ?? null,
      egitimSeviyeleri: (detay?.egitimSeviyeleri ?? []) as EducationLevel[],
      basvuruBaslangic: detay?.basvuruBaslangic ? new Date(detay.basvuruBaslangic) : null,
      basvuruBitis: detay?.basvuruBitis ? new Date(detay.basvuruBitis) : null,
      detaylar: detay
        ? {
            neAciklandi: detay.neAciklandi,
            basvuruTakvimi: detay.basvuruTakvimi,
            kimlerBasvurabilir: detay.kimlerBasvurabilir,
            ozelSartlar: detay.ozelSartlar,
            dikkatEdilmesiGerekenler: detay.dikkatEdilmesiGerekenler,
            sss: detay.sss,
          }
        : undefined,
    };

    let olusturulan: { id: string };
    if (eslesenId) {
      // Eski kayit silinip yenisi acilmaz: id ve slug (yani paylasilmis/indekslenmis link) ayni kalir,
      // icerik en guncel haliyle degisir ve haber listede en uste cikar.
      const simdi = new Date();
      olusturulan = await prisma.haber.update({ where: { id: eslesenId }, data: { ...veri, yayinTarihi: simdi, createdAt: simdi } });
      await prisma.haberDepartment.deleteMany({ where: { haberId: eslesenId } });
      mevcutlar = mevcutlar.filter((m) => m.id !== eslesenId);
      degistirilen++;
    } else {
      // Slug id'ye bagli oldugu icin (benzersizlik garantisi) id onceden
      // uretilip slug ile birlikte tek seferde yazilir.
      const id = randomUUID();
      olusturulan = await prisma.haber.create({ data: { ...veri, id, slug: buildHaberSlug(aday.baslik, id) } });
      eklenen++;
    }
    if (departmentIds.length > 0) {
      await prisma.haberDepartment.createMany({
        data: departmentIds.map((departmentId) => ({ haberId: olusturulan.id, departmentId })),
        skipDuplicates: true,
      });
    }
    mevcutlar.push({ id: olusturulan.id, baslik: aday.baslik, ozet: aday.ozet });
  }

  return { eklenen, degistirilen };
}
