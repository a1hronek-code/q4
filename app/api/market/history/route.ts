import { NextRequest, NextResponse } from "next/server";

export const runtime = "nodejs";

const currencies = new Set(["USD", "CZK", "GBP", "CHF", "PLN", "HUF"]);
const periods = { "1m": 31, "3m": 92, "1y": 366 } as const;
type Period = keyof typeof periods;

function dateString(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function addDays(value: string, days: number): string {
  const date = new Date(`${value}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + days);
  return dateString(date);
}

function forecastWeekdays(lastDate: string, slopePerObservation: number, lastRate: number) {
  const forecast: Array<{ date: string; rate: number }> = [];
  let date = lastDate;
  let dayOffset = 0;

  while (forecast.length < 5 && dayOffset < 10) {
    dayOffset++;
    date = addDays(lastDate, dayOffset);
    const dayOfWeek = new Date(`${date}T00:00:00Z`).getUTCDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) continue;

    forecast.push({
      date,
      rate: Math.max(0, lastRate + slopePerObservation * forecast.length),
    });
  }

  return forecast;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const currency = (searchParams.get("currency") ?? "").toUpperCase();
  const period = searchParams.get("period") as Period | null;

  if (!currencies.has(currency)) {
    return NextResponse.json({ error: "Požadovaná mena nie je podporovaná." }, { status: 400 });
  }
  if (!period || !(period in periods)) {
    return NextResponse.json({ error: "Zvoľte obdobie 1m, 3m alebo 1y." }, { status: 400 });
  }

  const end = dateString(new Date());
  const startDate = new Date(`${end}T00:00:00Z`);
  startDate.setUTCDate(startDate.getUTCDate() - periods[period]);
  const start = dateString(startDate);
  const url = new URL(
    `https://data-api.ecb.europa.eu/service/data/EXR/D.${currency}.EUR.SP00.A`,
  );
  url.searchParams.set("startPeriod", start);
  url.searchParams.set("endPeriod", end);
  url.searchParams.set("format", "csvdata");

  try {
    const response = await fetch(url, {
      headers: { Accept: "text/csv" },
      next: { revalidate: 21_600 },
      signal: AbortSignal.timeout(15_000),
    });
    if (!response.ok) throw new Error(`ECB exchange-rate API returned HTTP ${response.status}`);

    const csv = await response.text();
    const points = csv
      .split(/\r?\n/)
      .flatMap((line) => {
        const match = line.match(
          /^[^,\r\n]+,[^,\r\n]+,[^,\r\n]+,[^,\r\n]+,[^,\r\n]+,[^,\r\n]+,(\d{4}-\d{2}-\d{2}),([\d.]+),/,
        );
        if (!match) return [];
        const rate = Number(match[2]);
        return Number.isFinite(rate) && rate > 0
          ? [{ date: match[1], rate }]
          : [];
      })
      .filter((point) => point.date >= start && point.date <= end)
      .sort((left, right) => left.date.localeCompare(right.date));
    if (points.length < 2) throw new Error("ECB returned too few rate observations");

    const recent = points.slice(-20);
    const meanX = (recent.length - 1) / 2;
    const meanY = recent.reduce((sum, point) => sum + point.rate, 0) / recent.length;
    const numerator = recent.reduce(
      (sum, point, index) => sum + (index - meanX) * (point.rate - meanY),
      0,
    );
    const denominator = recent.reduce((sum, _point, index) => sum + (index - meanX) ** 2, 0);
    const slopePerObservation = denominator ? numerator / denominator : 0;
    const forecast = forecastWeekdays(points.at(-1)!.date, slopePerObservation, points.at(-1)!.rate);
    const firstRate = points[0].rate;
    const lastRate = points.at(-1)!.rate;

    return NextResponse.json(
      {
        currency,
        name: currency,
        period,
        points,
        forecast,
        changePercent: ((lastRate - firstRate) / firstRate) * 100,
        low: Math.min(...points.map((point) => point.rate)),
        high: Math.max(...points.map((point) => point.rate)),
        source: "Dátové rozhranie Európskej centrálnej banky (ECB)",
      },
      { headers: { "Cache-Control": "public, s-maxage=21600, stale-while-revalidate=3600" } },
    );
  } catch (cause) {
    console.error("ECB exchange-rate history failed", cause);
    return NextResponse.json(
      { error: "Históriu referenčného kurzu sa nepodarilo načítať z ECB. Skúste to znova." },
      { status: 502 },
    );
  }
}
