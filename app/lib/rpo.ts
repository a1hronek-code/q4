const RPO_API_URL = "https://rpo.statistics.sk/rpo/rest";

export type RpoSubject = {
  id: number;
  name: string;
  ico: string;
  city: string;
  legalForm: string;
  establishment: string;
  termination: string;
  activity: string;
};

export class RpoApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "RpoApiError";
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function firstText(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return String(value).trim();
  }

  if (Array.isArray(value)) {
    for (const entry of value) {
      const text = firstText(entry);
      if (text) return text;
    }
    return "";
  }

  const record = asRecord(value);
  if (!record) return "";

  for (const key of ["value", "values", "entries"]) {
    if (key in record) {
      const text = firstText(record[key]);
      if (text) return text;
    }
  }

  return "";
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

export function parseRpoSubject(value: unknown): RpoSubject | null {
  const record = asRecord(value);
  if (!record) return null;

  const id = Number(record.id);
  if (!Number.isSafeInteger(id) || id <= 0) return null;

  const address = asRecord(asArray(record.addresses)[0]);
  const statisticalCodes = asRecord(record.statisticalCodes);

  return {
    id,
    name: firstText(record.fullNames) || `Subjekt RPO ${id}`,
    ico: firstText(record.identifiers),
    city: firstText(address?.municipality),
    legalForm: firstText(record.legalForms),
    establishment: firstText(record.establishment),
    termination: firstText(record.termination),
    activity: firstText(statisticalCodes?.mainActivity),
  };
}

async function readRpoJson(url: URL): Promise<unknown> {
  let response: Response;

  try {
    response = await fetch(url, {
      headers: { Accept: "application/json" },
      signal: AbortSignal.timeout(12_000),
      next: { revalidate: 1800 },
    });
  } catch {
    throw new RpoApiError("Slovenský register RPO momentálne nie je dostupný.");
  }

  if (!response.ok) {
    throw new RpoApiError(
      `Slovenský register RPO vrátil chybu (HTTP ${response.status}).`,
    );
  }

  try {
    return (await response.json()) as unknown;
  } catch {
    throw new RpoApiError("Register RPO vrátil neplatnú odpoveď.");
  }
}

export async function searchRpo(query: string, onlyActive: boolean): Promise<RpoSubject[]> {
  const url = new URL(`${RPO_API_URL}/search`);
  const isIco = /^\d+$/.test(query);
  url.searchParams.set(isIco ? "identifier" : "fullName", query);
  if (onlyActive) url.searchParams.set("onlyActive", "true");

  const response = asRecord(await readRpoJson(url));
  const results = Array.isArray(response?.results) ? response.results : [];

  return results
    .map(parseRpoSubject)
    .filter((subject): subject is RpoSubject => subject !== null);
}

export async function getRpoSubject(id: number): Promise<RpoSubject | null> {
  const url = new URL(`${RPO_API_URL}/entity/${id}`);
  const subject = parseRpoSubject(await readRpoJson(url));
  return subject?.id === id ? subject : null;
}

export const RPO_SOURCE_URL = "https://rpo.minv.sk/rpo-api-doc.html";
