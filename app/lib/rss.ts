import type { NewsArticle } from "./news";

function decodeXml(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, "$1")
    .replace(/&#x([0-9a-f]+);/gi, (_, code: string) =>
      decodeCodePoint(Number.parseInt(code, 16)),
    )
    .replace(/&#(\d+);/g, (_, code: string) =>
      decodeCodePoint(Number.parseInt(code, 10)),
    )
    .replace(/&nbsp;/gi, " ")
    .replace(/&amp;/gi, "&")
    .replace(/&lt;/gi, "<")
    .replace(/&gt;/gi, ">")
    .replace(/&quot;/gi, '"')
    .replace(/&apos;|&#39;/gi, "'");
}

function decodeCodePoint(value: number): string {
  return Number.isInteger(value) && value >= 0 && value <= 0x10ffff
    ? String.fromCodePoint(value)
    : " ";
}

function plainText(value: string): string {
  return decodeXml(value)
    .replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, " ")
    .replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, " ")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function tagContent(xml: string, tag: string): string {
  const escapedTag = tag.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = xml.match(
    new RegExp(`<(?:(?:[\\w.-]+):)?${escapedTag}\\b[^>]*>([\\s\\S]*?)<\\/(?:(?:[\\w.-]+):)?${escapedTag}\\s*>`, "i"),
  );
  return match?.[1] ?? "";
}

function attributeValue(tag: string, attribute: string): string | null {
  const escapedAttribute = attribute.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const match = tag.match(
    new RegExp(`\\b${escapedAttribute}\\s*=\\s*(?:"([^"]*)"|'([^']*)')`, "i"),
  );
  return match?.[1] ?? match?.[2] ?? null;
}

function safeImageUrl(value: string | null): string | undefined {
  if (!value) return undefined;
  try {
    const url = new URL(decodeXml(value).trim());
    return url.protocol === "https:" && !url.username && !url.password
      ? url.toString()
      : undefined;
  } catch {
    return undefined;
  }
}

function imageUrl(item: string): string | undefined {
  const imageTags = item.matchAll(
    /<(?:[\w.-]+:)?(?:content|thumbnail|enclosure)\b[^>]*>/gi,
  );
  for (const [imageTag] of imageTags) {
    const type = attributeValue(imageTag, "type");
    const medium = attributeValue(imageTag, "medium");
    if (
      (type && !type.toLowerCase().startsWith("image/")) ||
      (medium && medium.toLowerCase() !== "image")
    ) {
      continue;
    }
    const url = safeImageUrl(attributeValue(imageTag, "url"));
    if (url) return url;
  }

  const content = tagContent(item, "encoded") || tagContent(item, "description");
  const image = decodeXml(content).match(/<img\b[^>]*\bsrc\s*=\s*(?:"([^"]+)"|'([^']+)'|([^\s>]+))/i);
  return safeImageUrl(image?.[1] ?? image?.[2] ?? image?.[3] ?? null);
}

export function parseRssFeed(
  xml: string,
  publisher: string,
): NewsArticle[] {
  const items = [...xml.matchAll(/<(item|entry)\b[^>]*>([\s\S]*?)<\/\1\s*>/gi)];

  return items.flatMap((match) => {
    const item = match[2];
    const title = plainText(tagContent(item, "title"));
    const rawLink = tagContent(item, "link");
    const linkHref = rawLink ? attributeValue(rawLink, "href") : null;
    const link = safeArticleUrl(linkHref ?? plainText(rawLink));
    const summary = plainText(
      tagContent(item, "description") ||
      tagContent(item, "summary") ||
      tagContent(item, "encoded"),
    );
    const rawDate =
      tagContent(item, "pubDate") ||
      tagContent(item, "published") ||
      tagContent(item, "updated");
    const parsedDate = Date.parse(plainText(rawDate));

    if (!title || !link) return [];

    return [{
      title: title.slice(0, 240),
      link,
      publisher,
      publishedAt: Number.isNaN(parsedDate) ? null : new Date(parsedDate).toISOString(),
      summary: summary.slice(0, 260),
      imageUrl: imageUrl(item),
    }];
  });
}

function safeArticleUrl(value: string): string | null {
  try {
    const url = new URL(decodeXml(value).trim());
    return url.protocol === "https:" && !url.username && !url.password
      ? url.toString()
      : null;
  } catch {
    return null;
  }
}
