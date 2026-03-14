import type { AccessKey, AccessMap } from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { constantTimeEqual, hashSecret } from "@theapp/server/utils/crypto";
import { eq } from "drizzle-orm";
import Elysia, {
  type Context,
  type Cookie,
  ElysiaCustomStatusResponse,
} from "elysia";
import { isProduction } from "elysia/error";
import {
  type JWTPayload,
  type JWTVerifyResult,
  jwtVerify,
  SignJWT,
} from "jose";

// TODO: use valkey/redis to store user sessions

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
const JWT_ALGORITHM = "HS256";
/** 1 minute */
const AUTH_JWT_EXPIRATION_SECONDS = 60;

/** Delimiter used to separate parts of the session token (session id and secret). */
const SESSION_TOKEN_DELIMITER = ".";
/** 10 days */
export const INACTIVITY_TIMEOUT_SECONDS = 60 * 60 * 24 * 10;
/** 1 hour */
const ACTIVITY_UPDATE_INTERVAL_SECONDS = 60 * 60;

type AuthData = {
  userId: string;
  sessionId: string;
  access: AccessMap;
};

/**
 * Authentication JWT payload structure.
 */
type AuthJwtPayload = JWTPayload & AuthData;

/**
 * Constructs a session token by joining the session ID and secret.
 */
export function buildSessionToken(data: { sessionId: string; secret: string }) {
  return `${data.sessionId}${SESSION_TOKEN_DELIMITER}${data.secret}`;
}

/**
 * Splits a session token into its constituent session ID and secret parts.
 */
function splitSessionToken(
  ctx: Context,
  token: string,
): { sessionId: string; sessionSecret: string } {
  const tokenParts = token.split(SESSION_TOKEN_DELIMITER);
  if (tokenParts.length !== 2) {
    ctx.cookie.sessionToken?.remove();
    throw ctx.status(401, "Invalid session token");
  }
  // biome-ignore lint/style/noNonNullAssertion: length check is done above
  const sessionId = tokenParts[0]!;
  // biome-ignore lint/style/noNonNullAssertion: length check is done above
  const sessionSecret = tokenParts[1]!;
  return { sessionId, sessionSecret };
}

/**
 * Verifies the JWT and checks if the user has the required access.
 */
async function verifyAndHandleJwt(
  ctx: Context,
  token: string,
  config?: { access?: AccessKey[] },
): Promise<AuthData | null> {
  try {
    const { payload } = await verifyAuthJwt(token);
    checkAccess(ctx, payload.access, config?.access ?? []);
    return {
      userId: payload.userId,
      sessionId: payload.sessionId,
      access: payload.access,
    };
  } catch (e) {
    ctx.cookie.authToken?.remove();
    if (e instanceof ElysiaCustomStatusResponse) {
      throw e;
    }
    return null;
  }
}

/**
 * Checks if the provided access map contains all required access keys.
 */
function checkAccess(
  ctx: Context,
  accessMap: AccessMap,
  requiredAccess: AccessKey[],
) {
  for (const key of requiredAccess) {
    if (!accessMap[key]) {
      throw ctx.status(403, `${key} access is required`);
    }
  }
}

/**
 * Maps database access flags to an AccessMap object.
 */
export function getAccessMap<
  T extends { admin: boolean; wishes: boolean; f1: boolean },
>(access: T): AccessMap {
  return {
    admin: access.admin,
    wishes: access.wishes,
    f1: access.f1,
  };
}

/**
 * Sets the authentication JWT cookie.
 */
export function setAuthTokenCookie(
  cookie: Record<string, Cookie<unknown>>,
  token: string,
) {
  cookie.authToken?.set({
    httpOnly: true,
    sameSite: "strict",
    value: token,
    path: "/",
    secure: isProduction,
  });
}

/**
 * Sets the session token cookie with an expiration time.
 */
export function setSessionTokenCookie(
  cookie: Record<string, Cookie<unknown>>,
  token: string,
) {
  cookie.sessionToken?.set({
    httpOnly: true,
    sameSite: "strict",
    value: token,
    path: "/",
    maxAge: INACTIVITY_TIMEOUT_SECONDS,
    secure: isProduction,
  });
}

/**
 * Signs an authentication JWT.
 */
export async function signAuthJwt(payload: AuthJwtPayload): Promise<string> {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: JWT_ALGORITHM })
    .setExpirationTime(
      Math.floor(Date.now() / 1000) + AUTH_JWT_EXPIRATION_SECONDS,
    )
    .setIssuedAt()
    .sign(JWT_SECRET);
}

/**
 * Verifies an authentication JWT.
 */
export async function verifyAuthJwt(
  token: string,
): Promise<JWTVerifyResult<AuthJwtPayload>> {
  return jwtVerify(token, JWT_SECRET);
}

/**
 * Validates the session from the database, checks for expiration, and verifies the secret.
 */
async function verifyAndHandleSession(
  ctx: Context,
  token: string,
  config?: { access?: AccessKey[] },
): Promise<AuthData> {
  try {
    const { sessionId, sessionSecret } = splitSessionToken(ctx, token);

    const now = new Date();

    const session = await db.query.sessions.findFirst({
      where: {
        sessionId: { eq: sessionId },
        user: { status: { eq: "active" } },
      },
      with: { user: { with: { access: true } } },
    });

    if (!session) {
      throw ctx.status(401, "Invalid session token");
    }

    const isSessionExpired =
      now.getTime() - session.lastUsedAt.getTime() >=
      INACTIVITY_TIMEOUT_SECONDS * 1000;
    if (isSessionExpired) {
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.sessionId, sessionId));
      throw ctx.status(401, "Session expired");
    }

    const incomingSecretHash = await hashSecret(sessionSecret);
    if (!constantTimeEqual(incomingSecretHash, session.secretHash)) {
      throw ctx.status(401, "Invalid session token");
    }

    const access = getAccessMap(session.user.access);
    checkAccess(ctx, access, config?.access ?? []);

    const jwt = await signAuthJwt({
      userId: session.userId,
      sessionId: session.sessionId,
      access,
    });

    setAuthTokenCookie(ctx.cookie, jwt);

    const shouldUpdateLastUsed =
      now.getTime() - session.lastUsedAt.getTime() >=
      ACTIVITY_UPDATE_INTERVAL_SECONDS * 1000;
    if (shouldUpdateLastUsed) {
      await db
        .update(schema.sessions)
        .set({ lastUsedAt: now })
        .where(eq(schema.sessions.sessionId, sessionId));
    }

    return {
      userId: session.userId,
      sessionId: session.sessionId,
      access,
    };
  } catch (e) {
    ctx.cookie.sessionToken?.remove();
    throw e;
  }
}

/**
 * Middleware that authenticates requests using either a JWT or a session token.
 */
export function authGuard(config?: { access?: AccessKey[] }) {
  return new Elysia({ name: "auth-guard", seed: config })
    .derive(async (ctx): Promise<AuthData> => {
      const authJwt = ctx.cookie.authToken?.value;
      if (typeof authJwt === "string") {
        const authData = await verifyAndHandleJwt(ctx, authJwt, config);
        if (authData) return authData;
      }

      const sessionToken = ctx.cookie.sessionToken?.value;
      if (typeof sessionToken !== "string") {
        throw ctx.status(401, "Session token not found");
      }
      return verifyAndHandleSession(ctx, sessionToken, config);
    })
    .as("scoped");
}
