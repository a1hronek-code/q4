import type { MetadataRoute } from "next";
import { popularCompanies } from "./lib/popular-companies";

const siteUrl = "https://www.q4.sk";

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: siteUrl,
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${siteUrl}/firmy`,
      changeFrequency: "weekly",
      priority: 0.8,
    },
    ...popularCompanies.map((company) => ({
      url: `${siteUrl}/firmy/${company.id}`,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
  ];
}
