import { NextResponse } from "next/server";
import { companies } from "../../lib/companies";

export async function GET() {
  return NextResponse.json({
    results: companies.map((company) => ({
      slug: company.slug,
      name: company.name,
      city: company.city,
      industry: company.industry,
      legalForm: company.legalForm,
      ico: company.ico,
      category: company.category,
      shortDescription: company.shortDescription,
    })),
    total: companies.length,
  });
}
