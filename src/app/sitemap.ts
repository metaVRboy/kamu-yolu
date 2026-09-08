import type { MetadataRoute } from "next";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/slug";
import { SITE_URL } from "@/lib/site";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [departments, postings] = await Promise.all([
    prisma.department.findMany({ select: { slug: true, updatedAt: true } }),
    // Demo/pasif ilanlar arama motoruna ayrica sunulmaz - sadece gercek ve
    // guncel ilanlar sitemap'te yer alir.
    prisma.posting.findMany({
      where: { isActive: true, isDemo: false },
      select: { id: true, title: true, updatedAt: true },
    }),
  ]);

  const staticPages: MetadataRoute.Sitemap = [
    { url: SITE_URL, changeFrequency: "daily", priority: 1 },
    { url: `${SITE_URL}/ilanlar`, changeFrequency: "daily", priority: 0.9 },
    { url: `${SITE_URL}/becayis`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/haberler`, changeFrequency: "daily", priority: 0.6 },
    { url: `${SITE_URL}/kpss-puan-hesaplama`, changeFrequency: "monthly", priority: 0.5 },
    { url: `${SITE_URL}/amacimiz`, changeFrequency: "yearly", priority: 0.3 },
    { url: `${SITE_URL}/kvkk`, changeFrequency: "yearly", priority: 0.2 },
    { url: `${SITE_URL}/seviye/lise`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/seviye/onlisans`, changeFrequency: "daily", priority: 0.7 },
    { url: `${SITE_URL}/seviye/lisans`, changeFrequency: "daily", priority: 0.7 },
  ];

  const departmentPages: MetadataRoute.Sitemap = departments.map((d) => ({
    url: `${SITE_URL}/bolum/${d.slug}`,
    lastModified: d.updatedAt,
    changeFrequency: "daily",
    priority: 0.6,
  }));

  const postingPages: MetadataRoute.Sitemap = postings.map((p) => ({
    url: `${SITE_URL}/ilan/${p.id}/${slugify(p.title)}`,
    lastModified: p.updatedAt,
    changeFrequency: "daily",
    priority: 0.8,
  }));

  return [...staticPages, ...departmentPages, ...postingPages];
}
