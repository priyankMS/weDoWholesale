import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import { User } from "@/lib/db/models/User";
import { updateProfileSchema } from "@/lib/validation/account";

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const body = await request.json();
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Invalid input", issues: parsed.error.issues },
      { status: 400 },
    );
  }

  const user = await User.findByPk(session.userId);
  if (!user) {
    return NextResponse.json({ error: "Account not found" }, { status: 404 });
  }

  await user.update(parsed.data);

  return NextResponse.json({ ok: true });
}
