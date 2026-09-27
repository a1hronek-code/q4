import { NextRequest, NextResponse } from "next/server";
import { RPO_SOURCE_URL, RpoApiError, searchRpo } from "../../lib/rpo";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const category = (searchParams.get("category") ?? "vsetko").trim().toLowerCase();

  if (!query) {
    return NextResponse.json({ error: "Zadajte názov subjektu alebo IČO." }, { status: 400 });
  }

  if (query.length > 150) {
    return NextResponse.json({ error: "Vyhľadávací výraz je príliš dlhý." }, { status: 400 });
  }

  if (!["vsetko", "aktivne"].includes(category)) {
    return NextResponse.json({ error: "Neplatný filter vyhľadávania." }, { status: 400 });
  }

  try {
    const results = await searchRpo(query, category === "aktivne");
    return NextResponse.json({
      results: results.slice(0, 20).map((subject) => ({
        id: subject.id,
        name: subject.name,
        city: subject.city,
        industry: subject.activity,
        legalForm: subject.legalForm,
        ico: subject.ico,
        category: "subjekt",
        shortDescription: [
          subject.legalForm,
          subject.city,
          subject.ico ? `IČO ${subject.ico}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      })),
      total: results.length,
      query,
      source: RPO_SOURCE_URL,
    });
  } catch (error) {
    console.error("RPO search failed", error);
    const message =
      error instanceof RpoApiError
        ? error.message
        : "Vyhľadávanie v slovenskom registri RPO zlyhalo.";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
