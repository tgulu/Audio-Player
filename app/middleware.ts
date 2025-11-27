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

//configuration object that Next.js uses to determine when to run the middleware
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     */
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
