// Precomputes relationship-graph snapshots for a curated set of popular
// companies, using the local RPO SQLite database. The output JSON files are
// small (a few KB each) and get committed to the repo, so production
// (which never has data/rpo.sqlite deployed) can still show "Grafické
// väzby" for these companies instead of hiding the section entirely.
//
// Run locally with `node scripts/build-relationship-graphs.mjs` whenever
// data/rpo.sqlite is refreshed or the curated company list changes.

import { existsSync, mkdirSync, writeFileSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const databasePath = resolve(join("data", "rpo.sqlite"));
const outputDir = resolve(__dirname, "..", "app", "data", "relationship-graphs");

const curatedIds = [
  1003617, // Slovnaft
  937053, // ESET
  4445617, // Tatra banka
  1023969, // J&T Finance Group
  1009309, // Orange Slovensko
  464669, // Slovenská sporiteľňa
  17630748, // EasyCredit SK
];

function asRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
}

function asArray(value) {
  if (Array.isArray(value)) return value;
  return value === undefined || value === null ? [] : [value];
}

function firstText(value) {
  if (typeof value === "string" || typeof value === "number") return String(value).trim();
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

function normalizedName(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("sk");
}

function makeFtsQuery(query) {
  const tokens = query
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .match(/[\p{L}\p{N}]+/gu);
  if (!tokens?.length) throw new Error("Zadajte aspoň jeden znak alebo číslicu.");
  return tokens.map((token) => `"${token.replaceAll('"', '""')}"*`).join(" AND ");
}

function getPersonName(details) {
  const person = asRecord(details.personName);
  if (!person) return "";
  return (
    firstText(person.formatedName) ||
    [firstText(person.givenNames), firstText(person.familyNames)].filter(Boolean).join(" ")
  );
}

function getPersonRelations(record) {
  return [...asArray(record.statutoryBodies), ...asArray(record.stakeholders)]
    .map((value) => {
      const details = asRecord(value);
      if (!details) return null;
      const name = getPersonName(details).trim().replace(/\s+/g, " ");
      if (!name) return null;
      return {
        name,
        role: firstText(details.stakeholderType),
        active: !firstText(details.validTo),
      };
    })
    .filter((relation) => relation !== null);
}

function buildCompanyGraph(database, id) {
  const root = database
    .prepare(
      "SELECT id, name, ico, city, legal_form, establishment, termination, payload_json FROM subjects WHERE id = ?",
    )
    .get(id);
  if (!root) return { people: [], companies: [], relationships: [] };

  const rootPayload = asRecord(JSON.parse(root.payload_json)) ?? {};
  const rootRelations = getPersonRelations(rootPayload);
  const peopleById = new Map();
  const relationshipsByKey = new Map();

  for (const relation of rootRelations) {
    const personId = normalizedName(relation.name);
    const person = peopleById.get(personId) ?? { id: personId, name: relation.name, roles: [], active: false };
    if (relation.role && !person.roles.includes(relation.role)) person.roles.push(relation.role);
    person.active ||= relation.active;
    peopleById.set(personId, person);
    const key = `${personId}:${id}`;
    const existing = relationshipsByKey.get(key);
    if (existing) {
      existing.active ||= relation.active;
      if (relation.role && !existing.role.split(" · ").includes(relation.role)) {
        existing.role = [existing.role, relation.role].filter(Boolean).join(" · ");
      }
    } else {
      relationshipsByKey.set(key, { personId, companyId: id, role: relation.role, active: relation.active });
    }
  }

  const people = [...peopleById.values()]
    .sort((left, right) => Number(right.active) - Number(left.active) || left.name.localeCompare(right.name, "sk"))
    .slice(0, 12);
  const selectedPeople = new Set(people.map((person) => person.id));
  const companiesById = new Map();
  const matchPeople = database.prepare(`
    SELECT s.id, s.name, s.ico, s.city, s.legal_form, s.establishment, s.termination, s.payload_json
    FROM subjects_fts
    JOIN subjects s ON s.id = subjects_fts.rowid
    WHERE subjects_fts MATCH ? AND s.id != ?
    ORDER BY bm25(subjects_fts)
    LIMIT 80
  `);

  for (const person of people) {
    const query = makeFtsQuery(person.name);
    const candidates = matchPeople.all(query, id);
    const matchingRelations = candidates
      .flatMap((company) => {
        const payload = asRecord(JSON.parse(company.payload_json)) ?? {};
        return getPersonRelations(payload)
          .filter((relation) => normalizedName(relation.name) === person.id)
          .map((relation) => ({ company, relation }));
      })
      .sort((left, right) => Number(right.relation.active) - Number(left.relation.active));

    for (const { company, relation } of matchingRelations) {
      if (companiesById.size >= 12 && !companiesById.has(company.id)) continue;
      companiesById.set(company.id, { id: company.id, name: company.name, ico: company.ico, city: company.city });
      const key = `${person.id}:${company.id}`;
      const existing = relationshipsByKey.get(key);
      if (existing) {
        existing.active ||= relation.active;
        if (relation.role && !existing.role.split(" · ").includes(relation.role)) {
          existing.role = [existing.role, relation.role].filter(Boolean).join(" · ");
        }
      } else {
        relationshipsByKey.set(key, {
          personId: person.id,
          companyId: company.id,
          role: relation.role,
          active: relation.active,
        });
      }
      if (companiesById.size >= 12) break;
    }
  }

  return {
    people,
    companies: [...companiesById.values()].sort((left, right) => left.name.localeCompare(right.name, "sk")),
    relationships: [...relationshipsByKey.values()].filter((relationship) => selectedPeople.has(relationship.personId)),
  };
}

function main() {
  if (!existsSync(databasePath)) {
    throw new Error(`Lokálna databáza ${databasePath} nie je dostupná. Spustite npm run data:import.`);
  }

  mkdirSync(outputDir, { recursive: true });
  const database = new DatabaseSync(databasePath, { readOnly: true });
  try {
    const generatedAt = new Date().toISOString();
    for (const id of curatedIds) {
      const graph = buildCompanyGraph(database, id);
      const outputPath = join(outputDir, `${id}.json`);
      writeFileSync(outputPath, JSON.stringify({ id, generatedAt, graph }, null, 2));
      console.log(`Uložený graf väzieb pre subjekt ${id} (${graph.people.length} osôb, ${graph.companies.length} firiem).`);
    }
  } finally {
    database.close();
  }
}

main();
