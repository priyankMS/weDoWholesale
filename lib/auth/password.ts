import { createHash, timingSafeEqual } from "crypto";
import bcrypt from "bcryptjs";

const SALT_ROUNDS = 12;
const MD5_HASH_PATTERN = /^[a-f0-9]{32}$/i;

export function hashPassword(plain: string): Promise<string> {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

function isLegacyMd5Hash(hash: string): boolean {
  return MD5_HASH_PATTERN.test(hash);
}

function verifyLegacyMd5(plain: string, hash: string): boolean {
  const computed = createHash("md5").update(plain).digest("hex");
  const a = Buffer.from(computed, "utf8");
  const b = Buffer.from(hash.toLowerCase(), "utf8");
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * Verifies a password against either a bcrypt hash (the only kind this app
 * ever creates) or a legacy unsalted-MD5 hash inherited from the client's
 * existing retail-site `users` table. `needsUpgrade` tells the caller to
 * re-hash with bcrypt and persist it — the standard "upgrade on next
 * successful login" pattern for migrating off a weak hash without forcing
 * every existing account through a password reset.
 */
export async function verifyPasswordWithUpgrade(
  plain: string,
  hash: string,
): Promise<{ valid: boolean; needsUpgrade: boolean }> {
  if (isLegacyMd5Hash(hash)) {
    return { valid: verifyLegacyMd5(plain, hash), needsUpgrade: true };
  }
  return { valid: await bcrypt.compare(plain, hash), needsUpgrade: false };
}

export function verifyPassword(plain: string, hash: string): Promise<boolean> {
  return bcrypt.compare(plain, hash);
}
