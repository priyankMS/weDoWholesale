import { cookies } from "next/headers";
import { SignJWT, jwtVerify, errors as joseErrors } from "jose";
import { AdminUser } from "@/lib/db/models/AdminUser";

// Entirely separate cookie/issuer/audience from the wholesale-portal
// session (lib/auth/session.ts) — an admin session must never be
// mistakable for (or valid as) a customer session and vice versa.
const SESSION_COOKIE = "wedohalal_admin_session";
const SESSION_TTL_SECONDS = 60 * 60 * 12; // 12 hours — shorter than the portal's 7 days
const ISSUER = "wedohalal-wholesale";
const AUDIENCE = "wedohalal-master-admin";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Missing AUTH_SECRET environment variable. Set it in .env.local.",
    );
  }
  if (secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is too short (needs 32+ characters). Generate one with: openssl rand -base64 32",
    );
  }
  return new TextEncoder().encode(secret);
}

export type AdminSessionPayload = {
  adminId: number;
  name: string;
  email: string;
};

export async function createAdminSession(payload: {
  adminId: number;
  name: string;
  email: string;
  tokenVersion: number;
}) {
  const token = await new SignJWT({
    adminId: payload.adminId,
    name: payload.name,
    email: payload.email,
    tokenVersion: payload.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setExpirationTime(`${SESSION_TTL_SECONDS}s`)
    .sign(getSecret());

  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_TTL_SECONDS,
  });
}

export async function getAdminSession(): Promise<AdminSessionPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  let payload;
  try {
    ({ payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    }));
  } catch (err) {
    if (err instanceof joseErrors.JOSEError) return null;
    throw err;
  }

  const adminId = payload.adminId as number;
  const tokenVersion = payload.tokenVersion as number;
  if (typeof adminId !== "number") return null;

  const admin = await AdminUser.findByPk(adminId, {
    attributes: ["id", "name", "email", "tokenVersion"],
  });
  if (!admin) return null;
  // A password change / "log out everywhere" bumps tokenVersion, instantly
  // invalidating every token issued before that point.
  if (admin.tokenVersion !== tokenVersion) return null;

  return { adminId: admin.id, name: admin.name, email: admin.email };
}

export async function destroyAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
