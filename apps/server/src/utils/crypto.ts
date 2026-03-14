const PASSWORD_ALGORITHM = "argon2id";
const SECRET_HASH_ALGORITHM: AlgorithmIdentifier = "SHA-256";

/**
 * Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion).
 */
const HUMAN_READABLE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";

/**
 * Hashes a password using Bun's native hashing utilities.
 */
export function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, PASSWORD_ALGORITHM);
}

/**
 * Verifies a password against its hash.
 */
export function verifyPassword(data: {
  hash: string;
  password: string;
}): Promise<boolean> {
  return Bun.password.verify(data.password, data.hash, PASSWORD_ALGORITHM);
}

/**
 * Generates a secure random string (~120 bits of entropy).
 * Uses a human-readable alphabet to reduce ambiguity.
 */
export function generateSecureRandomString(): string {
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (const byte of bytes) {
    // 32 chars = 5 bits. byte >> 3 takes the 5 most significant bits.
    id += HUMAN_READABLE_ALPHABET[byte >> 3];
  }
  return id;
}

/**
 * Hashes a secret value for storage or comparison.
 */
export async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest(
    SECRET_HASH_ALGORITHM,
    secretBytes,
  );
  return new Uint8Array(secretHashBuffer);
}

/**
 * Constant-time equality check to prevent timing attacks on sensitive data.
 */
export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) return false;

  let result = 0;
  for (let i = 0; i < a.byteLength; i++) {
    // biome-ignore lint/style/noNonNullAssertion: safe access within byteLength
    result |= a[i]! ^ b[i]!;
  }
  return result === 0;
}
