import type { UserRole } from "@theapp/schemas";
import { db } from "@theapp/server/db";
import {
  constantTimeEqual,
  hashSecret,
  signAuthJwt,
  verifyAuthJwt,
} from "@theapp/server/utils/crypto";
import Elysia, { ElysiaCustomStatusResponse } from "elysia";
import { isProduction } from "elysia/error";
import { SessionService } from "./sessions/service";

/** Delimiter used to separate parts of the session token (session id and secret). */
export const SESSION_TOKEN_DELIMITER = ".";
/** 10 days */
export const INACTIVITY_TIMEOUT_SECONDS = 60 * 60 * 24 * 10;
/** 1 hour */
const ACTIVITY_UPDATE_INTERVAL_SECONDS = 60 * 60;
/** 1 minute */
export const JWT_EXPIRATION_SECONDS = 60;

export function authGuard(seed?: { adminOnly: boolean }) {
  return new Elysia({ name: "auth-guard", seed })
    .derive(
      async (
        ctx,
      ): Promise<{ userId: string; sessionId: string; role: UserRole }> => {
        const authJwt = ctx.cookie.authToken;
        if (authJwt && typeof authJwt.value === "string") {
          try {
            const result = await verifyAuthJwt(authJwt.value);
            if (seed?.adminOnly && result.payload.role !== "admin") {
              throw ctx.status(403, "Admin access required");
            }
            return {
              userId: result.payload.userId,
              sessionId: result.payload.sessionId,
              role: result.payload.role,
            };
          } catch (e) {
            if (e instanceof ElysiaCustomStatusResponse) {
              throw e;
            }
            authJwt.remove();
          }
        }

        const sessionToken = ctx.cookie.sessionToken;

        if (!sessionToken) {
          throw ctx.status(401, "Session token not found");
        }
        if (typeof sessionToken.value !== "string") {
          throw ctx.status(401, "Invalid session token");
        }

        const tokenParts = sessionToken.value.split(SESSION_TOKEN_DELIMITER);
        if (tokenParts.length !== 2) {
          sessionToken.remove();
          throw ctx.status(401, "Invalid session token");
        }
        // biome-ignore lint/style/noNonNullAssertion: length checked
        const sessionId = tokenParts[0]!;
        // biome-ignore lint/style/noNonNullAssertion: length checked
        const sessionSecret = tokenParts[1]!;

        const now = new Date();

        const session = await db.query.sessions.findFirst({
          where: { sessionId: { eq: sessionId } },
          with: { user: { with: { profile: true } } },
        });
        if (!session) {
          sessionToken.remove();
          throw ctx.status(401, "Invalid session token");
        }

        if (
          now.getTime() - session.lastUsedAt.getTime() >=
          INACTIVITY_TIMEOUT_SECONDS * 1000
        ) {
          sessionToken.remove();
          await SessionService.deleteSessionById(db, sessionId);
          throw ctx.status(401, "Session expired");
        }

        const incomingSecretHash = await hashSecret(sessionSecret);
        if (!constantTimeEqual(incomingSecretHash, session.secretHash)) {
          sessionToken.remove();
          throw ctx.status(401, "Invalid session token");
        }

        const jwt = await signAuthJwt(
          {
            userId: session.userId,
            sessionId: session.sessionId,
            role: session.user.role,
          },
          JWT_EXPIRATION_SECONDS,
        );

        ctx.cookie.authToken?.set({
          httpOnly: true,
          sameSite: "lax",
          value: jwt,
          path: "/",
          secure: isProduction,
        });

        if (
          now.getTime() - session.lastUsedAt.getTime() >=
          ACTIVITY_UPDATE_INTERVAL_SECONDS * 1000
        ) {
          session.lastUsedAt = now;
          await SessionService.updateSession(
            db,
            { sessionId },
            { lastUsedAt: now },
          );
        }

        if (seed?.adminOnly && session.user.role !== "admin") {
          throw ctx.status(403, "Admin access required");
        }

        return {
          userId: session.userId,
          sessionId: session.sessionId,
          role: session.user.role,
        };
      },
    )
    .as("scoped");
}
