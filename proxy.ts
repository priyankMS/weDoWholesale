import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { isMaintenanceModeOn } from "@/lib/db/queries/settings";

// Gates every customer-facing page behind the admin "maintenance_mode"
// platform setting (Settings page). Admin routes, API routes, and the
// maintenance page itself are exempt via the matcher below — otherwise
// turning maintenance mode on would lock the admin out of turning it back
// off. Next.js 16 renamed middleware.ts to proxy.ts; it defaults to the
// Node.js runtime, so a normal Sequelize query works fine here.
export async function proxy(request: NextRequest) {
  if (await isMaintenanceModeOn()) {
    return NextResponse.rewrite(new URL("/maintenance", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!admin|api|maintenance|_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
