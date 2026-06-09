import type { MetadataRoute } from "next";
import { db } from "@/lib/db";
import { reports } from "@/lib/db/schema";
import { eq } from "drizzle-orm";
import { absoluteUrl } from "@/lib/site";
import { guides } from "@/lib/guides";

// Regenerate at most hourly so newly-approved reports appear without a DB hit per crawl.
export const revalidate = 3600;

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const rows = await db
    .select({
      slug: reports.slug,
      created_at: reports.created_at,
      updated_at: reports.updated_at,
    })
    .from(reports)
    .where(eq(reports.status, "approved"));

  const reportEntries: MetadataRoute.Sitemap = rows.map((r) => ({
    url: absoluteUrl(`/reports/${r.slug}`),
    lastModified: r.updated_at ?? r.created_at,
    changeFrequency: "monthly",
    priority: 0.8,
  }));

  const guideEntries: MetadataRoute.Sitemap = guides.map((g) => ({
    url: absoluteUrl(`/guides/${g.slug}`),
    lastModified: new Date(g.updated),
    changeFrequency: "monthly",
    priority: 0.6,
  }));

  const now = new Date();
  const staticEntries: MetadataRoute.Sitemap = [
    { url: absoluteUrl("/"), lastModified: now, changeFrequency: "daily", priority: 1 },
    { url: absoluteUrl("/reports"), lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: absoluteUrl("/guides"), lastModified: now, changeFrequency: "weekly", priority: 0.7 },
  ];

  return [...staticEntries, ...guideEntries, ...reportEntries];
}
