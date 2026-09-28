import { NextResponse } from "next/server";
import { seedArticles, newsFeeds, type NewsArticle } from "@/app/lib/news";
import { listPublishedArticles } from "@/app/lib/editorial-news";
import { parseRssFeed } from "@/app/lib/rss";

export const runtime = "nodejs";

async function loadFeed(
  feed: (typeof newsFeeds)[number],
): Promise<NewsArticle[]> {
  const response = await fetch(feed.url, {
    headers: { "User-Agent": "Q4.sk/1.0 (Slovak company intelligence)" },
    next: { revalidate: 1800 },
    signal: AbortSignal.timeout(12_000),
  });
  if (!response.ok) {
    throw new Error(`${feed.publisher} feed returned HTTP ${response.status}`);
  }

  const xml = await response.text();
  const articles = parseRssFeed(xml, feed.publisher);
  if (articles.length === 0) {
    throw new Error(`${feed.publisher} feed contained no readable articles`);
  }
  return articles;
}

export async function GET() {
  const results = await Promise.allSettled(newsFeeds.map(loadFeed));
  let editorialArticles: NewsArticle[] = seedArticles;
  if (process.env.DATABASE_URL) {
    try {
      editorialArticles = await listPublishedArticles();
    } catch (error) {
      console.error("Editorial news request failed", error);
    }
  }
  const feedArticles: NewsArticle[] = [];
  let failedFeeds = 0;

  for (const [index, result] of results.entries()) {
    if (result.status === "fulfilled") {
      feedArticles.push(...result.value);
    } else {
      failedFeeds += 1;
      console.error(`${newsFeeds[index].publisher} RSS request failed`, result.reason);
    }
  }

  if (failedFeeds === newsFeeds.length && editorialArticles.length === 0) {
    return NextResponse.json(
      { error: "Správy sa momentálne nepodarilo načítať." },
      { status: 502 },
    );
  }

  const uniqueEditorial = [...new Map(
    editorialArticles.map((article) => [article.link, article]),
  ).values()];
  const uniqueFeedArticles = [...new Map(
    feedArticles.map((article) => [article.link, article]),
  ).values()]
    .sort((left, right) => {
      if (!left.publishedAt) return 1;
      if (!right.publishedAt) return -1;
      return right.publishedAt.localeCompare(left.publishedAt);
    });

  return NextResponse.json({
    articles: [...uniqueEditorial, ...uniqueFeedArticles].slice(0, 16),
  });
}
