import type { AccessKey, AccessMap } from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import {
  constantTimeEqual,
  hashSecret,
  signAuthJwt,
  verifyAuthJwt,
} from "@theapp/server/utils/crypto";
import { eq } from "drizzle-orm";
import Elysia, { ElysiaCustomStatusResponse } from "elysia";
import { isProduction } from "elysia/error";

// TODO: use valkey to store user sessions

/** Delimiter used to separate parts of the session token (session id and secret). */
export const SESSION_TOKEN_DELIMITER = ".";
/** 10 days */
export const INACTIVITY_TIMEOUT_SECONDS = 60 * 60 * 24 * 10;
/** 1 hour */
const ACTIVITY_UPDATE_INTERVAL_SECONDS = 60 * 60;
/** 1 minute */
export const JWT_EXPIRATION_SECONDS = 60;

export function authGuard(config?: { access?: AccessKey[] }) {
  return new Elysia({ name: "auth-guard", seed: config })
    .derive(
      async (
        ctx,
      ): Promise<{ userId: string; sessionId: string; access: AccessMap }> => {
        const authJwt = ctx.cookie.authToken;

        if (authJwt && typeof authJwt.value === "string") {
          try {
            const result = await verifyAuthJwt(authJwt.value);

            for (const key of config?.access ?? []) {
              if (!result.payload.access[key]) {
                throw ctx.status(403, `${key} access is required`);
              }
            }

            return {
              userId: result.payload.userId,
              sessionId: result.payload.sessionId,
              access: result.payload.access,
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
          where: {
            sessionId: { eq: sessionId },
            user: { status: { eq: "active" } },
          },
          with: { user: { with: { profile: true, access: true } } },
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
          db.delete(schema.sessions).where(
            eq(schema.sessions.sessionId, sessionId),
          );
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
            access: {
              admin: session.user.access.admin,
              wishes: session.user.access.wishes,
              f1: session.user.access.f1,
            },
          },
          JWT_EXPIRATION_SECONDS,
        );

        ctx.cookie.authToken?.set({
          httpOnly: true,
          sameSite: "strict",
          value: jwt,
          path: "/",
          secure: isProduction,
        });

        if (
          now.getTime() - session.lastUsedAt.getTime() >=
          ACTIVITY_UPDATE_INTERVAL_SECONDS * 1000
        ) {
          session.lastUsedAt = now;
          db.update(schema.sessions)
            .set({ lastUsedAt: now })
            .where(eq(schema.sessions.sessionId, sessionId));
        }

        for (const key of config?.access ?? []) {
          if (!session.user.access[key]) {
            throw ctx.status(403, `${key} access is required`);
          }
        }

        return {
          userId: session.userId,
          sessionId: session.sessionId,
          access: {
            admin: session.user.access.admin,
            wishes: session.user.access.wishes,
            f1: session.user.access.f1,
          },
        };
      },
    )
    .as("scoped");
}
