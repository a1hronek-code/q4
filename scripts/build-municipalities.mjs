// Precomputes a municipality ("obec") directory from the local RPO SQLite
// database: for each municipality we store the real company counts (total +
// active) and a short list of the most recently established active
// companies, so production (which never has data/rpo.sqlite deployed) can
// show real, verifiable data instead of inventing anything.
//
// Run locally with `node scripts/build-municipalities.mjs` whenever
// data/rpo.sqlite is refreshed.

import { writeFileSync, mkdirSync } from "node:fs";
import { DatabaseSync } from "node:sqlite";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const databasePath = resolve(join("data", "rpo.sqlite"));
const outputPath = resolve(__dirname, "..", "app", "data", "municipalities.json");

// Only keep municipalities with a meaningful number of registered subjects,
// to keep the committed JSON small and the pages useful (no near-empty
// listings). This still covers every sizeable Slovak town/city recorded in
// the register.
const MIN_COMPANIES = 25;
const MAX_RECENT_PER_MUNICIPALITY = 8;

function slugify(value) {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

function main() {
  // Opened writable (not readOnly) so we can add a local-only index that
  // makes the per-city aggregation queries below fast. The index only
  // speeds up this local/offline build step; data/rpo.sqlite itself is
  // gitignored and never deployed.
  const db = new DatabaseSync(databasePath);
  db.exec(
    "CREATE INDEX IF NOT EXISTS idx_subjects_city_termination_establishment " +
      "ON subjects(city, termination, establishment DESC)",
  );

  // `termination` is stored as an empty string (not NULL) for subjects that
  // are still active, so both checks below must compare against ''.
  const cityRows = db
    .prepare(
      `SELECT city,
              COUNT(*) AS total,
              SUM(CASE WHEN termination = '' THEN 1 ELSE 0 END) AS active
         FROM subjects
        WHERE city IS NOT NULL AND city != ''
        GROUP BY city
       HAVING COUNT(*) >= ?
        ORDER BY total DESC`,
    )
    .all(MIN_COMPANIES);

  const recentStmt = db.prepare(
    `SELECT id, name, ico, establishment
       FROM subjects
      WHERE city = ? AND termination = '' AND establishment IS NOT NULL AND establishment != ''
      ORDER BY establishment DESC
      LIMIT ?`,
  );

  const slugCounts = new Map();
  const municipalities = cityRows.map((row) => {
    let slug = slugify(row.city);
    const seen = slugCounts.get(slug) ?? 0;
    slugCounts.set(slug, seen + 1);
    if (seen > 0) slug = `${slug}-${seen + 1}`;

    const recent = recentStmt.all(row.city, MAX_RECENT_PER_MUNICIPALITY).map((subject) => ({
      id: subject.id,
      name: subject.name,
      ico: subject.ico,
      establishment: subject.establishment,
    }));

    return {
      name: row.city,
      slug,
      totalCompanies: row.total,
      activeCompanies: row.active,
      recentCompanies: recent,
    };
  });

  mkdirSync(dirname(outputPath), { recursive: true });
  writeFileSync(outputPath, JSON.stringify(municipalities), "utf8");
  console.log(`Wrote ${municipalities.length} municipalities to ${outputPath}`);
}

main();
