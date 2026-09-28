"use client";

import { useState, type FormEvent } from "react";
import type { StoredNewsArticle } from "@/app/lib/news";

type ArticleForm = {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string;
  summary: string;
  imageUrl: string;
};

type ImportArticle = {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string | null;
  summary: string;
  imageUrl: string | null;
};

type ApiResult<T> = {
  article?: T;
  error?: string;
};

const emptyForm: ArticleForm = {
  title: "",
  link: "",
  publisher: "",
  publishedAt: "",
  summary: "",
  imageUrl: "",
};

function formFromArticle(article: StoredNewsArticle): ArticleForm {
  return {
    title: article.title,
    link: article.link,
    publisher: article.publisher,
    publishedAt: article.publishedAt?.slice(0, 10) ?? "",
    summary: article.summary,
    imageUrl: article.imageUrl ?? "",
  };
}

async function readApiResult<T>(response: Response): Promise<ApiResult<T>> {
  let result: ApiResult<T>;
  try {
    result = await response.json() as ApiResult<T>;
  } catch {
    throw new Error("Server vrátil nečitateľnú odpoveď.");
  }
  if (!response.ok) {
    throw new Error(result.error || `Požiadavka zlyhala (HTTP ${response.status}).`);
  }
  return result;
}

export function AdminArticleManager({
  initialArticles,
  databaseReady,
}: {
  initialArticles: StoredNewsArticle[];
  databaseReady: boolean;
}) {
  const [articles, setArticles] = useState(initialArticles);
  const [form, setForm] = useState<ArticleForm>(emptyForm);
  const [editingId, setEditingId] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateField(field: keyof ArticleForm, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  function resetForm() {
    setEditingId("");
    setForm(emptyForm);
  }

  async function importFromUrl() {
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/articles/import", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: form.link }),
      });
      const result = await readApiResult<ImportArticle>(response);
      const imported = result.article;
      if (!imported) throw new Error("Metadáta článku v odpovedi chýbajú.");
      setForm({
        title: imported.title,
        link: imported.link,
        publisher: imported.publisher,
        publishedAt: imported.publishedAt?.slice(0, 10) ?? "",
        summary: imported.summary,
        imageUrl: imported.imageUrl ?? "",
      });
      setMessage("Metadáta načítané. Pred uložením môžete upraviť nadpis a perex.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Import článku sa nepodaril.");
    } finally {
      setBusy(false);
    }
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/articles", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, id: editingId }),
      });
      const result = await readApiResult<StoredNewsArticle>(response);
      const savedArticle = result.article;
      if (!savedArticle) throw new Error("Uložený článok v odpovedi chýba.");
      setArticles((current) => [
        savedArticle,
        ...current.filter((article) =>
          article.id !== savedArticle.id && article.link !== savedArticle.link,
        ),
      ]);
      resetForm();
      setMessage("Článok bol uložený a je zobrazený v bloku správ.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Článok sa nepodarilo uložiť.");
    } finally {
      setBusy(false);
    }
  }

  async function setVisibility(article: StoredNewsArticle) {
    const isVisible = !article.isVisible;
    if (!isVisible && !window.confirm(`Skryť článok „${article.title}“ z webu?`)) return;
    setBusy(true);
    setError("");
    setMessage("");
    try {
      const response = await fetch("/api/admin/articles", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: article.id, isVisible }),
      });
      const result = await readApiResult<StoredNewsArticle>(response);
      const updatedArticle = result.article;
      if (!updatedArticle) throw new Error("Aktualizovaný článok v odpovedi chýba.");
      setArticles((current) =>
        current.map((item) => item.id === updatedArticle.id ? updatedArticle : item),
      );
      setMessage(isVisible ? "Článok je opäť zverejnený." : "Článok bol skrytý z webu.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Stav článku sa nepodarilo zmeniť.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="admin-content">
      <section className="admin-panel" aria-labelledby="article-editor-title">
        <div className="admin-section-heading">
          <div>
            <span className="eyebrow">Editor</span>
            <h2 id="article-editor-title">{editingId ? "Upraviť článok" : "Pridať článok"}</h2>
          </div>
          {editingId ? (
            <button className="admin-button" type="button" onClick={resetForm}>Zrušiť úpravy</button>
          ) : null}
        </div>
        <form className="admin-article-form" onSubmit={save}>
          <div className="admin-url-field">
            <label htmlFor="article-link">Odkaz na článok</label>
            <div>
              <input
                id="article-link"
                type="url"
                required
                maxLength={2048}
                value={form.link}
                onChange={(event) => updateField("link", event.target.value)}
                placeholder="https://..."
                disabled={!databaseReady || busy}
              />
              <button
                className="admin-button"
                type="button"
                onClick={() => void importFromUrl()}
                disabled={!databaseReady || busy || !form.link.trim()}
              >
                Načítať z odkazu
              </button>
            </div>
            <small>Automatický import metadát je povolený pre HN, Teraz.sk a Predpoveď počasia.</small>
          </div>
          <label>
            Nadpis
            <input
              type="text"
              required
              maxLength={240}
              value={form.title}
              onChange={(event) => updateField("title", event.target.value)}
              disabled={!databaseReady || busy}
            />
          </label>
          <label>
            Zdroj
            <input
              type="text"
              required
              maxLength={120}
              value={form.publisher}
              onChange={(event) => updateField("publisher", event.target.value)}
              placeholder="Názov vydavateľa"
              disabled={!databaseReady || busy}
            />
          </label>
          <label>
            Dátum článku (voliteľný)
            <input
              type="date"
              value={form.publishedAt}
              onChange={(event) => updateField("publishedAt", event.target.value)}
              disabled={!databaseReady || busy}
            />
          </label>
          <label className="admin-form-wide">
            Perex
            <textarea
              maxLength={1000}
              rows={4}
              value={form.summary}
              onChange={(event) => updateField("summary", event.target.value)}
              placeholder="Krátky vlastný opis; celý článok zostáva na pôvodnom webe."
              disabled={!databaseReady || busy}
            />
          </label>
          <label className="admin-form-wide">
            URL obrázka (voliteľné)
            <input
              type="url"
              maxLength={2048}
              value={form.imageUrl}
              onChange={(event) => updateField("imageUrl", event.target.value)}
              placeholder="https://..."
              disabled={!databaseReady || busy}
            />
          </label>
          <div className="admin-form-actions admin-form-wide">
            <button
              className="admin-button admin-button-primary"
              type="submit"
              disabled={!databaseReady || busy}
            >
              {busy ? "Ukladám…" : editingId ? "Uložiť zmeny" : "Pridať článok"}
            </button>
          </div>
        </form>
        {error ? <p className="admin-alert" role="alert">{error}</p> : null}
        {message ? <p className="admin-success" role="status">{message}</p> : null}
      </section>

      <section className="admin-panel" aria-labelledby="article-list-title">
        <div className="admin-section-heading">
          <div>
            <span className="eyebrow">Knižnica</span>
            <h2 id="article-list-title">Články ({articles.length})</h2>
          </div>
        </div>
        {articles.length === 0 ? (
          <p className="admin-empty">Zatiaľ tu nie sú uložené žiadne články.</p>
        ) : (
          <ul className="admin-article-list">
            {articles.map((article) => (
              <li className={article.isVisible ? "" : "is-archived"} key={article.id}>
                <div className="admin-article-details">
                  <div className="admin-article-title-row">
                    <h3>{article.title}</h3>
                    <span className={article.isVisible ? "admin-status is-published" : "admin-status"}>
                      {article.isVisible ? "Zverejnený" : "Skrytý"}
                    </span>
                  </div>
                  <p>{article.publisher}{article.isSeed ? " · úvodný článok" : ""}</p>
                  {article.summary ? <p>{article.summary}</p> : null}
                  <a href={article.link} target="_blank" rel="noreferrer">Otvoriť pôvodný článok ↗</a>
                </div>
                <div className="admin-article-actions">
                  <button
                    className="admin-button"
                    type="button"
                    onClick={() => {
                      setEditingId(article.id);
                      setForm(formFromArticle(article));
                      setError("");
                      setMessage("");
                    }}
                    disabled={!databaseReady || busy}
                  >
                    Upraviť
                  </button>
                  <button
                    className="admin-button"
                    type="button"
                    onClick={() => void setVisibility(article)}
                    disabled={!databaseReady || busy}
                  >
                    {article.isVisible ? "Skryť" : "Zverejniť"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
