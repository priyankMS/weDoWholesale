import { NextResponse } from "next/server";
import { isMaintenanceModeOn } from "@/lib/db/queries/settings";

// Proxy (proxy.ts) can't import Sequelize/mysql2 directly — its bundle
// doesn't honor serverExternalPackages, so the native mysql2 driver fails
// to load there. It fetches this route instead, which runs as a normal
// Route Handler with full Node.js bundling.
export async function GET() {
  const on = await isMaintenanceModeOn();
  return NextResponse.json({ on });
}
