import { db } from "@theapp/server/db";
import { constantTimeEqual, hashSecret } from "@theapp/server/utils/crypto";
import Elysia from "elysia";
import { SessionService } from "./sessions/service";

/** Delimiter used to separate parts of the session token (session id and secret). */
export const SESSION_TOKEN_DELIMITER = ".";
/** 10 days */
const INACTIVITY_TIMEOUT_SECONDS = 60 * 60 * 24 * 10;
/** 1 hour */
const ACTIVITY_UPDATE_INTERVAL_SECONDS = 60 * 60;

export const authGuard = new Elysia({ name: "auth-guard" })
  .derive(async (ctx) => {
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

    return { userId: session.userId, sessionId: session.sessionId };
  })
  .as("scoped");
