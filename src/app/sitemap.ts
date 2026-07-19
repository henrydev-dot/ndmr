import type { MetadataRoute } from "next";
import { dbConnect } from "@/lib/db";
import { Course, Test } from "@/models";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = process.env.SITE_URL || "http://localhost:3000";
  const staticRoutes = [
    "",
    "/egitimler",
    "/ogrenme-kartlari",
    "/oyunlar",
    "/kutuphane",
    "/testler",
    "/randevu",
    "/notlar",
    "/hakkinda",
    "/iletisim",
  ].map((p) => ({ url: `${base}${p}`, lastModified: new Date() }));

  try {
    await dbConnect();
    const [courses, tests] = await Promise.all([
      Course.find({ isPublished: true }).select("slug").lean(),
      Test.find({ isActive: true }).select("slug").lean(),
    ]);
    return [
      ...staticRoutes,
      ...(courses as any[]).map((c) => ({ url: `${base}/egitimler/${c.slug}`, lastModified: new Date() })),
      ...(tests as any[]).map((t) => ({ url: `${base}/testler/${t.slug}`, lastModified: new Date() })),
    ];
  } catch {
    return staticRoutes;
  }
}
