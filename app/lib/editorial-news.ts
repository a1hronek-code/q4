import { neon, type NeonQueryFunction } from "@neondatabase/serverless";
import { seedArticles, type StoredNewsArticle } from "./news";

type NewsSql = NeonQueryFunction<false, false>;
type NewsRow = Record<string, unknown>;

let schemaPromise: Promise<void> | undefined;

function mapArticle(row: NewsRow): StoredNewsArticle {
  const publishedAt = row.published_at;
  const imageUrl = row.image_url;

  return {
    id: String(row.id),
    title: String(row.title),
    link: String(row.link),
    publisher: String(row.publisher),
    publishedAt: typeof publishedAt === "string" ? publishedAt : null,
    summary: String(row.summary ?? ""),
    ...(typeof imageUrl === "string" && imageUrl ? { imageUrl } : {}),
    isVisible: row.is_visible === true,
    isSeed: row.is_seed === true,
  };
}

async function ensureSchema(sql: NewsSql): Promise<void> {
  if (!schemaPromise) {
    schemaPromise = (async () => {
      const createTable = sql`
        CREATE TABLE IF NOT EXISTS q4_news_articles (
          id TEXT PRIMARY KEY,
          title TEXT NOT NULL,
          link TEXT NOT NULL UNIQUE,
          publisher TEXT NOT NULL,
          published_at TEXT,
          summary TEXT NOT NULL DEFAULT '',
          image_url TEXT,
          is_visible BOOLEAN NOT NULL DEFAULT TRUE,
          is_seed BOOLEAN NOT NULL DEFAULT FALSE,
          created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )
      `;
      const insertSeeds = seedArticles.map((article) => sql`
        INSERT INTO q4_news_articles (
          id, title, link, publisher, published_at, summary, image_url, is_seed
        )
        VALUES (
          ${article.id}, ${article.title}, ${article.link}, ${article.publisher},
          ${article.publishedAt}, ${article.summary}, ${article.imageUrl ?? null}, TRUE
        )
        ON CONFLICT (id) DO NOTHING
      `);
      await sql.transaction([createTable, ...insertSeeds]);
    })();
  }

  try {
    await schemaPromise;
  } catch (error) {
    schemaPromise = undefined;
    throw error;
  }
}

async function database(): Promise<NewsSql> {
  const connectionString = process.env.DATABASE_URL;
  if (!connectionString) {
    throw new Error("DATABASE_URL is not configured");
  }
  const sql = neon(connectionString);
  await ensureSchema(sql);
  return sql;
}

export async function listAdminArticles(): Promise<StoredNewsArticle[]> {
  const sql = await database();
  const rows = await sql`
    SELECT id, title, link, publisher, published_at, summary, image_url,
           is_visible, is_seed
    FROM q4_news_articles
    ORDER BY created_at DESC
  `;
  return rows.map(mapArticle);
}

export async function listPublishedArticles(): Promise<StoredNewsArticle[]> {
  const sql = await database();
  const rows = await sql`
    SELECT id, title, link, publisher, published_at, summary, image_url,
           is_visible, is_seed
    FROM q4_news_articles
    WHERE is_visible = TRUE
    ORDER BY created_at DESC
  `;
  return rows.map(mapArticle);
}

export type NewsArticleInput = {
  title: string;
  link: string;
  publisher: string;
  publishedAt: string | null;
  summary: string;
  imageUrl: string | null;
};

export async function saveArticle(
  input: NewsArticleInput,
): Promise<StoredNewsArticle> {
  const sql = await database();
  const rows = await sql`
    INSERT INTO q4_news_articles (
      id, title, link, publisher, published_at, summary, image_url, is_visible
    )
    VALUES (
      ${crypto.randomUUID()}, ${input.title}, ${input.link}, ${input.publisher},
      ${input.publishedAt}, ${input.summary}, ${input.imageUrl}, TRUE
    )
    ON CONFLICT (link) DO UPDATE SET
      title = EXCLUDED.title,
      publisher = EXCLUDED.publisher,
      published_at = EXCLUDED.published_at,
      summary = EXCLUDED.summary,
      image_url = EXCLUDED.image_url,
      is_visible = TRUE
    RETURNING id, title, link, publisher, published_at, summary, image_url,
              is_visible, is_seed
  `;
  const row = rows[0];
  if (!row) throw new Error("Saved article was not returned by the database");
  return mapArticle(row);
}

export async function updateArticle(
  id: string,
  input: NewsArticleInput,
): Promise<StoredNewsArticle | null> {
  const sql = await database();
  const rows = await sql`
    UPDATE q4_news_articles SET
      title = ${input.title},
      link = ${input.link},
      publisher = ${input.publisher},
      published_at = ${input.publishedAt},
      summary = ${input.summary},
      image_url = ${input.imageUrl},
      is_visible = TRUE
    WHERE id = ${id}
    RETURNING id, title, link, publisher, published_at, summary, image_url,
              is_visible, is_seed
  `;
  return rows[0] ? mapArticle(rows[0]) : null;
}

export async function setArticleVisibility(
  id: string,
  isVisible: boolean,
): Promise<StoredNewsArticle | null> {
  const sql = await database();
  const rows = await sql`
    UPDATE q4_news_articles
    SET is_visible = ${isVisible}
    WHERE id = ${id}
    RETURNING id, title, link, publisher, published_at, summary, image_url,
              is_visible, is_seed
  `;
  return rows[0] ? mapArticle(rows[0]) : null;
}
