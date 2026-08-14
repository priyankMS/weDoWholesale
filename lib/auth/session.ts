import { randomUUID } from "crypto";
import { cookies } from "next/headers";
import { SignJWT, jwtVerify, errors as joseErrors } from "jose";
import type { AccountStatus } from "@/lib/db/models/User";
import { User } from "@/lib/db/models/User";
import { RevokedToken } from "@/lib/db/models/RevokedToken";
import { Op } from "sequelize";

const SESSION_COOKIE = "wedohalal_session";
const SESSION_TTL_SECONDS = 60 * 60 * 24 * 7; // 7 days
const ISSUER = "wedohalal-wholesale";
const AUDIENCE = "wedohalal-wholesale-portal";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error(
      "Missing AUTH_SECRET environment variable. Set it in .env.local.",
    );
  }
  // A short/guessable secret undermines every other protection here — fail
  // loudly in development rather than silently issuing weak tokens.
  if (secret.length < 32) {
    throw new Error(
      "AUTH_SECRET is too short (needs 32+ characters). Generate one with: openssl rand -base64 32",
    );
  }
  return new TextEncoder().encode(secret);
}

export type SessionPayload = {
  userId: number;
  status: AccountStatus;
  jti: string;
};

export async function createSession(payload: {
  userId: number;
  status: AccountStatus;
  tokenVersion: number;
}) {
  const jti = randomUUID();

  const token = await new SignJWT({
    userId: payload.userId,
    status: payload.status,
    tokenVersion: payload.tokenVersion,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setIssuer(ISSUER)
    .setAudience(AUDIENCE)
    .setJti(jti)
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

export async function getSession(): Promise<SessionPayload | null> {
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
    // Expired/invalid/tampered token — treat identically to "no session".
    if (err instanceof joseErrors.JOSEError) return null;
    throw err;
  }

  const jti = payload.jti;
  const userId = payload.userId as number;
  const tokenVersion = payload.tokenVersion as number;
  if (!jti || typeof userId !== "number") return null;

  const [revoked, user] = await Promise.all([
    RevokedToken.findOne({ where: { jti } }),
    User.findByPk(userId, { attributes: ["id", "status", "tokenVersion"] }),
  ]);

  if (revoked) return null;
  if (!user) return null;
  // A password reset / "log out everywhere" bumps tokenVersion, which
  // instantly invalidates every token issued before that point — even
  // ones that haven't hit their natural expiry and weren't individually
  // blocklisted.
  if (user.tokenVersion !== tokenVersion) return null;

  return { userId: user.id, status: user.status, jti };
}

export async function destroySession() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  cookieStore.delete(SESSION_COOKIE);

  if (!token) return;

  try {
    const { payload } = await jwtVerify(token, getSecret(), {
      algorithms: ["HS256"],
      issuer: ISSUER,
      audience: AUDIENCE,
    });
    if (payload.jti && typeof payload.exp === "number") {
      await RevokedToken.create({
        jti: payload.jti,
        expiresAt: new Date(payload.exp * 1000),
      });
    }
  } catch {
    // Token was already invalid/expired — nothing to revoke.
  }

  // Opportunistic cleanup: entries past their own token's expiry can never
  // match a still-valid token again, so they're safe to prune here instead
  // of needing a separate cron job.
  await RevokedToken.destroy({ where: { expiresAt: { [Op.lt]: new Date() } } });
}

/** Invalidates every session currently issued for this user (e.g. after a
 * password reset), without needing to know their individual token jtis. */
export async function revokeAllSessionsForUser(userId: number) {
  await User.increment("tokenVersion", { where: { id: userId } });
}
