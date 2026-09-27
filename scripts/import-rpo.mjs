import { createReadStream, createWriteStream, existsSync, mkdirSync, renameSync, rmSync, statSync } from "node:fs";
import { createGunzip } from "node:zlib";
import { createInterface } from "node:readline";
import { DatabaseSync } from "node:sqlite";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { basename, join, resolve } from "node:path";

const bucketUrl = new URL(
  "https://frkqbrydxwdp.compat.objectstorage.eu-frankfurt-1.oraclecloud.com/susr-rpo/",
);
const dataDirectory = resolve("data");
const downloadDirectory = join(dataDirectory, ".rpo-download");
const databasePath = resolve(join(dataDirectory, "rpo.sqlite"));
const buildingPath = `${databasePath}.building`;
const previousPath = `${databasePath}.previous`;
const xmlDecode = (value) =>
  value.replaceAll("&amp;", "&").replaceAll("&lt;", "<").replaceAll("&gt;", ">").replaceAll("&quot;", '"');

function fail(message) {
  throw new Error(message);
}

async function listObjects(prefix) {
  const objects = [];
  let continuationToken;

  do {
    const url = new URL(bucketUrl);
    url.searchParams.set("list-type", "2");
    url.searchParams.set("prefix", prefix);
    if (continuationToken) url.searchParams.set("continuation-token", continuationToken);

    const response = await fetch(url, { signal: AbortSignal.timeout(60_000) });
    if (!response.ok) fail(`Nepodarilo sa načítať zoznam RPO súborov (HTTP ${response.status}).`);

    const xml = await response.text();
    for (const match of xml.matchAll(/<Contents>([\s\S]*?)<\/Contents>/g)) {
      const key = match[1].match(/<Key>([\s\S]*?)<\/Key>/)?.[1];
      const size = Number(match[1].match(/<Size>(\d+)<\/Size>/)?.[1]);
      if (key && Number.isSafeInteger(size)) objects.push({ key: xmlDecode(key), size });
    }

    const truncated = xml.match(/<IsTruncated>(true|false)<\/IsTruncated>/)?.[1] === "true";
    const token = xml.match(/<NextContinuationToken>([\s\S]*?)<\/NextContinuationToken>/)?.[1];
    continuationToken = truncated && token ? xmlDecode(token) : undefined;
    if (truncated && !continuationToken) fail("RPO úložisko vrátilo neúplný stránkovací token.");
  } while (continuationToken);

  return objects;
}

async function downloadObject(object, index, total) {
  const name = basename(object.key);
  const outputPath = join(downloadDirectory, name);
  const partialPath = `${outputPath}.part`;
  const url = new URL(object.key.split("/").map(encodeURIComponent).join("/"), bucketUrl);

  console.log(`[${index}/${total}] Sťahujem ${object.key} (${(object.size / 1024 / 1024).toFixed(1)} MB)`);

  try {
    const response = await fetch(url, { signal: AbortSignal.timeout(30 * 60_000) });
    if (!response.ok || !response.body) {
      fail(`Súbor ${object.key} sa nepodarilo stiahnuť (HTTP ${response.status}).`);
    }

    await pipeline(Readable.fromWeb(response.body), createWriteStream(partialPath));
    const downloadedSize = statSync(partialPath).size;
    if (downloadedSize !== object.size) {
      fail(`Súbor ${object.key} má neočakávanú veľkosť ${downloadedSize}/${object.size} bajtov.`);
    }
    renameSync(partialPath, outputPath);
    return outputPath;
  } catch (error) {
    rmSync(partialPath, { force: true });
    throw error;
  }
}

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
    for (const item of value) {
      const text = firstText(item);
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

function currentText(value) {
  return firstText(currentEntry(value));
}

function currentEntry(value) {
  return asArray(value)
    .filter((entry) => asRecord(entry))
    .sort((left, right) => {
      const a = firstText(asRecord(left)?.validFrom);
      const b = firstText(asRecord(right)?.validFrom);
      return b.localeCompare(a);
    })[0];
}

function personName(value) {
  const record = asRecord(value);
  if (!record) return "";
  return firstText(record.fullName) ||
    [firstText(asRecord(record.personName)?.givenNames), firstText(asRecord(record.personName)?.familyNames)]
      .filter(Boolean)
      .join(" ");
}

function searchableText(record, name, ico, city, legalForm) {
  const address = asRecord(asArray(record.addresses)[0]) ?? {};
  const activities = asArray(record.activities).map(firstText);
  const alternateNames = asArray(record.alternativeNames).map(firstText);
  const people = [
    ...asArray(record.statutoryBodies).map(personName),
    ...asArray(record.stakeholders).map(personName),
  ];
  return [
    name,
    ico,
    city,
    legalForm,
    firstText(record.legalStatuses),
    firstText(address.street),
    firstText(address.postalCodes),
    ...activities,
    ...alternateNames,
    ...people,
  ]
    .filter(Boolean)
    .join(" ");
}

const schema = `
  CREATE TABLE subjects (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    ico TEXT NOT NULL,
    city TEXT NOT NULL,
    legal_form TEXT NOT NULL,
    establishment TEXT NOT NULL,
    termination TEXT NOT NULL,
    search_text TEXT NOT NULL,
    payload_json TEXT NOT NULL
  );
  CREATE INDEX subjects_ico_idx ON subjects(ico);
`;

const upsert = `
  INSERT INTO subjects (
    id, name, ico, city, legal_form, establishment, termination, search_text, payload_json
  ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
  ON CONFLICT(id) DO UPDATE SET
    name = excluded.name,
    ico = excluded.ico,
    city = excluded.city,
    legal_form = excluded.legal_form,
    establishment = excluded.establishment,
    termination = excluded.termination,
    search_text = excluded.search_text,
    payload_json = excluded.payload_json
`;

async function importFile(database, statement, filePath, label, index, total) {
  console.log(`[${index}/${total}] Indexujem ${label}`);
  database.exec("BEGIN");
  let records = 0;

  try {
    const lines = createInterface({
      input: createReadStream(filePath).pipe(createGunzip()),
      crlfDelay: Infinity,
    });

    for await (const line of lines) {
      const trimmed = line.trim().replace(/^,\s*/, "");
      if (!/^\{\s*"id"\s*:/.test(trimmed)) continue;

      let record;
      try {
        record = JSON.parse(trimmed);
      } catch (error) {
        fail(`Neplatný JSON záznam v ${label}: ${error instanceof Error ? error.message : String(error)}`);
      }

      const entity = asRecord(record);
      const id = Number(entity?.id);
      if (!Number.isSafeInteger(id) || id <= 0) fail(`Neplatné ID záznamu v ${label}.`);

      const name = currentText(entity.fullNames) || `Subjekt RPO ${id}`;
      const ico = currentText(entity.identifiers);
      const address = asRecord(currentEntry(entity.addresses));
      const city = firstText(address?.municipality);
      const legalForm = currentText(entity.legalForms);
      const establishment = firstText(entity.establishment);
      const termination = firstText(entity.termination);
      const payload = JSON.stringify(entity);

      statement.run(
        id,
        name,
        ico,
        city,
        legalForm,
        establishment,
        termination,
        searchableText(entity, name, ico, city, legalForm),
        payload,
      );
      records++;
    }

    if (!records) fail(`Súbor ${label} neobsahoval žiadne rozpoznané záznamy.`);
    database.exec("COMMIT");
    console.log(`        ${records.toLocaleString("sk-SK")} záznamov`);
    return records;
  } catch (error) {
    database.exec("ROLLBACK");
    throw error;
  } finally {
    rmSync(filePath, { force: true });
  }
}

function addSearchIndex(database) {
  database.exec(`
    CREATE VIRTUAL TABLE subjects_fts USING fts5(
      name, ico, city, legal_form, search_text,
      content='subjects',
      content_rowid='id',
      tokenize='unicode61 remove_diacritics 2'
    );

    CREATE TRIGGER subjects_ai AFTER INSERT ON subjects BEGIN
      INSERT INTO subjects_fts(rowid, name, ico, city, legal_form, search_text)
      VALUES (new.id, new.name, new.ico, new.city, new.legal_form, new.search_text);
    END;

    CREATE TRIGGER subjects_ad AFTER DELETE ON subjects BEGIN
      INSERT INTO subjects_fts(subjects_fts, rowid, name, ico, city, legal_form, search_text)
      VALUES ('delete', old.id, old.name, old.ico, old.city, old.legal_form, old.search_text);
    END;

    CREATE TRIGGER subjects_au AFTER UPDATE ON subjects BEGIN
      INSERT INTO subjects_fts(subjects_fts, rowid, name, ico, city, legal_form, search_text)
      VALUES ('delete', old.id, old.name, old.ico, old.city, old.legal_form, old.search_text);
      INSERT INTO subjects_fts(rowid, name, ico, city, legal_form, search_text)
      VALUES (new.id, new.name, new.ico, new.city, new.legal_form, new.search_text);
    END;

    INSERT INTO subjects_fts(subjects_fts) VALUES ('rebuild');
    INSERT INTO subjects_fts(subjects_fts) VALUES ('optimize');
    ANALYZE;
  `);
}

async function main() {
  const dailyOnly = process.env.RPO_DAILY_ONLY === "1";
  mkdirSync(downloadDirectory, { recursive: true });
  if (!dailyOnly) {
    rmSync(buildingPath, { force: true });
    rmSync(previousPath, { force: true });
  } else if (!existsSync(buildingPath)) {
    fail("Databáza na pokračovanie importu neexistuje.");
  }

  const [snapshots, dailyFiles] = await Promise.all([
    listObjects("batch-init/"),
    listObjects("batch-daily/"),
  ]);
  const snapshotDates = snapshots
    .map(({ key }) => key.match(/init_(\d{4}-\d{2}-\d{2})_\d+\.json\.gz$/)?.[1])
    .filter(Boolean)
    .sort();
  const snapshotDate = snapshotDates.at(-1);
  if (!snapshotDate) fail("Verejné úložisko RPO neobsahuje inicializačnú dávku.");

  const snapshot = snapshots
    .filter(({ key }) => key.includes(`init_${snapshotDate}_`) && key.endsWith(".json.gz"))
    .sort((left, right) => left.key.localeCompare(right.key));
  const daily = dailyFiles
    .filter(({ key }) => {
      const date = key.match(/actual_(\d{4}-\d{2}-\d{2})\.json\.gz$/)?.[1];
      return key.endsWith(".json.gz") && date && date > snapshotDate;
    })
    .sort((left, right) => left.key.localeCompare(right.key));
  const files = dailyOnly ? daily : [...snapshot, ...daily];
  const totalSize = files.reduce((sum, file) => sum + file.size, 0);

  console.log(
    dailyOnly
      ? `Pokračujem dennými zmenami pre snapshot ${snapshotDate}: ${daily.length} súborov.`
      : `Register RPO: snapshot ${snapshotDate}, ${snapshot.length} častí, ${daily.length} denných zmien.`,
  );
  console.log(`Prenos približne ${(totalSize / 1024 / 1024).toFixed(1)} MB.`);

  const database = new DatabaseSync(buildingPath);
  let totalRecords = 0;
  let registryRecords = 0;
  try {
    if (dailyOnly) {
      const existingRecords = database.prepare("SELECT count(*) AS count FROM subjects").get();
      totalRecords = Number(existingRecords.count);
      if (!Number.isSafeInteger(totalRecords) || totalRecords < 2_000_000) {
        fail("Databáza na pokračovanie neobsahuje celý RPO snapshot.");
      }
    } else {
      database.exec(`
        PRAGMA journal_mode = DELETE;
        PRAGMA synchronous = NORMAL;
        PRAGMA temp_store = MEMORY;
        PRAGMA cache_size = -131072;
        ${schema}
      `);
    }
    const statement = database.prepare(upsert);

    for (let index = 0; index < files.length; index++) {
      const file = files[index];
      const localPath = await downloadObject(file, index + 1, files.length);
      totalRecords += await importFile(database, statement, localPath, file.key, index + 1, files.length);
    }

    registryRecords = Number(database.prepare("SELECT count(*) AS count FROM subjects").get().count);
    console.log(`Vytváram fulltextový index pre ${registryRecords.toLocaleString("sk-SK")} záznamov...`);
    addSearchIndex(database);
  } finally {
    database.close();
  }

  if (existsSync(databasePath)) renameSync(databasePath, previousPath);
  try {
    renameSync(buildingPath, databasePath);
    rmSync(previousPath, { force: true });
  } catch (error) {
    if (existsSync(previousPath) && !existsSync(databasePath)) renameSync(previousPath, databasePath);
    throw error;
  }

  rmSync(downloadDirectory, { recursive: true, force: true });
  console.log(
    `Hotovo: ${statSync(databasePath).size.toLocaleString("sk-SK")} bajtov v ${databasePath}`,
  );
  console.log(`Záznamov v registri: ${registryRecords.toLocaleString("sk-SK")}`);
}

main().catch((error) => {
  console.error("Import RPO zlyhal:", error);
  process.exitCode = 1;
});
