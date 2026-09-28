import { handlers } from "@/auth";
import { configuredOAuthProviders } from "@/app/lib/admin-access";
import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
  if (configuredOAuthProviders().length === 0) {
    const endpoint = request.nextUrl.pathname.split("/").at(-1);
    if (endpoint === "providers") return NextResponse.json({});
    if (endpoint === "session") return NextResponse.json(null);
    if (endpoint === "csrf") return NextResponse.json({ csrfToken: "" });
    return NextResponse.json(
      { error: "OAuth prihlasovanie ešte nie je nakonfigurované." },
      { status: 503 },
    );
  }
  return handlers.GET(request);
}

export const POST = handlers.POST;
