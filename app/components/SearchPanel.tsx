"use client";

import Link from "next/link";
import { type FormEvent, useState } from "react";

type SearchResult = {
  id: number;
  name: string;
  city: string;
  industry: string;
  legalForm: string;
  ico: string;
  shortDescription: string;
};

type SearchResponse = {
  results?: SearchResult[];
  error?: string;
};

function getOfficialSearchUrl(query: string, category: string): string {
  const url = new URL("https://rpo.statistics.sk/new/organization");
  url.searchParams.set("showOrganizationUnit", "true");
  url.searchParams.set("showHistorical", category !== "aktivne" ? "true" : "false");
  url.searchParams.set("fullTextSearch", "true");
  url.searchParams.set(/^\d+$/.test(query) ? "organizationIdentifier" : "organizationFullName", query);
  return url.toString();
}

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("vsetko");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);

  async function runSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const trimmedQuery = query.trim();

    if (!trimmedQuery) {
      setError("Zadajte názov subjektu alebo IČO.");
      setResults([]);
      setHasSearched(false);
      return;
    }

    setLoading(true);
    setError("");
    setHasSearched(true);

    try {
      const url = new URL("/api/search", window.location.origin);
      url.searchParams.set("query", trimmedQuery);
      url.searchParams.set("category", category);

      const response = await fetch(url);
      const data = (await response.json()) as SearchResponse;

      if (!response.ok) {
        throw new Error(data.error || "Vyhľadávanie sa nepodarilo.");
      }

      setResults(data.results ?? []);
    } catch (searchError) {
      setError(
        searchError instanceof Error
          ? searchError.message
          : "Vyhľadávanie sa nepodarilo. Skúste to znova.",
      );
      setResults([]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="search-panel-wrap" id="vyhladavanie">
      <form
        className="search-shell"
        onSubmit={runSearch}
        aria-label="Vyhľadávanie v registri RPO"
      >
        <div className="search-field">
          <label htmlFor="rpo-search">Hľadať subjekt</label>
          <input
            id="rpo-search"
            aria-label="Názov spoločnosti alebo IČO"
            placeholder="Názov spoločnosti alebo IČO"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            autoComplete="organization"
          />
        </div>
        <div className="search-field search-select">
          <label htmlFor="rpo-status">Stav subjektu</label>
          <select
            id="rpo-status"
            value={category}
            onChange={(event) => setCategory(event.target.value)}
          >
            <option value="vsetko">Všetky záznamy</option>
            <option value="aktivne">Len aktívne</option>
          </select>
        </div>
        <button type="submit" className="primary-btn search-btn" disabled={loading}>
          {loading ? "Hľadám..." : "Vyhľadať"}
        </button>
      </form>

      <div className="search-results" aria-live="polite" aria-busy={loading}>
        {error ? (
          <div className="empty-state search-error" role="alert">
            <strong>Vyhľadávanie nie je dostupné</strong>
            <span>{error}</span>
            <a
              className="source-link"
              href={getOfficialSearchUrl(query.trim(), category)}
              target="_blank"
              rel="noreferrer"
            >
              Zobraziť hľadanie na oficiálnom portáli RPO
            </a>
          </div>
        ) : results.length > 0 ? (
          results.map((item) => (
            <Link key={item.id} href={`/firmy/${item.id}`} className="search-result-item">
              <div className="search-result-top">
                <span className="company-badge">{item.legalForm || "Subjekt RPO"}</span>
                <span className="company-city">{item.city || "Sídlo neuvedené"}</span>
              </div>
              <h3>{item.name}</h3>
              <p>{item.industry || item.shortDescription}</p>
              <div className="company-meta">
                <span>{item.shortDescription}</span>
                <span>{item.ico ? `IČO ${item.ico}` : `ID ${item.id}`}</span>
              </div>
            </Link>
          ))
        ) : hasSearched ? (
          <div className="empty-state">
            <strong>Nenašli sa žiadne záznamy</strong>
            <span>Skontrolujte názov alebo IČO a skúste hľadať znova.</span>
          </div>
        ) : null}
      </div>

      <p className="data-attribution">
        Údaje: Register právnických osôb MV SR ·{" "}
        <a href="https://creativecommons.org/licenses/by/4.0/" target="_blank" rel="noreferrer">
          CC BY 4.0
        </a>
      </p>
    </div>
  );
}
