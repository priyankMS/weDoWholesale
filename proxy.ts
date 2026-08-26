import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export async function proxy(request: NextRequest) {
  const statusUrl = new URL("/api/maintenance-status", request.url);
  const res = await fetch(statusUrl);
  const { on } = await res.json();
  if (on) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!admin|api|maintenance|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
