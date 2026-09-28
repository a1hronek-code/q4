import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { isAdminAuthConfigured, isAdminEmailAllowed } from "@/app/lib/admin-access";
import { validateArticleInput } from "@/app/lib/article-validation";
import {
  listAdminArticles,
  saveArticle,
  setArticleVisibility,
  updateArticle,
} from "@/app/lib/editorial-news";

export const runtime = "nodejs";

function json(data: unknown, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: { "Cache-Control": "private, no-store, max-age=0" },
  });
}

async function isAuthorized() {
  if (!isAdminAuthConfigured()) return false;
  const session = await auth();
  return isAdminEmailAllowed(session?.user?.email);
}

function isSameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  if (!origin) return false;
  try {
    return new URL(origin).origin === new URL(request.url).origin;
  } catch {
    return false;
  }
}

async function readBody(request: Request): Promise<Record<string, unknown> | null> {
  try {
    const body: unknown = await request.json();
    return body && typeof body === "object" && !Array.isArray(body)
      ? body as Record<string, unknown>
      : null;
  } catch {
    return null;
  }
}

export async function GET() {
  if (!(await isAuthorized())) {
    return json({ error: "Na správu článkov sa prihláste oprávneným účtom." }, 401);
  }
  if (!process.env.DATABASE_URL) {
    return json({ error: "V prostredí nie je nastavené DATABASE_URL." }, 503);
  }

  try {
    return json({ articles: await listAdminArticles() });
  } catch (error) {
    console.error("Admin article list request failed", error);
    return json({ error: "Články sa z databázy nepodarilo načítať." }, 503);
  }
}

export async function POST(request: Request) {
  if (!(await isAuthorized())) {
    return json({ error: "Na správu článkov sa prihláste oprávneným účtom." }, 401);
  }
  if (!isSameOrigin(request)) {
    return json({ error: "Požiadavka musí pochádzať z tejto stránky." }, 403);
  }
  const body = await readBody(request);
  const validated = validateArticleInput(body);
  if ("error" in validated) return json({ error: validated.error }, 400);

  try {
    return json({ article: await saveArticle(validated.input) }, 201);
  } catch (error) {
    console.error("Admin article save request failed", error);
    return json({ error: "Článok sa nepodarilo uložiť do databázy." }, 503);
  }
}

export async function PUT(request: Request) {
  if (!(await isAuthorized())) {
    return json({ error: "Na správu článkov sa prihláste oprávneným účtom." }, 401);
  }
  if (!isSameOrigin(request)) {
    return json({ error: "Požiadavka musí pochádzať z tejto stránky." }, 403);
  }
  const body = await readBody(request);
  if (typeof body?.id !== "string" || !body.id.trim()) {
    return json({ error: "Chýba identifikátor článku." }, 400);
  }
  const validated = validateArticleInput(body);
  if ("error" in validated) return json({ error: validated.error }, 400);

  try {
    const article = await updateArticle(body.id, validated.input);
    return article
      ? json({ article })
      : json({ error: "Článok sa už v databáze nenachádza." }, 404);
  } catch (error) {
    console.error("Admin article update request failed", error);
    return json({ error: "Článok sa nepodarilo upraviť." }, 503);
  }
}

export async function PATCH(request: Request) {
  if (!(await isAuthorized())) {
    return json({ error: "Na správu článkov sa prihláste oprávneným účtom." }, 401);
  }
  if (!isSameOrigin(request)) {
    return json({ error: "Požiadavka musí pochádzať z tejto stránky." }, 403);
  }
  const body = await readBody(request);
  if (
    typeof body?.id !== "string" ||
    !body.id.trim() ||
    typeof body.isVisible !== "boolean"
  ) {
    return json({ error: "Údaje na zmenu stavu článku nie sú platné." }, 400);
  }

  try {
    const article = await setArticleVisibility(body.id, body.isVisible);
    return article
      ? json({ article })
      : json({ error: "Článok sa už v databáze nenachádza." }, 404);
  } catch (error) {
    console.error("Admin article visibility request failed", error);
    return json({ error: "Stav článku sa nepodarilo zmeniť." }, 503);
  }
}
