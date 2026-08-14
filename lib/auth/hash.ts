import { createHash } from "crypto";

/** One-way hash for opaque tokens (e.g. password-reset tokens) that are
 * emailed to the user in plaintext but must never be stored that way. */
export function sha256Hex(value: string): string {
  return createHash("sha256").update(value).digest("hex");
}
