import { NextResponse } from "next/server";

export const runtime = "nodejs";

type MarketResult<T> = {
  data: T | null;
  error: string | null;
};

type ExchangeRates = {
  date: string;
  rates: Record<string, number>;
};

type CurrentWeather = {
  time: string;
  temperature: number;
  feelsLike: number;
  weatherCode: number;
  description: string;
  windSpeed: number;
  tomorrow: {
    date: string;
    minTemperature: number;
    maxTemperature: number;
    weatherCode: number;
    description: string;
  } | null;
};

type FuelPrices = {
  week: string;
  petrol: number;
  diesel: number;
};

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asNumber(value: unknown): number | null {
  return typeof value === "number" && Number.isFinite(value) ? value : null;
}

function weatherDescription(code: number): string {
  if (code === 0) return "Jasno";
  if (code <= 3) return "Polooblačno až zamračené";
  if (code <= 48) return "Hmla";
  if (code <= 57) return "Mrholenie";
  if (code <= 67) return "Dážď";
  if (code <= 77) return "Sneženie";
  if (code <= 82) return "Prehánky";
  if (code <= 86) return "Snehové prehánky";
  if (code <= 99) return "Búrka";
  return "Počasie";
}

async function loadExchangeRates(): Promise<ExchangeRates> {
  const response = await fetch("https://nbs.sk/export/en/exchange-rate/latest/xml", {
    headers: { Accept: "application/xml" },
    next: { revalidate: 21_600 },
    signal: AbortSignal.timeout(15_000),
  });
  if (!response.ok) throw new Error(`NBS exchange-rate feed returned HTTP ${response.status}`);

  const xml = await response.text();
  const date = xml.match(/<Cube\s+time="(\d{4}-\d{2}-\d{2})"/)?.[1] ?? "";
  if (!date) throw new Error("NBS exchange-rate feed returned no reference date");

  const requiredCurrencies = ["USD", "CZK", "GBP", "CHF", "PLN", "HUF"];
  const rates: Record<string, number> = {};
  for (const match of xml.matchAll(/<Cube\s+currency="([A-Z]{3})"\s+rate="([\d,.]+)"\s*\/>/g)) {
    if (!requiredCurrencies.includes(match[1])) continue;
    const rate = Number(match[2].replaceAll(",", ""));
    if (Number.isFinite(rate) && rate > 0) rates[match[1]] = rate;
  }

  if (requiredCurrencies.some((currency) => !rates[currency])) {
    throw new Error("NBS exchange-rate feed returned incomplete reference rates");
  }
  return { date, rates };
}

function asNumberArray(value: unknown): number[] | null {
  return Array.isArray(value) && value.every((entry) => typeof entry === "number")
    ? (value as number[])
    : null;
}

function asStringArray(value: unknown): string[] | null {
  return Array.isArray(value) && value.every((entry) => typeof entry === "string")
    ? (value as string[])
    : null;
}

async function loadWeather(): Promise<CurrentWeather> {
  const response = await fetch(
    "https://api.open-meteo.com/v1/forecast?latitude=48.1486&longitude=17.1077&current=temperature_2m,apparent_temperature,weather_code,wind_speed_10m&daily=temperature_2m_max,temperature_2m_min,weather_code&timezone=Europe%2FBratislava&forecast_days=3",
    { next: { revalidate: 900 } },
  );
  if (!response.ok) throw new Error(`Open-Meteo returned HTTP ${response.status}`);

  const body = asRecord(await response.json());
  const current = asRecord(body?.current);
  const time = typeof current?.time === "string" ? current.time : "";
  const temperature = asNumber(current?.temperature_2m);
  const feelsLike = asNumber(current?.apparent_temperature);
  const weatherCode = asNumber(current?.weather_code);
  const windSpeed = asNumber(current?.wind_speed_10m);
  if (
    !time ||
    temperature === null ||
    feelsLike === null ||
    weatherCode === null ||
    windSpeed === null
  ) {
    throw new Error("Open-Meteo returned incomplete current-weather data");
  }

  const daily = asRecord(body?.daily);
  const dailyDates = asStringArray(daily?.time);
  const dailyMax = asNumberArray(daily?.temperature_2m_max);
  const dailyMin = asNumberArray(daily?.temperature_2m_min);
  const dailyCode = asNumberArray(daily?.weather_code);
  // Index 0 is today; index 1 is tomorrow when three forecast days are requested.
  const tomorrow =
    dailyDates && dailyMax && dailyMin && dailyCode && dailyDates.length > 1
      ? {
          date: dailyDates[1],
          maxTemperature: dailyMax[1],
          minTemperature: dailyMin[1],
          weatherCode: dailyCode[1],
          description: weatherDescription(dailyCode[1]),
        }
      : null;

  return {
    time,
    temperature,
    feelsLike,
    weatherCode,
    description: weatherDescription(weatherCode),
    windSpeed,
    tomorrow,
  };
}

async function loadFuelPrices(): Promise<FuelPrices> {
  const response = await fetch("https://www.fuel-prices.eu/Slovakia/?format=md", {
    next: { revalidate: 43_200 },
  });
  if (!response.ok) throw new Error(`Fuel-price source returned HTTP ${response.status}`);

  const markdown = await response.text();
  const match = markdown.match(
    /In the week of ([^,]+), the official average consumer price in Slovakia was €([\d.]+)\/L for Euro 95 petrol and €([\d.]+)\/L for diesel\./,
  );
  if (!match) throw new Error("Fuel-price source returned an unsupported data format");

  const petrol = Number(match[2]);
  const diesel = Number(match[3]);
  if (!Number.isFinite(petrol) || !Number.isFinite(diesel) || petrol <= 0 || diesel <= 0) {
    throw new Error("Fuel-price source returned invalid prices");
  }
  return { week: match[1], petrol, diesel };
}

async function resultFor<T>(
  label: string,
  loader: () => Promise<T>,
): Promise<MarketResult<T>> {
  try {
    return { data: await loader(), error: null };
  } catch (error) {
    console.error(`${label} data request failed`, error);
    return { data: null, error: "Údaje sa momentálne nepodarilo načítať." };
  }
}

export async function GET() {
  const [exchangeRates, weather, fuelPrices] = await Promise.all([
    resultFor("NBS exchange rates", loadExchangeRates),
    resultFor("Bratislava weather", loadWeather),
    resultFor("Slovak fuel prices", loadFuelPrices),
  ]);

  return NextResponse.json({ exchangeRates, weather, fuelPrices });
}
