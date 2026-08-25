import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { EducationLevel, InstitutionType } from "../src/generated/prisma/enums";
import { slugify } from "../src/lib/slug";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL! });
const prisma = new PrismaClient({ adapter });

type DeptSeed = {
  name: string;
  level: EducationLevel;
  aliases?: string[];
};

// Baslangic bolum listesi: en yaygin lisans/onlisans bolumleri.
// Zamanla genisletilecek; kesin/eksiksiz liste degildir.
const departments: DeptSeed[] = [
  { name: "Bilgisayar Mühendisliği", level: "LISANS", aliases: ["Bilgisayar Müh.", "Computer Engineering", "Yazılım ve Bilgisayar Mühendisliği"] },
  { name: "Yazılım Mühendisliği", level: "LISANS", aliases: ["Software Engineering"] },
  { name: "Elektrik-Elektronik Mühendisliği", level: "LISANS", aliases: ["Elektrik ve Elektronik Mühendisliği", "Elektronik Mühendisliği", "Elektrik Mühendisliği"] },
  { name: "Endüstri Mühendisliği", level: "LISANS", aliases: ["Industrial Engineering"] },
  { name: "İnşaat Mühendisliği", level: "LISANS", aliases: ["Civil Engineering"] },
  { name: "Makine Mühendisliği", level: "LISANS", aliases: ["Mechanical Engineering"] },
  { name: "Kimya Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Gıda Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Ziraat Mühendisliği", level: "LISANS", aliases: ["Tarım Mühendisliği"] },
  { name: "Çevre Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Harita Mühendisliği", level: "LISANS", aliases: ["Geomatik Mühendisliği"] },
  { name: "Jeoloji Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Maden Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Biyomedikal Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Metalurji ve Malzeme Mühendisliği", level: "LISANS", aliases: ["Malzeme Mühendisliği"] },
  { name: "Petrol ve Doğalgaz Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Jeofizik Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Tekstil Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Gemi İnşaatı ve Gemi Makineleri Mühendisliği", level: "LISANS", aliases: ["Gemi Mühendisliği", "Deniz Mühendisliği"] },
  { name: "Uçak Mühendisliği", level: "LISANS", aliases: ["Havacılık ve Uzay Mühendisliği", "Uzay Mühendisliği"] },
  { name: "Endüstriyel Tasarım Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Mekatronik Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Kontrol ve Otomasyon Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Enerji Sistemleri Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Orman Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Su Ürünleri Mühendisliği", level: "LISANS", aliases: [] },
  { name: "Bahçe Bitkileri", level: "LISANS", aliases: [] },
  { name: "Bitki Koruma", level: "LISANS", aliases: [] },
  { name: "Zootekni", level: "LISANS", aliases: [] },
  { name: "Tarımsal Biyoteknoloji", level: "LISANS", aliases: [] },
  { name: "Tıp", level: "LISANS", aliases: ["Tıp Fakültesi", "Tabip"] },
  { name: "Diş Hekimliği", level: "LISANS", aliases: [] },
  { name: "Eczacılık", level: "LISANS", aliases: [] },
  { name: "Hemşirelik", level: "LISANS", aliases: [] },
  { name: "Fizyoterapi ve Rehabilitasyon", level: "LISANS", aliases: [] },
  { name: "Beslenme ve Diyetetik", level: "LISANS", aliases: ["Diyetisyenlik"] },
  { name: "Veteriner Hekimliği", level: "LISANS", aliases: ["Veterinerlik"] },
  { name: "Ebelik", level: "LISANS", aliases: [] },
  { name: "Odyoloji", level: "LISANS", aliases: [] },
  { name: "Ergoterapi", level: "LISANS", aliases: [] },
  { name: "Sağlık Yönetimi", level: "LISANS", aliases: [] },
  { name: "Perfüzyon", level: "LISANS", aliases: [] },
  { name: "İş Sağlığı ve Güvenliği", level: "LISANS", aliases: [] },
  { name: "Acil Yardım ve Afet Yönetimi", level: "LISANS", aliases: [] },
  { name: "Sağlık Kurumları İşletmeciliği", level: "LISANS", aliases: [] },
  { name: "Hukuk", level: "LISANS", aliases: ["Hukuk Fakültesi"] },
  { name: "İşletme", level: "LISANS", aliases: ["Business Administration"] },
  { name: "İktisat", level: "LISANS", aliases: ["Ekonomi"] },
  { name: "Maliye", level: "LISANS", aliases: [] },
  { name: "Kamu Yönetimi", level: "LISANS", aliases: ["Siyaset Bilimi ve Kamu Yönetimi"] },
  { name: "Uluslararası İlişkiler", level: "LISANS", aliases: [] },
  { name: "Çalışma Ekonomisi ve Endüstri İlişkileri", level: "LISANS", aliases: [] },
  { name: "Siyaset Bilimi", level: "LISANS", aliases: [] },
  { name: "Sosyoloji", level: "LISANS", aliases: [] },
  { name: "Psikoloji", level: "LISANS", aliases: [] },
  { name: "Rehberlik ve Psikolojik Danışmanlık", level: "LISANS", aliases: ["PDR"] },
  { name: "Sınıf Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Okul Öncesi Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Türkçe Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Matematik Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Fen Bilgisi Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "İngilizce Öğretmenliği", level: "LISANS", aliases: ["İngiliz Dili Eğitimi"] },
  { name: "Almanca Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Fransızca Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Beden Eğitimi ve Spor Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Bilgisayar ve Öğretim Teknolojileri Öğretmenliği", level: "LISANS", aliases: ["BÖTE"] },
  { name: "Felsefe Grubu Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Özel Eğitim Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Resim-İş Öğretmenliği", level: "LISANS", aliases: ["Görsel Sanatlar Öğretmenliği"] },
  { name: "Sosyal Bilgiler Öğretmenliği", level: "LISANS", aliases: [] },
  { name: "Tarih", level: "LISANS", aliases: [] },
  { name: "Coğrafya", level: "LISANS", aliases: [] },
  { name: "Arkeoloji", level: "LISANS", aliases: [] },
  { name: "Sanat Tarihi", level: "LISANS", aliases: [] },
  { name: "Müzecilik", level: "LISANS", aliases: [] },
  { name: "Bilgi ve Belge Yönetimi", level: "LISANS", aliases: ["Kütüphanecilik"] },
  { name: "Halkla İlişkiler ve Tanıtım", level: "LISANS", aliases: [] },
  { name: "Gazetecilik", level: "LISANS", aliases: ["Gazetecilik ve Halkla İlişkiler"] },
  { name: "Radyo, Televizyon ve Sinema", level: "LISANS", aliases: [] },
  { name: "Grafik Tasarım", level: "LISANS", aliases: ["Görsel İletişim Tasarımı"] },
  { name: "Mimarlık", level: "LISANS", aliases: [] },
  { name: "Şehir ve Bölge Planlama", level: "LISANS", aliases: [] },
  { name: "İstatistik", level: "LISANS", aliases: [] },
  { name: "Matematik", level: "LISANS", aliases: [] },
  { name: "Fizik", level: "LISANS", aliases: [] },
  { name: "Kimya", level: "LISANS", aliases: [] },
  { name: "Biyoloji", level: "LISANS", aliases: [] },
  { name: "Sosyal Hizmet", level: "LISANS", aliases: [] },
  { name: "İlahiyat", level: "LISANS", aliases: [] },
  { name: "Dil ve Konuşma Terapisi", level: "LISANS", aliases: [] },
  { name: "Mütercim-Tercümanlık", level: "LISANS", aliases: ["Çevirmenlik"] },
  { name: "Aktüerya Bilimleri", level: "LISANS", aliases: [] },

  // Onlisans - saglik hizmetleri meslek yuksekokulu programlari
  // (kamu hastane ilanlarinda cok sik gecen bolumler)
  { name: "Tıbbi Laboratuvar Teknikleri", level: "ONLISANS", aliases: ["Tıbbi Laboratuvar Teknikerliği", "Tıbbi Laboratuvar Teknolojisi", "Sağlık Laboratuvarı", "Laboratuvar Teknikerliği", "Patoloji Laboratuvar Teknikleri", "Patoloji Laboratuvar"] },
  { name: "Tıbbi Görüntüleme Teknikleri", level: "ONLISANS", aliases: ["Radyoloji Teknikerliği", "Radyoloji", "Tıbbi Görüntüleme Teknolojileri"] },
  { name: "Eczane Hizmetleri", level: "ONLISANS", aliases: ["Eczane Teknikerliği"] },
  { name: "Biyomedikal Cihaz Teknolojisi", level: "ONLISANS", aliases: ["Biyomedikal Bilimler"] },
  { name: "Anestezi", level: "ONLISANS", aliases: [] },
  { name: "Ameliyathane Hizmetleri", level: "ONLISANS", aliases: [] },
  { name: "Diyaliz", level: "ONLISANS", aliases: [] },
  { name: "Ağız ve Diş Sağlığı", level: "ONLISANS", aliases: [] },
  { name: "İlk ve Acil Yardım", level: "ONLISANS", aliases: ["Paramedik"] },
  { name: "Odyometri", level: "ONLISANS", aliases: [] },
  { name: "Ortopedik Protez ve Ortez", level: "ONLISANS", aliases: [] },
  { name: "Elektronörofizyoloji", level: "ONLISANS", aliases: [] },
  { name: "Fizyoterapi", level: "ONLISANS", aliases: [] },

  // Onlisans
  { name: "Bilgisayar Programcılığı", level: "ONLISANS", aliases: [] },
  { name: "Muhasebe ve Vergi Uygulamaları", level: "ONLISANS", aliases: [] },
  { name: "Büro Yönetimi ve Yönetici Asistanlığı", level: "ONLISANS", aliases: [] },
  { name: "Sosyal Hizmetler", level: "ONLISANS", aliases: [] },
  { name: "Çocuk Gelişimi", level: "ONLISANS", aliases: [] },
  { name: "Tıbbi Dokümantasyon ve Sekreterlik", level: "ONLISANS", aliases: [] },
  { name: "Elektrik", level: "ONLISANS", aliases: [] },
  { name: "Makine", level: "ONLISANS", aliases: [] },
  { name: "İnşaat Teknolojisi", level: "ONLISANS", aliases: [] },
  { name: "Radyo ve Televizyon Programcılığı", level: "ONLISANS", aliases: [] },
  { name: "Mekatronik", level: "ONLISANS", aliases: [] },
  { name: "Endüstriyel Otomasyon Teknolojileri", level: "ONLISANS", aliases: [] },
  { name: "Harita ve Kadastro", level: "ONLISANS", aliases: [] },
  { name: "Gıda Teknolojisi", level: "ONLISANS", aliases: [] },
  { name: "Tekstil Teknolojisi", level: "ONLISANS", aliases: [] },
  { name: "Sivil Savunma ve İtfaiyecilik", level: "ONLISANS", aliases: [] },
  { name: "Adalet", level: "ONLISANS", aliases: [] },
  { name: "Bankacılık ve Sigortacılık", level: "ONLISANS", aliases: [] },
  { name: "Dış Ticaret", level: "ONLISANS", aliases: [] },
  { name: "Lojistik", level: "ONLISANS", aliases: [] },
  { name: "Turizm ve Otel İşletmeciliği", level: "ONLISANS", aliases: [] },
  { name: "Aşçılık", level: "ONLISANS", aliases: [] },
  { name: "Radyoterapi", level: "ONLISANS", aliases: [] },
  { name: "Optisyenlik", level: "ONLISANS", aliases: [] },
  { name: "Yaşlı Bakımı", level: "ONLISANS", aliases: [] },
  { name: "Elektrik-Elektronik Teknolojisi", level: "ONLISANS", aliases: [] },

  // Lise (meslek lisesi alan/dal) - bazi kamu ilanlari dogrudan meslek lisesi
  // alanindan mezuniyet sartı koşar
  { name: "Tesisat Teknolojisi ve İklimlendirme", level: "LISE", aliases: ["İklimlendirme"] },
  { name: "Muhasebe ve Finansman", level: "LISE", aliases: [] },
  { name: "Bilişim Teknolojileri", level: "LISE", aliases: [] },
];

async function main() {
  console.log(`Seeding ${departments.length} departments...`);

  for (const dept of departments) {
    const slug = slugify(dept.name);
    await prisma.department.upsert({
      where: { slug },
      update: {},
      create: {
        name: dept.name,
        slug,
        level: dept.level,
        aliases: {
          create: (dept.aliases ?? []).map((alias) => ({ alias })),
        },
      },
    });
  }

  console.log("Departments seeded.");

  // Demo ilanlar: gercek scraper devreye girene kadar arayuzu test etmek icindir.
  // isDemo=true ile isaretlenir ve UI'da acikca "ORNEK VERI" olarak gosterilir.
  const bilgisayarMuh = await prisma.department.findUniqueOrThrow({
    where: { slug: "bilgisayar-muhendisligi" },
  });

  const demoPosting = await prisma.posting.upsert({
    where: { externalId: "demo-1" },
    update: {},
    create: {
      externalId: "demo-1",
      title: "Sözleşmeli Bilişim Personeli (Örnek İlan)",
      institutionName: "Örnek Bakanlık",
      institutionType: InstitutionType.BAKANLIK,
      sourceName: "Demo Veri",
      sourceUrl: "https://kariyerkapisi.gov.tr",
      educationLevels: [EducationLevel.LISANS],
      departmentRequirementRaw:
        "Bilgisayar Mühendisliği, Yazılım Mühendisliği bölümlerinden mezun olmak (örnek/demo veri - gerçek ilan değildir)",
      isDepartmentRestricted: true,
      isDemo: true,
      isActive: true,
      publishedAt: new Date("2026-08-20T00:00:00.000Z"),
    },
  });

  await prisma.postingDepartment.upsert({
    where: {
      postingId_departmentId: {
        postingId: demoPosting.id,
        departmentId: bilgisayarMuh.id,
      },
    },
    update: {},
    create: {
      postingId: demoPosting.id,
      departmentId: bilgisayarMuh.id,
      matchedAlias: "Bilgisayar Mühendisliği",
    },
  });

  await prisma.posting.upsert({
    where: { externalId: "demo-2" },
    update: {},
    create: {
      externalId: "demo-2",
      title: "Sözleşmeli Personel Alımı - Bölüm Şartı Yok (Örnek İlan)",
      institutionName: "Örnek Üniversite",
      institutionType: InstitutionType.UNIVERSITE,
      sourceName: "Demo Veri",
      sourceUrl: "https://kariyerkapisi.gov.tr",
      educationLevels: [EducationLevel.LISANS],
      departmentRequirementRaw:
        "4 yıllık fakültelerin herhangi bir bölümünden mezun olmak (örnek/demo veri - gerçek ilan değildir)",
      isDepartmentRestricted: false,
      isDemo: true,
      isActive: true,
      publishedAt: new Date("2026-08-22T00:00:00.000Z"),
    },
  });

  console.log("Demo postings seeded.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
