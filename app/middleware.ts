import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { TOKEN_COOKIE } from "./constants";

export function middleware(request: NextRequest) {
  if (!request.cookies.has(TOKEN_COOKIE)) {
    const response = NextResponse.next();
    response.cookies.set(TOKEN_COOKIE, "demo-token-" + Date.now());
    return response;
  }

  return NextResponse.next();
}
