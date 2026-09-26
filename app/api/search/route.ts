import { NextRequest, NextResponse } from "next/server";
import { companies } from "../../lib/companies";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim().toLowerCase();
  const category = (searchParams.get("category") ?? "vsetko").trim().toLowerCase();

  const filtered = companies.filter((company) => {
    const haystack = [
      company.name,
      company.legalForm,
      company.industry,
      company.city,
      company.ico,
      company.description,
      company.shortDescription,
      company.owners.join(" "),
      company.related.join(" "),
    ]
      .join(" ")
      .toLowerCase();

    const matchesKeyword = !query || haystack.includes(query);

    const matchesCategory =
      category === "vsetko" ||
      (category === "firmy" && company.category === "business") ||
      (category === "urady" && company.category === "government") ||
      (category === "korporacie" && company.category === "corporate") ||
      (category === "dávky" && ["business", "corporate"].includes(company.category));

    return matchesKeyword && matchesCategory;
  });

  return NextResponse.json({
    results: filtered.slice(0, 10).map((company) => ({
      slug: company.slug,
      name: company.name,
      city: company.city,
      industry: company.industry,
      legalForm: company.legalForm,
      ico: company.ico,
      category: company.category,
      shortDescription: company.shortDescription,
    })),
    total: filtered.length,
    query,
    category,
  });
}
