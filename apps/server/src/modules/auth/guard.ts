import { dbPlugin } from "@theapp/server/db/plugin";
import { constantTimeEqual, hashSecret } from "@theapp/server/utils/crypto";
import { eq } from "drizzle-orm";
import Elysia, { t } from "elysia";

/** Delimiter used to separate parts of the session token (session id and secret). */
export const SESSION_TOKEN_DELIMITER = ".";
/** 1 day */
const SESSION_EXPIRES_IN_SECONDS = 60 * 60 * 24;

export const authGuard = new Elysia({ name: "auth-guard" })
  .use(dbPlugin)
  .guard({
    cookie: t.Cookie({
      sessionToken: t.String(),
    }),
  })
  .derive(async (ctx) => {
    const sessionToken = ctx.cookie.sessionToken;

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

    const session = await ctx.db.query.sessions.findFirst({
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
      await ctx.db
        .delete(ctx.schema.sessions)
        .where(eq(ctx.schema.sessions.sessionId, sessionId));
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
