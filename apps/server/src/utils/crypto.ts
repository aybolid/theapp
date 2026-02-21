import { type JWTVerifyResult, jwtVerify, SignJWT } from "jose";

/** Human readable alphabet (a-z, 0-9 without l, o, 0, 1 to avoid confusion) */
const HUMAN_READABLE_ALPHABET = "abcdefghijkmnpqrstuvwxyz23456789";
const SECRET_HASH_ALGORITHM: AlgorithmIdentifier = "SHA-256";

const PASSWORD_ALGORITHM = "argon2id";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);

export function signAuthJwt(
  payload: {
    userId: string;
    sessionId: string;
  },
  expirationSeconds: number,
): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime(Date.now() / 1000 + expirationSeconds)
    .setIssuedAt()
    .sign(JWT_SECRET);
}

export function verifyAuthJwt(token: string): Promise<
  JWTVerifyResult<{
    userId: string;
    sessionId: string;
  }>
> {
  return jwtVerify(token, JWT_SECRET);
}

export function hashPassword(password: string): Promise<string> {
  return Bun.password.hash(password, PASSWORD_ALGORITHM);
}

export function verifyPassword(data: {
  hash: string;
  password: string;
}): Promise<boolean> {
  return Bun.password.verify(data.password, data.hash, PASSWORD_ALGORITHM);
}

export function generateSecureRandomString(): string {
  // Generate 24 bytes = 192 bits of entropy.
  // We're only going to use 5 bits per byte so the total entropy will be 192 * 5 / 8 = 120 bits
  const bytes = new Uint8Array(24);
  crypto.getRandomValues(bytes);

  let id = "";
  for (const byte of bytes) {
    // >> 3 "removes" the right-most 3 bits of the byte
    id += HUMAN_READABLE_ALPHABET[byte >> 3];
  }
  return id;
}

export async function hashSecret(secret: string): Promise<Uint8Array> {
  const secretBytes = new TextEncoder().encode(secret);
  const secretHashBuffer = await crypto.subtle.digest(
    SECRET_HASH_ALGORITHM,
    secretBytes,
  );
  return new Uint8Array(secretHashBuffer);
}

export function constantTimeEqual(a: Uint8Array, b: Uint8Array): boolean {
  if (a.byteLength !== b.byteLength) {
    return false;
  }
  let c = 0;
  for (let i = 0; i < a.byteLength; i++) {
    // biome-ignore lint/style/noNonNullAssertion: i is < a.byteLength, a and b length is equal
    c |= a[i]! ^ b[i]!;
  }
  return c === 0;
}
