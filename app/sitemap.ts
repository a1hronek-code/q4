import type { MetadataRoute } from "next";
import { calculators } from "./lib/calculators";
import { elections } from "./lib/elections";
import { holidays } from "./lib/holidays";
import { listMunicipalities } from "./lib/municipalities";
import { popularCompanies } from "./lib/popular-companies";
import { getRpoSubjectAvailable } from "./lib/rpo-data";
import { schoolHolidays } from "./lib/school-holidays";
import { companyProfilePath } from "./lib/seo";

const siteUrl = "https://www.q4.sk";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const popularCompanyUrls = await Promise.all(
    popularCompanies.map(async (company) => {
      let profilePath = companyProfilePath(company.id, company.name);
      try {
        const subject = await getRpoSubjectAvailable(Number(company.id));
        if (subject) profilePath = companyProfilePath(subject.id, subject.name);
      } catch (cause) {
        console.error("Sitemap company lookup failed", cause);
      }
      return {
        url: `${siteUrl}${profilePath}`,
        changeFrequency: "weekly" as const,
        priority: 0.7,
      };
    }),
  );

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
    {
      url: `${siteUrl}/kategorie`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/statistiky`,
      changeFrequency: "weekly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/slovensko-teraz`,
      changeFrequency: "daily",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/urady`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    {
      url: `${siteUrl}/obce`,
      changeFrequency: "monthly",
      priority: 0.7,
    },
    ...listMunicipalities().map((municipality) => ({
      url: `${siteUrl}/obce/${municipality.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.4,
    })),
    ...popularCompanyUrls,
    {
      url: `${siteUrl}/kalkulacky`,
      changeFrequency: "monthly",
      priority: 0.8,
    },
    ...calculators.map((calculator) => ({
      url: `${siteUrl}/kalkulacky/${calculator.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
    {
      url: `${siteUrl}/pocasie`,
      changeFrequency: "hourly",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/meniny`,
      changeFrequency: "daily",
      priority: 0.6,
    },
    {
      url: `${siteUrl}/volby`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...elections.map((election) => ({
      url: `${siteUrl}/volby/${election.slug}`,
      changeFrequency: "monthly" as const,
      priority: 0.5,
    })),
    {
      url: `${siteUrl}/sviatky`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...holidays.map((holiday) => ({
      url: `${siteUrl}/sviatky/${holiday.slug}-${holiday.date.slice(0, 4)}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
    {
      url: `${siteUrl}/prazdniny`,
      changeFrequency: "monthly",
      priority: 0.6,
    },
    ...schoolHolidays.map((holiday) => ({
      url: `${siteUrl}/prazdniny/${holiday.slug}`,
      changeFrequency: "yearly" as const,
      priority: 0.5,
    })),
  ];
}
