import type { NewsArticleInput } from "./editorial-news";

function safeHttpsUrl(value: string, optional: boolean): string | null | undefined {
  const trimmed = value.trim();
  if (!trimmed && optional) return null;
  try {
    const url = new URL(trimmed);
    if (url.protocol !== "https:" || url.username || url.password) return undefined;
    return url.toString();
  } catch {
    return undefined;
  }
}

export function validateArticleInput(
  value: unknown,
): { input: NewsArticleInput } | { error: string } {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return { error: "Údaje článku majú nesprávny formát." };
  }
  const body = value as Record<string, unknown>;
  const title = typeof body.title === "string" ? body.title.trim() : "";
  const publisher = typeof body.publisher === "string" ? body.publisher.trim() : "";
  const summary = typeof body.summary === "string" ? body.summary.trim() : "";
  const rawLink = typeof body.link === "string" ? body.link : "";
  const rawImage = typeof body.imageUrl === "string" ? body.imageUrl : "";
  const rawDate = typeof body.publishedAt === "string" ? body.publishedAt.trim() : "";
  const link = safeHttpsUrl(rawLink, false);
  const imageUrl = safeHttpsUrl(rawImage, true);
  const publishedAt = rawDate ? new Date(rawDate) : null;

  if (!title || title.length > 240) {
    return { error: "Nadpis musí mať 1 až 240 znakov." };
  }
  if (!link) {
    return { error: "Odkaz na článok musí byť platná adresa HTTPS." };
  }
  if (!publisher || publisher.length > 120) {
    return { error: "Zdroj musí mať 1 až 120 znakov." };
  }
  if (summary.length > 1000) {
    return { error: "Perex môže mať najviac 1 000 znakov." };
  }
  if (imageUrl === undefined) {
    return { error: "Obrázok musí byť platná adresa HTTPS." };
  }
  if (rawDate && (!publishedAt || Number.isNaN(publishedAt.getTime()))) {
    return { error: "Dátum publikovania nie je platný." };
  }

  return {
    input: {
      title,
      link,
      publisher,
      summary,
      imageUrl,
      publishedAt: publishedAt?.toISOString() ?? null,
    },
  };
}
