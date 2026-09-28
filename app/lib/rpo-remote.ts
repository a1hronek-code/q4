import { RpoDatabaseError, type RpoSubject } from "./rpo";

const RPO_REST_URL = "https://rpo.statistics.sk/rpo/rest";
const CACHE_LIMIT = 500;

type SearchResult = {
  id?: unknown;
  orgNameFullName?: unknown;
  orgIdentifierValue?: unknown;
  addrMunicipality?: unknown;
  orgEstablishmentDate?: unknown;
  orgTerminationDate?: unknown;
  historical?: unknown;
  sourceRegister?: unknown;
  orgLastActualizationDate?: unknown;
};

type SearchResponse = {
  results?: unknown;
  isLimited?: unknown;
};

type LegacyEntry = {
  value?: unknown;
  establishedDate?: unknown;
  terminatedDate?: unknown;
  economicActivityDescription?: unknown;
  stakeholderType?: unknown;
  personName?: unknown;
  fullName?: unknown;
  sourceName?: unknown;
};

type LegacyEntity = {
  id?: unknown;
  ipo?: unknown;
  fullName?: unknown;
  address?: unknown;
  legalForms?: unknown;
  establishedDate?: unknown;
  terminationDate?: unknown;
  terminatedDate?: unknown;
  activity?: unknown;
  statutory?: unknown;
  stakeholder?: unknown;
  legalStatus?: unknown;
  sourceRegister?: unknown;
  actualizationDate?: unknown;
};

type CachedValue = {
  expiresAt: number;
  value: Promise<unknown>;
};

const responseCache = new Map<string, CachedValue>();

const htmlEntities: Record<string, string> = {
  Aacute: "Á",
  aacute: "á",
  Acirc: "Â",
  acirc: "â",
  Auml: "Ä",
  auml: "ä",
  Ccaron: "Č",
  ccaron: "č",
  Cacute: "Ć",
  cacute: "ć",
  Dcaron: "Ď",
  dcaron: "ď",
  Eacute: "É",
  eacute: "é",
  Ecaron: "Ě",
  ecaron: "ě",
  Iacute: "Í",
  iacute: "í",
  Lacute: "Ĺ",
  lacute: "ĺ",
  Lcaron: "Ľ",
  lcaron: "ľ",
  Nacute: "Ń",
  nacute: "ń",
  Oacute: "Ó",
  oacute: "ó",
  Ocirc: "Ô",
  ocirc: "ô",
  Ouml: "Ö",
  ouml: "ö",
  Racute: "Ŕ",
  racute: "ŕ",
  Scaron: "Š",
  scaron: "š",
  Tcaron: "Ť",
  tcaron: "ť",
  Uacute: "Ú",
  uacute: "ú",
  Ucirc: "Û",
  ucirc: "û",
  Uuml: "Ü",
  uuml: "ü",
  Yacute: "Ý",
  yacute: "ý",
  Zcaron: "Ž",
  zcaron: "ž",
  amp: "&",
  apos: "'",
  gt: ">",
  lt: "<",
  nbsp: " ",
  quot: '"',
};

function record(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function array(value: unknown): unknown[] {
  return Array.isArray(value) ? value : value == null ? [] : [value];
}

function text(value: unknown): string {
  if (typeof value === "string" || typeof value === "number") {
    return decodeHtmlEntities(String(value).trim());
  }
  if (Array.isArray(value)) {
    for (const entry of value) {
      const result = text(entry);
      if (result) return result;
    }
    return "";
  }

  const object = record(value);
  if (!object) return "";
  for (const key of ["value", "formatedName", "economicActivityDescription"]) {
    if (key in object) {
      const result = text(object[key]);
      if (result) return result;
    }
  }
  return "";
}

function decodeHtmlEntities(value: string): string {
  return value.replace(/&(#(?:x[\da-f]+|\d+)|[a-z][\da-z]+);/gi, (entity, code: string) => {
    if (code[0] === "#") {
      const hexadecimal = code[1]?.toLowerCase() === "x";
      const point = Number.parseInt(code.slice(hexadecimal ? 2 : 1), hexadecimal ? 16 : 10);
      return Number.isSafeInteger(point) && point > 0 && point <= 0x10ffff
        ? String.fromCodePoint(point)
        : entity;
    }
    return htmlEntities[code] ?? entity;
  });
}

function values(value: unknown): LegacyEntry[] {
  return array(value).filter((entry): entry is LegacyEntry => record(entry) !== null);
}

function latestEntry(value: unknown): LegacyEntry | undefined {
  return values(value).sort((left, right) => {
    const leftActive = !left.terminatedDate;
    const rightActive = !right.terminatedDate;
    if (leftActive !== rightActive) return Number(rightActive) - Number(leftActive);
    return dateForSort(right.establishedDate).localeCompare(dateForSort(left.establishedDate));
  })[0];
}

function dateForSort(value: unknown): string {
  const date = text(value);
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : date;
}

function isoDate(value: unknown): string {
  const date = text(value);
  const match = /^(\d{2})\.(\d{2})\.(\d{4})$/.exec(date);
  return match ? `${match[3]}-${match[2]}-${match[1]}` : date;
}

function currentText(value: unknown): string {
  return text(latestEntry(value)?.value);
}

function currentPerson(value: unknown): string {
  const entry = record(value);
  if (!entry) return "";
  const personName = record(entry.personName);
  return text(personName?.formatedName) || text(entry.fullName);
}

function currentRelations(value: unknown): string[] {
  return values(value)
    .filter((entry) => !entry.terminatedDate)
    .map((entry) => {
      const name = currentPerson(entry);
      const role = text(entry.stakeholderType);
      return name ? (role ? `${name} · ${role}` : name) : "";
    })
    .filter(Boolean);
}

function toSubject(entity: LegacyEntity, id: number): RpoSubject {
  const name = currentText(entity.fullName);
  const address = latestEntry(entity.address) as (LegacyEntry & {
    street?: unknown;
    buildingNumber?: unknown;
    regNumber?: unknown;
    psc?: unknown;
    municipality?: unknown;
  }) | undefined;
  const city = text(address?.municipality);
  const addressParts = [
    text(address?.street),
    [text(address?.buildingNumber), text(address?.regNumber)].filter(Boolean).join("/"),
    text(address?.psc),
    city,
  ].filter(Boolean);
  const termination = isoDate(entity.terminationDate ?? entity.terminatedDate);
  const activities = values(entity.activity)
    .filter((entry) => !entry.terminatedDate)
    .map((entry) => text(entry.economicActivityDescription))
    .filter(Boolean);

  return {
    id,
    name: name || `Subjekt RPO ${id}`,
    ico: currentText(entity.ipo),
    city,
    legalForm: currentText(entity.legalForms),
    legalStatus: currentText(entity.legalStatus) || (termination ? "Zaniknutý" : "Aktívny"),
    establishment: isoDate(entity.establishedDate),
    termination,
    address: addressParts.join(", "),
    sourceRegister: text(latestEntry(entity.sourceRegister)?.sourceName),
    activities: [...new Set(activities)],
    statutoryBodies: [...new Set(currentRelations(entity.statutory))],
    stakeholders: [...new Set(currentRelations(entity.stakeholder))],
    lastUpdated: isoDate(entity.actualizationDate),
  };
}

async function cached<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const now = Date.now();
  const existing = responseCache.get(key);
  if (existing && existing.expiresAt > now) return existing.value as Promise<T>;
  if (existing) responseCache.delete(key);

  const value = load();
  responseCache.set(key, { expiresAt: now + ttlMs, value });
  while (responseCache.size > CACHE_LIMIT) {
    const oldest = responseCache.keys().next().value;
    if (oldest === undefined) break;
    responseCache.delete(oldest);
  }

  try {
    return await value;
  } catch (error) {
    if (responseCache.get(key)?.value === value) responseCache.delete(key);
    throw error;
  }
}

async function requestRpo<T>(
  path: string,
  body: string,
  contentType: string,
): Promise<T | null> {
  try {
    const sessionResponse = await fetch(`${RPO_REST_URL}/auth/user`, {
      method: "POST",
      cache: "no-store",
      signal: AbortSignal.timeout(15_000),
    });
    if (!sessionResponse.ok) {
      throw new Error(`Anonymous session returned HTTP ${sessionResponse.status}`);
    }

    const cookies = sessionResponse.headers
      .getSetCookie()
      .map((cookie) => cookie.split(";", 1)[0])
      .filter(Boolean)
      .join("; ");
    if (!cookies) throw new Error("RPO did not provide an anonymous session cookie");

    const response = await fetch(`${RPO_REST_URL}${path}`, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Cookie: cookies,
      },
      body,
      cache: "no-store",
      signal: AbortSignal.timeout(20_000),
    });
    if (response.status === 404) return null;
    if (!response.ok) throw new Error(`RPO returned HTTP ${response.status}`);
    return (await response.json()) as T;
  } catch (cause) {
    if (cause instanceof RpoDatabaseError) throw cause;
    console.error("Official RPO request failed", cause);
    throw new RpoDatabaseError(
      "Oficiálny register RPO momentálne neodpovedá. Skúste to znova neskôr.",
      503,
    );
  }
}

export async function searchRpoRemote(
  query: string,
  onlyActive: boolean,
): Promise<{ results: RpoSubject[]; total: number }> {
  const normalizedQuery = query.trim();
  const key = `search:${onlyActive ? "active" : "all"}:${normalizedQuery.toLocaleLowerCase("sk")}`;
  return cached(key, 60 * 60 * 1000, async () => {
    const filter = /^\d+$/.test(normalizedQuery)
      ? { organizationIdentifier: normalizedQuery }
      : { organizationFullName: normalizedQuery };
    const requestBody = JSON.stringify({
      query: {
        ...filter,
        fullTextSearch: [true],
        showHistorical: [!onlyActive],
        showOrganizationUnit: [true],
      },
    });
    const result = await requestRpo<SearchResponse>(
      "/search/search/anonym",
      requestBody,
      "application/json",
    );
    if (!result) return { results: [], total: 0 };

    const searchResults = array(result.results)
      .map((entry) => record(entry) as SearchResult | null)
      .filter((entry): entry is SearchResult => entry !== null)
      .filter((entry) => !onlyActive || entry.historical !== true);

    const subjects = searchResults.flatMap((entry) => {
      const id = Number(entry.id);
      if (!Number.isSafeInteger(id) || id <= 0) return [];
      const termination = isoDate(entry.orgTerminationDate);
      return [{
        id,
        name: text(entry.orgNameFullName) || `Subjekt RPO ${id}`,
        ico: text(entry.orgIdentifierValue),
        city: text(entry.addrMunicipality),
        legalForm: "",
        legalStatus: termination ? "Zaniknutý" : "Aktívny",
        establishment: isoDate(entry.orgEstablishmentDate),
        termination,
        address: "",
        sourceRegister: text(entry.sourceRegister),
        activities: [],
        statutoryBodies: [],
        stakeholders: [],
        lastUpdated: isoDate(entry.orgLastActualizationDate),
      }];
    });

    return { results: subjects, total: subjects.length };
  });
}

export async function getRpoSubjectRemote(id: number): Promise<RpoSubject | null> {
  return cached(`subject:${id}`, 6 * 60 * 60 * 1000, async () => {
    const body = new URLSearchParams({
      organizationId: String(id),
      showHistory: "true",
    }).toString();
    const entity = await requestRpo<LegacyEntity>(
      "/search/getOrganization/anonym",
      body,
      "application/x-www-form-urlencoded",
    );
    if (!entity) return null;
    const entityId = Number(entity.id);
    if (!Number.isSafeInteger(entityId) || entityId !== id) {
      throw new RpoDatabaseError("Register RPO vrátil neplatný identifikátor subjektu.");
    }
    return toSubject(entity, id);
  });
}
