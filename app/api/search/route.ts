import { NextRequest, NextResponse } from "next/server";
import { RPO_SOURCE_URL, RpoDatabaseError } from "../../lib/rpo";
import { searchRpoAvailable } from "../../lib/rpo-data";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = (searchParams.get("query") ?? "").trim();
  const category = (searchParams.get("category") ?? "vsetko").trim().toLowerCase();

  if (!query) {
    return NextResponse.json(
      { error: "Zadajte názov firmy, osoby alebo IČO." },
      { status: 400 },
    );
  }

  if (query.length > 150) {
    return NextResponse.json({ error: "Vyhľadávací výraz je príliš dlhý." }, { status: 400 });
  }

  if (!["vsetko", "aktivne"].includes(category)) {
    return NextResponse.json({ error: "Neplatný filter vyhľadávania." }, { status: 400 });
  }

  try {
    const results = await searchRpoAvailable(query, category === "aktivne");
    return NextResponse.json({
      results: results.results.map((subject) => ({
        id: subject.id,
        name: subject.name,
        city: subject.city,
        industry: subject.activities[0] ?? "",
        legalForm: subject.legalForm,
        ico: subject.ico,
        legalStatus: subject.legalStatus,
        category: "subjekt",
        shortDescription: [
          subject.legalForm,
          subject.city,
          subject.ico ? `IČO ${subject.ico}` : "",
        ]
          .filter(Boolean)
          .join(" · "),
      })),
      total: results.total,
      query,
      source: RPO_SOURCE_URL,
    });
  } catch (error) {
    if (!(error instanceof RpoDatabaseError)) {
      console.error("Local RPO search failed", error);
    }
    const message =
      error instanceof RpoDatabaseError
        ? error.message
        : "Vyhľadávanie v lokálnej databáze RPO zlyhalo.";
    return NextResponse.json(
      { error: message },
      { status: error instanceof RpoDatabaseError ? error.statusCode : 500 },
    );
  }
}
