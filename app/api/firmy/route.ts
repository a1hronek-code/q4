import type { NextRequest } from "next/server";
import { GET as searchRpo } from "../search/route";

export async function GET(request: NextRequest) {
  return searchRpo(request);
}
