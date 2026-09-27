import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";


export async function proxy(request: NextRequest) {
  // Fetch via loopback, not the public domain — some hosts can't route a
  // server's own outbound requests back to its own public IP (NAT hairpin),
  // which breaks TLS on this self-call.
  const port = process.env.PORT || 3000;
  const statusUrl = new URL("/api/maintenance-status", `http://127.0.0.1:${port}`);
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
