import { existsSync } from "node:fs";
import { join } from "node:path";
import { DatabaseSync } from "node:sqlite";

const DATABASE_PATH =
  join(process.cwd(), "data", "rpo.sqlite");

export type RpoSubject = {
  id: number;
  name: string;
  ico: string;
  city: string;
  legalForm: string;
  legalStatus: string;
  establishment: string;
  termination: string;
  address: string;
  sourceRegister: string;
  activities: string[];
  statutoryBodies: string[];
};

type SubjectRow = {
  id: number;
  name: string;
  ico: string;
  city: string;
  legal_form: string;
  establishment: string;
  termination: string;
  payload_json: string;
};

export class RpoDatabaseError extends Error {
  readonly statusCode: number;

  constructor(message: string, statusCode = 500) {
    super(message);
    this.name = "RpoDatabaseError";
    this.statusCode = statusCode;
  }
}

function asRecord(value: unknown): Record<string, unknown> | null {
  return typeof value === "object" && value !== null && !Array.isArray(value)
    ? (value as Record<string, unknown>)
    : null;
}

function asArray(value: unknown): unknown[] {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
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

  for (const key of ["value", "values", "entries", "economicActivityDescription"]) {
    if (key in record) {
      const text = firstText(record[key]);
      if (text) return text;
    }
  }

  return "";
}

function latestEntry(value: unknown): unknown {
  return asArray(value)
    .filter((entry) => asRecord(entry))
    .sort((left, right) => {
      const leftDate = firstText(asRecord(left)?.validFrom);
      const rightDate = firstText(asRecord(right)?.validFrom);
      return rightDate.localeCompare(leftDate);
    })[0];
}

function getDatabase(): DatabaseSync {
  if (!existsSync(DATABASE_PATH)) {
    throw new RpoDatabaseError(
      "Lokálny register ešte nie je pripravený. Spustite npm run data:import.",
      503,
    );
  }

  try {
    return new DatabaseSync(DATABASE_PATH, { readOnly: true });
  } catch {
    throw new RpoDatabaseError("Databázu registra sa nepodarilo otvoriť.");
  }
}

function makeFtsQuery(query: string): string {
  const tokens = query
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .match(/[\p{L}\p{N}]+/gu);
  if (!tokens?.length) {
    throw new RpoDatabaseError("Zadajte aspoň jeden znak alebo číslicu.");
  }
  return tokens.map((token) => `"${token.replaceAll('"', '""')}"*`).join(" AND ");
}

function toSubject(row: SubjectRow, payload: unknown): RpoSubject {
  const record = asRecord(payload) ?? {};
  const address = asRecord(latestEntry(record.addresses)) ?? {};
  const street = firstText(address.street);
  const buildingNumber = firstText(address.buildingNumber);
  const regNumber = firstText(address.regNumber);
  const postalCode = firstText(address.postalCodes);
  const city = firstText(address.municipality) || row.city;
  const addressParts = [
    street,
    [buildingNumber, regNumber].filter(Boolean).join("/"),
    postalCode,
    city,
  ].filter(Boolean);

  const activities = asArray(record.activities)
    .map((activity) => firstText(activity))
    .filter(Boolean);
  const statutoryBodies = asArray(record.statutoryBodies)
    .map((body) => {
      const details = asRecord(body);
      const name =
        firstText(details?.fullName) ||
        [
          firstText(asRecord(details?.personName)?.givenNames),
          firstText(asRecord(details?.personName)?.familyNames),
        ]
          .filter(Boolean)
          .join(" ");
      const role = firstText(details?.stakeholderType);
      return name ? (role ? `${name} · ${role}` : name) : "";
    })
    .filter(Boolean);

  return {
    id: row.id,
    name: row.name,
    ico: row.ico,
    city,
    legalForm: firstText(latestEntry(record.legalForms)) || row.legal_form,
    legalStatus:
      firstText(latestEntry(record.legalStatuses)) ||
      (row.termination ? "Zaniknutý" : "Aktívny"),
    establishment: row.establishment,
    termination: row.termination,
    address: addressParts.join(", "),
    sourceRegister: firstText(asRecord(record.sourceRegister)?.value),
    activities,
    statutoryBodies,
  };
}

export function searchRpo(
  query: string,
  onlyActive: boolean,
): { results: RpoSubject[]; total: number } {
  const database = getDatabase();
  try {
    const isIco = /^\d+$/.test(query);
    const icoFilter = isIco ? (query.length < 8 ? "s.ico LIKE ?" : "s.ico = ?") : "";
    const activeFilter = onlyActive ? " AND (s.termination IS NULL OR s.termination = '')" : "";
    const where = isIco ? icoFilter : "subjects_fts MATCH ?";
    const searchValue = isIco
      ? query.length < 8
        ? `${query}%`
        : query
      : makeFtsQuery(query);
    const parameters = [searchValue];
    const join = isIco ? "" : " JOIN subjects_fts ON subjects_fts.rowid = s.id";
    const countRow = database
      .prepare(
        `SELECT count(*) AS total FROM subjects s${join} WHERE ${where}${activeFilter}`,
      )
      .get(...parameters) as { total: number };
    const rows = database
      .prepare(
        `SELECT s.id, s.name, s.ico, s.city, s.legal_form, s.establishment, s.termination, s.payload_json
         FROM subjects s${join}
         WHERE ${where}${activeFilter}
         ${isIco ? "" : "ORDER BY bm25(subjects_fts), s.name COLLATE NOCASE"}
         LIMIT 20`,
      )
      .all(...parameters) as SubjectRow[];

    return {
      results: rows.map((row) => toSubject(row, JSON.parse(row.payload_json) as unknown)),
      total: countRow.total,
    };
  } catch (error) {
    if (error instanceof RpoDatabaseError) throw error;
    throw new RpoDatabaseError("Vyhľadávanie v lokálnej databáze registra zlyhalo.");
  } finally {
    database.close();
  }
}

export function getRpoSubject(id: number): RpoSubject | null {
  const database = getDatabase();
  try {
    const row = database
      .prepare(
        `SELECT id, name, ico, city, legal_form, establishment, termination, payload_json
         FROM subjects WHERE id = ?`,
      )
      .get(id) as SubjectRow | undefined;
    return row ? toSubject(row, JSON.parse(row.payload_json) as unknown) : null;
  } catch {
    throw new RpoDatabaseError("Údaje subjektu sa nepodarilo načítať z databázy registra.");
  } finally {
    database.close();
  }
}

export const RPO_SOURCE_URL = "https://rpo.minv.sk/rpo-api-doc.html";
