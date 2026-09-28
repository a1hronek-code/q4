import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminAuthConfigured, isAdminEmailAllowed } from "@/app/lib/admin-access";
import { ArticleImportError, importArticleMetadata } from "@/app/lib/article-import";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

export async function POST(request: Request) {
  if (!isAdminAuthConfigured()) {
    return json({ error: "Na správu článkov sa prihláste oprávneným účtom." }, 401);
  }
  const session = await auth();
  if (!isAdminEmailAllowed(session?.user?.email)) {
    return json({ error: "Na správu článkov sa prihláste oprávneným účtom." }, 401);
  }
  const origin = request.headers.get("origin");
  let sameOrigin = false;
  if (origin) {
    try {
      sameOrigin = new URL(origin).origin === new URL(request.url).origin;
    } catch {
      sameOrigin = false;
    }
  }
  if (!sameOrigin) {
    return json({ error: "Požiadavka musí pochádzať z tejto stránky." }, 403);
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return json({ error: "Telo požiadavky nie je platný JSON." }, 400);
  }
  const url = body && typeof body === "object" && !Array.isArray(body)
    ? (body as Record<string, unknown>).url
    : null;

  try {
    return json({ article: await importArticleMetadata(url) });
  } catch (error) {
    const timedOut = error instanceof DOMException && error.name === "TimeoutError";
    return json({
      error: error instanceof ArticleImportError
        ? error.message
        : timedOut
          ? "Načítanie článku trvalo príliš dlho."
          : "Pôvodnú stránku sa nepodarilo načítať.",
    }, error instanceof ArticleImportError ? 400 : timedOut ? 504 : 502);
  }
}
