import { createFileRoute } from "@tanstack/react-router";
import type {} from "@tanstack/react-start";
import { supabaseAdmin } from "@/integrations/supabase/client.server";

const BASE_URL = "https://grileadmitere.ro";

interface SitemapEntry {
  path: string;
  lastmod?: string;
  changefreq?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
  priority?: string;
}

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => {
        const staticEntries: SitemapEntry[] = [
          { path: "/", changefreq: "weekly", priority: "1.0" },
          { path: "/grile", changefreq: "weekly", priority: "0.9" },
          { path: "/grila-zilei", changefreq: "daily", priority: "0.8" },
          { path: "/simulare", changefreq: "weekly", priority: "0.8" },
          { path: "/subiecte-bac", changefreq: "weekly", priority: "0.7" },
          { path: "/subiecte-admitere", changefreq: "weekly", priority: "0.7" },
          { path: "/admitere", changefreq: "weekly", priority: "0.8" },
          { path: "/tutoriale", changefreq: "weekly", priority: "0.6" },
          { path: "/feedback", changefreq: "monthly", priority: "0.3" },
          { path: "/autentificare", changefreq: "monthly", priority: "0.3" },
        ];

        const { data: unis } = await supabaseAdmin
          .from("universities")
          .select("slug")
          .order("short_name");
        const { data: subjects } = await supabaseAdmin
          .from("subjects")
          .select("slug");
        const { data: bacSubjects } = await supabaseAdmin
          .from("bac_papers")
          .select("subject_slug");
        const { data: admitereRows } = await supabaseAdmin
          .from("admitere_papers")
          .select("university_slug, subject_slug");

        const uniEntries: SitemapEntry[] = (unis ?? []).map((u: any) => ({
          path: `/grile/${u.slug}`,
          changefreq: "weekly",
          priority: "0.7",
        }));
        const quizEntries: SitemapEntry[] = (subjects ?? []).map((s: any) => ({
          path: `/quiz/${s.slug}`,
          changefreq: "weekly",
          priority: "0.6",
        }));
        const bacSubjectEntries: SitemapEntry[] = Array.from(
          new Set((bacSubjects ?? []).map((r: any) => r.subject_slug as string)),
        ).map((slug) => ({
          path: `/subiecte-bac/${slug}`,
          changefreq: "monthly",
          priority: "0.7",
        }));

        const admitereUniSet = new Set<string>();
        const admitereSubjectSet = new Set<string>();
        for (const r of (admitereRows ?? []) as Array<{ university_slug: string; subject_slug: string }>) {
          admitereUniSet.add(r.university_slug);
          admitereSubjectSet.add(`${r.university_slug}/${r.subject_slug}`);
        }
        const admitereUniEntries: SitemapEntry[] = Array.from(admitereUniSet).map((slug) => ({
          path: `/admitere/${slug}`,
          changefreq: "monthly",
          priority: "0.6",
        }));
        const admitereSubjEntries: SitemapEntry[] = Array.from(admitereSubjectSet).map((p) => ({
          path: `/admitere/${p}`,
          changefreq: "monthly",
          priority: "0.6",
        }));

        const all = [
          ...staticEntries,
          ...uniEntries,
          ...quizEntries,
          ...bacSubjectEntries,
          ...admitereUniEntries,
          ...admitereSubjEntries,
        ];
        const urls = all.map((e) =>
          [
            `  <url>`,
            `    <loc>${BASE_URL}${e.path}</loc>`,
            e.lastmod ? `    <lastmod>${e.lastmod}</lastmod>` : null,
            e.changefreq ? `    <changefreq>${e.changefreq}</changefreq>` : null,
            e.priority ? `    <priority>${e.priority}</priority>` : null,
            `  </url>`,
          ]
            .filter(Boolean)
            .join("\n"),
        );

        const xml = [
          `<?xml version="1.0" encoding="UTF-8"?>`,
          `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">`,
          ...urls,
          `</urlset>`,
        ].join("\n");

        return new Response(xml, {
          headers: {
            "Content-Type": "application/xml",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
});