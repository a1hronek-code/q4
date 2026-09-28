"use client";

import { useEffect, useState } from "react";
import type { NewsArticle } from "@/app/lib/news";

export function NewsCard() {
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const timer = window.setTimeout(() => {
      void fetch("/api/news")
        .then(async (response) => {
          const result = await response.json() as {
            articles?: NewsArticle[];
            error?: string;
          };
          if (!response.ok) throw new Error(result.error || `HTTP ${response.status}`);
          setArticles(result.articles ?? []);
        })
        .catch((cause: unknown) => {
          console.error("News request failed", cause);
          setError("Správy sa momentálne nepodarilo načítať.");
        })
        .finally(() => setLoading(false));
    }, 0);

    return () => window.clearTimeout(timer);
  }, []);

  return (
    <article className="market-card news-card">
      <div className="market-card-heading">
        <span className="market-icon">✦</span>
        <div>
          <h3>Správy a články</h3>
          <span>Ekonomika a podnikanie na Slovensku</span>
        </div>
        <a className="news-admin-link" href="/admin/clanky">Spravovať</a>
      </div>
      {loading ? (
        <p className="market-loading">Načítavam správy…</p>
      ) : error ? (
        <p className="market-error" role="alert">{error}</p>
      ) : articles.length === 0 ? (
        <p className="market-loading" role="status">Momentálne nie sú dostupné žiadne správy.</p>
      ) : (
        <ul className="news-list">
          {articles.slice(0, 5).map((article) => (
            <li key={article.link}>
              <a href={article.link} target="_blank" rel="noreferrer">
                {article.imageUrl ? (
                  <span
                    className="news-image"
                    role="img"
                    aria-label={`Ilustračná fotografia: ${article.title}`}
                    style={{ backgroundImage: `url("${article.imageUrl}")` }}
                  />
                ) : null}
                <span className="news-copy">
                  <strong>{article.title}</strong>
                  <small>
                    {article.publisher}
                    {article.publishedAt
                      ? ` · ${new Intl.DateTimeFormat("sk-SK", {
                        day: "numeric",
                        month: "short",
                      }).format(new Date(article.publishedAt))}`
                      : ""}
                  </small>
                  {article.summary ? <span>{article.summary}</span> : null}
                </span>
              </a>
            </li>
          ))}
        </ul>
      )}
      <p className="market-source">
        Stručné ukážky z RSS feedov; celé články čítajte u{" "}
        <a href="https://hnonline.sk/" target="_blank" rel="noreferrer">Hospodárskych novín</a>
        {" "}a na <a href="https://www.teraz.sk/" target="_blank" rel="noreferrer">Teraz.sk</a>.
      </p>
    </article>
  );
}
