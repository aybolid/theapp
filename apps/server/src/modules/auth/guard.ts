import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { constantTimeEqual, hashSecret } from "@theapp/server/utils/crypto";
import { eq } from "drizzle-orm";
import Elysia from "elysia";

/** Delimiter used to separate parts of the session token (session id and secret). */
export const SESSION_TOKEN_DELIMITER = ".";
/** 1 day */
const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24;

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

    const now = Date.now();

    const session = await db.query.sessions.findFirst({
      where: { sessionId: { eq: sessionId } },
      with: { user: { with: { profile: true } } },
    });
    if (!session) {
      sessionToken.remove();
      throw ctx.status(401, "Invalid session token");
    }

    if (
      now - session.createdAt.getTime() >=
      SESSION_EXPIRES_IN_SECONDS * 1000
    ) {
      sessionToken.remove();
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.sessionId, sessionId));
      throw ctx.status(401, "Session expired");
    }

    const incomingSecretHash = await hashSecret(sessionSecret);
    if (!constantTimeEqual(incomingSecretHash, session.secretHash)) {
      sessionToken.remove();
      throw ctx.status(401, "Invalid session token");
    }

    const { user, ...sessionData } = session;
    return { user, session: sessionData };
  })
  .as("scoped");
