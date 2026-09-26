"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type SearchResult = {
  slug: string;
  name: string;
  city: string;
  industry: string;
  legalForm: string;
  ico: string;
  category: string;
  shortDescription: string;
};

const defaultResults: SearchResult[] = [];

export function SearchPanel() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState("vsetko");
  const [results, setResults] = useState<SearchResult[]>(defaultResults);
  const [loading, setLoading] = useState(false);

  const runSearch = async (nextQuery = query, nextCategory = category) => {
    setLoading(true);

    try {
      const url = new URL("/api/search", window.location.origin);
      url.searchParams.set("query", nextQuery.trim());
      url.searchParams.set("category", nextCategory);

      const response = await fetch(url.toString());
      const data = (await response.json()) as { results: SearchResult[] };
      setResults(data.results ?? []);
    } catch (error) {
      console.error("Search failed", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void runSearch("", "vsetko");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    await runSearch();
  };

  return (
    <div className="search-panel-wrap">
      <form className="search-shell" onSubmit={handleSubmit} aria-label="Vyhľadávanie">
        <div className="search-field">
          <span>Hľadám</span>
          <input
            aria-label="Vyhľadávanie"
            placeholder="Názov firmy, IČO, odvetvie"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
        </div>
        <div className="search-field search-select">
          <span>Kategória</span>
          <select value={category} onChange={(event) => setCategory(event.target.value)}>
            <option value="vsetko">Všetko</option>
            <option value="firmy">Firmy</option>
            <option value="urady">Úrady</option>
            <option value="korporacie">Korporácie</option>
            <option value="dávky">Dávky</option>
          </select>
        </div>
        <button type="submit" className="primary-btn search-btn" disabled={loading}>
          {loading ? "Hľadám..." : "Vyhľadať"}
        </button>
      </form>

      <div className="search-results" aria-live="polite">
        {results.length > 0 ? (
          results.map((item) => (
            <Link key={item.slug} href={`/firmy/${item.slug}`} className="search-result-item">
              <div className="search-result-top">
                <span className="company-badge">{item.industry}</span>
                <span className="company-city">{item.city}</span>
              </div>
              <h3>{item.name}</h3>
              <p>{item.shortDescription}</p>
              <div className="company-meta">
                <span>{item.legalForm}</span>
                <span>IČO {item.ico}</span>
              </div>
            </Link>
          ))
        ) : (
          <div className="empty-state">
            <strong>Žiadne výsledky</strong>
            <span>Skúste hľadať podľa názvu, IČO alebo odvetvia.</span>
          </div>
        )}
      </div>
    </div>
  );
}
