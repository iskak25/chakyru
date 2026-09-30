import type { MetadataRoute } from "next";
import { templates } from "@/lib/templates";

const base = "https://toichakyru.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const pages: MetadataRoute.Sitemap = [
    { url: `${base}/`, changeFrequency: "weekly", priority: 1 },
    { url: `${base}/3d-chakyruu`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/templates`, changeFrequency: "weekly", priority: 0.9 },
    { url: `${base}/kyz-uzatuu-chakyruu`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/beshik-toi-chakyruu`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/yubiley-chakyruu`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/priglasitelnye-na-svadbu`, changeFrequency: "monthly", priority: 0.8 },
    { url: `${base}/pricing`, changeFrequency: "monthly", priority: 0.7 },
    { url: `${base}/learn`, changeFrequency: "monthly", priority: 0.5 },
  ];
  const items: MetadataRoute.Sitemap = templates.map((tpl) => ({
    url: `${base}/templates/${tpl.id}`,
    changeFrequency: "monthly",
    priority: tpl.format === "site3d" ? 0.7 : 0.6,
  }));
  return [...pages, ...items];
}
