import type { NewsArticleInput } from "./editorial-news";

const importableDomains = [
  "predpovedpocasia.sk",
  "hnonline.sk",
  "teraz.sk",
];

const maximumHtmlBytes = 1_000_000;

export class ArticleImportError extends Error {}

function allowedHost(hostname: string): boolean {
  const normalized = hostname.toLowerCase();
  return importableDomains.some(
    (domain) => normalized === domain || normalized.endsWith(`.${domain}`),
  );
}

function decodeHtml(value: string): string {
  return value
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) => {
      const point = Number.parseInt(code, 16);
      return point <= 0x10ffff ? String.fromCodePoint(point) : " ";
    })
    .replace(/&#(\d+);/g, (_, code: string) => {
      const point = Number.parseInt(code, 10);
      return point <= 0x10ffff ? String.fromCodePoint(point) : " ";
    })
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'");
}

function tagAttributes(tag: string): Map<string, string> {
  const attributes = new Map<string, string>();
  const expression = /([a-z_:][\w:.-]*)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/gi;
  for (const match of tag.matchAll(expression)) {
    attributes.set(
      match[1].toLowerCase(),
      decodeHtml(match[2] ?? match[3] ?? match[4] ?? ""),
    );
  }
  return attributes;
}

function metadata(html: string): Map<string, string> {
  const values = new Map<string, string>();
  const tags = html.matchAll(/<meta\b[^>]*>/gi);
  for (const [tag] of tags) {
    const attributes = tagAttributes(tag);
    const key = attributes.get("property") ?? attributes.get("name");
    const content = attributes.get("content");
    if (key && content && !values.has(key.toLowerCase())) {
      values.set(key.toLowerCase(), content.trim());
    }
  }
  return values;
}

function secureUrl(value: string | undefined, baseUrl: URL): string | null {
  if (!value) return null;
  try {
    const url = new URL(value, baseUrl);
    return url.protocol === "https:" && !url.username && !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}

function titleFromSlug(url: URL): string {
  const encodedSlug = url.pathname.split("/").filter(Boolean).at(-1) ?? "";
  let slug = encodedSlug;
  try {
    slug = decodeURIComponent(encodedSlug);
  } catch {
    slug = encodedSlug;
  }
  return slug.replace(/[-_]+/g, " ").replace(/\s+/g, " ").trim();
}

export async function importArticleMetadata(value: unknown): Promise<NewsArticleInput> {
  if (typeof value !== "string" || value.length > 2048) {
    throw new ArticleImportError("Zadajte odkaz s maximálne 2 048 znakmi.");
  }

  let url: URL;
  try {
    url = new URL(value);
  } catch {
    throw new ArticleImportError("Zadaný odkaz nie je platná URL adresa.");
  }
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.port ||
    !allowedHost(url.hostname)
  ) {
    throw new ArticleImportError("Import je povolený len z HTTPS webov HN, Teraz.sk a Predpovede počasia.");
  }

  const response = await fetch(url, {
    cache: "no-store",
    headers: { "User-Agent": "Q4.sk/1.0 (article metadata importer)" },
    redirect: "manual",
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(
      response.status >= 300 && response.status < 400
        ? "Web presmeroval požiadavku. Zadajte cieľový odkaz priamo."
        : `Stránka vrátila HTTP ${response.status}.`,
    );
  }
  if (!response.headers.get("content-type")?.toLowerCase().includes("text/html")) {
    throw new ArticleImportError("Z odkazu sa nepodarilo načítať HTML článku.");
  }
  const contentLength = Number(response.headers.get("content-length"));
  if (Number.isFinite(contentLength) && contentLength > maximumHtmlBytes) {
    throw new ArticleImportError("Stránka je príliš veľká na import metadát.");
  }

  const html = await response.text();
  if (new TextEncoder().encode(html).byteLength > maximumHtmlBytes) {
    throw new ArticleImportError("Stránka je príliš veľká na import metadát.");
  }

  const tags = metadata(html);
  const rawTitle =
    tags.get("og:title") ??
    tags.get("twitter:title") ??
    html.match(/<title\b[^>]*>([\s\S]*?)<\/title>/i)?.[1] ??
    "";
  const cleanedTitle = decodeHtml(rawTitle).replace(/<[^>]*>/g, "").trim();
  const genericTitle = /^(blog article|article|post)(?:\s|\||$)/i.test(cleanedTitle);
  const title = (genericTitle ? titleFromSlug(url) : cleanedTitle).slice(0, 240);
  const rawSummary = tags.get("og:description") ?? tags.get("description") ?? "";
  const genericSummary = /^(blog article|article|post)\s+(on|from)\b/i.test(rawSummary);
  const summary = (genericSummary ? "" : decodeHtml(rawSummary).replace(/<[^>]*>/g, "").trim())
    .replace(/\s+/g, " ")
    .slice(0, 1000);
  const rawPublishedAt = tags.get("article:published_time");
  const publishedAtDate = rawPublishedAt ? new Date(rawPublishedAt) : null;
  const publisher =
    tags.get("og:site_name") ??
    (url.hostname.toLowerCase().includes("predpovedpocasia")
      ? "Predpoveď počasia"
      : url.hostname.replace(/^www\./i, ""));

  if (!title) {
    throw new ArticleImportError("V metadátach stránky sa nenašiel nadpis článku.");
  }

  return {
    title,
    link: url.toString(),
    publisher: publisher.slice(0, 120),
    summary,
    imageUrl: secureUrl(tags.get("og:image") ?? tags.get("twitter:image"), url),
    publishedAt:
      publishedAtDate && !Number.isNaN(publishedAtDate.getTime())
        ? publishedAtDate.toISOString()
        : null,
  };
}
