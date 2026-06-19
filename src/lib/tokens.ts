import { createHash, randomBytes } from "node:crypto";

/** A URL-safe, high-entropy secret (~256 bits) for capability tokens. */
export function generateSecret(): string {
  return randomBytes(32).toString("base64url");
}

/**
 * Hash a token for storage and lookup. SHA-256 (not bcrypt) is the right choice
 * here: the input is already high-entropy random, so a slow hash buys nothing,
 * and we want a fast, fixed-width value to compare inside a SQL `WHERE`.
 *
 * We always store/compare the hash, never the plaintext token.
 */
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
