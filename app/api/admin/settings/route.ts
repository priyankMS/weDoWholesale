import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth/adminSession";
import { PlatformSetting } from "@/lib/db/models/PlatformSetting";
import { adminSettingsSchema } from "@/lib/validation/adminSettings";

export async function GET() {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const rows = await PlatformSetting.findAll();
  const settings = Object.fromEntries(rows.map((r) => [r.key, r.value]));
  return NextResponse.json({ settings });
}

export async function PATCH(request: Request) {
  const session = await getAdminSession();
  if (!session) return NextResponse.json({ error: "Not signed in" }, { status: 401 });

  const body = await request.json();
  const parsed = adminSettingsSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  await Promise.all(
    Object.entries(parsed.data).map(([key, value]) =>
      PlatformSetting.update({ value: String(value) }, { where: { key } }),
    ),
  );

  return NextResponse.json({ ok: true });
}
