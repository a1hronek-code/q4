import { NextResponse } from "next/server";

export const runtime = "nodejs";

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

function coordinate(value: string | null, minimum: number, maximum: number) {
  if (!value || value.trim() === "") return null;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

function stationAddress(tags: Record<string, string>): string | undefined {
  const street = [tags["addr:street"], tags["addr:housenumber"]]
    .filter(Boolean)
    .join(" ");
  return [street, tags["addr:city"]].filter(Boolean).join(", ") || undefined;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latitude = coordinate(url.searchParams.get("lat"), -90, 90);
  const longitude = coordinate(url.searchParams.get("lon"), -180, 180);

  if (latitude === null || longitude === null) {
    return NextResponse.json(
      { error: "Zadaná poloha nie je platná." },
      { status: 400 },
    );
  }

  const queryLatitude = latitude.toFixed(3);
  const queryLongitude = longitude.toFixed(3);
  const query = [
    "[out:json][timeout:20];",
    "(",
    `node(around:5000,${queryLatitude},${queryLongitude})[amenity=fuel];`,
    `way(around:5000,${queryLatitude},${queryLongitude})[amenity=fuel];`,
    `relation(around:5000,${queryLatitude},${queryLongitude})[amenity=fuel];`,
    ");out center tags;",
  ].join("");
  const endpoint = new URL("https://overpass-api.de/api/interpreter");
  endpoint.searchParams.set("data", query);

  try {
    const response = await fetch(endpoint, {
      headers: {
        Accept: "application/json",
        "User-Agent": "Q4.sk/1.0 (Slovak company intelligence)",
      },
      next: { revalidate: 900 },
      signal: AbortSignal.timeout(25_000),
    });
    if (!response.ok) {
      throw new Error(`Overpass returned HTTP ${response.status}`);
    }

    const body = await response.json() as { elements?: OverpassElement[] };
    if (!Array.isArray(body.elements)) {
      throw new Error("Overpass returned an invalid response");
    }

    const stations = body.elements.flatMap((element) => {
      const stationLatitude = element.lat ?? element.center?.lat;
      const stationLongitude = element.lon ?? element.center?.lon;
      if (
        typeof stationLatitude !== "number" ||
        typeof stationLongitude !== "number" ||
        !Number.isFinite(stationLatitude) ||
        !Number.isFinite(stationLongitude)
      ) {
        return [];
      }

      const tags = element.tags ?? {};
      return [{
        id: `${element.type}/${element.id}`,
        name: tags.name || tags.brand || tags.operator || "Čerpacia stanica",
        address: stationAddress(tags),
        latitude: stationLatitude,
        longitude: stationLongitude,
      }];
    });

    return NextResponse.json({ stations });
  } catch (error) {
    console.error("Nearby fuel-station request failed", error);
    return NextResponse.json(
      { error: "Zoznam čerpacích staníc sa nepodarilo načítať. Skúste to znova neskôr." },
      { status: 502 },
    );
  }
}
