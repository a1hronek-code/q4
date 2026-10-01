"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

export type MunicipalityListItem = {
  name: string;
  slug: string;
  totalCompanies: number;
};

function normalize(value: string): string {
  return value
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();
}

/** Client-side filterable list of municipalities. Data stays fully static and
 * precomputed (see scripts/build-municipalities.mjs); this component only
 * narrows what's shown, it never fetches anything. */
export function MunicipalityFinder({ municipalities }: { municipalities: MunicipalityListItem[] }) {
  const [query, setQuery] = useState("");

  const results = useMemo(() => {
    const needle = normalize(query.trim());
    const filtered = needle
      ? municipalities.filter((item) => normalize(item.name).includes(needle))
      : municipalities;
    return filtered.slice(0, 60);
  }, [municipalities, query]);

  return (
    <div className="municipality-finder">
      <label className="municipality-finder-label" htmlFor="obec-search">
        Hľadať obec alebo mesto
      </label>
      <input
        id="obec-search"
        type="search"
        className="municipality-finder-input"
        placeholder="Napríklad Trnava, Košice, Senec…"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        autoComplete="off"
      />
      <p className="municipality-finder-hint">
        {query.trim()
          ? `Zobrazených ${results.length} z ${municipalities.length} obcí.`
          : `Najväčších ${results.length} z ${municipalities.length} obcí podľa počtu registrovaných subjektov.`}
      </p>
      <ul className="municipality-finder-list">
        {results.map((item) => (
          <li key={item.slug}>
            <Link href={`/obce/${item.slug}`}>
              <span>{item.name}</span>
              <small>{item.totalCompanies.toLocaleString("sk-SK")} subjektov</small>
            </Link>
          </li>
        ))}
        {results.length === 0 ? <li className="municipality-finder-empty">Žiadna obec sa nenašla.</li> : null}
      </ul>
    </div>
  );
}
