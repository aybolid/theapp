import cron, { Patterns } from "@elysiajs/cron";
import {
  getSessions,
  type MarkedSession,
  me,
  type Session,
  signin,
  signout,
  signoutAll,
  signup,
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import {
  generateSecureRandomString,
  hashPassword,
  hashSecret,
  signAuthJwt,
  verifyPassword,
} from "@theapp/server/utils/crypto";
import { parseUserAgent } from "@theapp/server/utils/ua";
import { and, eq, lt } from "drizzle-orm";
import Elysia from "elysia";
import { isProduction } from "elysia/error";
import {
  authGuard,
  INACTIVITY_TIMEOUT_SECONDS,
  JWT_EXPIRATION_SECONDS,
  SESSION_TOKEN_DELIMITER,
} from "./guard";

export const auth = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["auth"],
  },
})
  .use(
    cron({
      name: "delete-inactive-sessions",
      pattern: Patterns.EVERY_DAY_AT_MIDNIGHT,
      run: async () => {
        const cutoff = new Date(Date.now() - INACTIVITY_TIMEOUT_SECONDS * 1000);
        return db
          .delete(schema.sessions)
          .where(lt(schema.sessions.lastUsedAt, cutoff))
          .returning()
          .then((rows) => rows.map(makeSafeSession));
      },
    }),
  )
  .post(
    "/signup",
    async (ctx) => {
      const userWithEmail = await db.query.users.findFirst({
        where: { email: { eq: ctx.body.email.toLowerCase() } },
      });
      if (userWithEmail !== undefined) {
        throw ctx.status(409, "Email already in use");
      }

      const passwordHash = await hashPassword(ctx.body.password);

      await db.transaction(async (tx) => {
        const user = await tx
          .insert(schema.users)
          .values({
            email: ctx.body.email.toLowerCase(),
            passwordHash,
          })
          .returning()
          .then((rows) => rows[0]);
        if (!user) {
          throw new Error("Failed to create user");
        }

        const access = await tx
          .insert(schema.accesses)
          .values({
            userId: user.userId,
          })
          .returning()
          .then((rows) => rows[0]);
        if (!access) {
          throw new Error("Failed to create access");
        }

        const profile = await tx
          .insert(schema.profiles)
          .values({ userId: user.userId })
          .returning()
          .then((rows) => rows[0]);
        if (!profile) {
          throw new Error("Failed to create profile");
        }
      });

      return ctx.status(201, "User created");
    },
    {
      ...signup,
      detail: {
        description:
          "Sign up with a valid email and password. Creates a new user account that needs to be activated before it can be used.",
      },
    },
  )
  .post(
    "/signin",
    async (ctx) => {
      const candidate = await db.query.users.findFirst({
        where: {
          email: { eq: ctx.body.email.toLowerCase() },
          status: { eq: "active" },
        },
        with: { access: true },
      });
      if (!candidate) throw ctx.status(400, "Invalid email or password");

      const isValidPassword = await verifyPassword({
        hash: candidate.passwordHash,
        password: ctx.body.password,
      });
      if (!isValidPassword) throw ctx.status(400, "Invalid email or password");

      const uaData = parseUserAgent(ctx.request);

      const sessionId = generateSecureRandomString();
      const secret = generateSecureRandomString();
      const secretHash = await hashSecret(secret);

      const session = await db
        .insert(schema.sessions)
        .values({
          sessionId,
          secretHash: Buffer.from(secretHash),
          userId: candidate.userId,
          uaData: uaData ?? undefined,
        })
        .returning()
        .then((rows) => rows[0]);
      if (!session) throw new Error("Failed to create session");

      const token = `${sessionId}${SESSION_TOKEN_DELIMITER}${secret}`;

      const jwt = await signAuthJwt(
        {
          sessionId,
          userId: candidate.userId,
          access: {
            admin: candidate.access.admin,
            wishes: candidate.access.wishes,
            f1: candidate.access.f1,
          },
        },
        JWT_EXPIRATION_SECONDS,
      );

      ctx.cookie.sessionToken?.set({
        httpOnly: true,
        sameSite: "strict",
        value: token,
        path: "/",
        maxAge: INACTIVITY_TIMEOUT_SECONDS,
        secure: isProduction,
      });
      ctx.cookie.authToken?.set({
        httpOnly: true,
        sameSite: "strict",
        value: jwt,
        path: "/",
        secure: isProduction,
      });

      return ctx.status(200, "Signed in");
    },
    {
      ...signin,
      detail: {
        description:
          "Sign in with email and password. Only activated user can sign in. Returns session and auth tokens.",
      },
    },
  )
  .use(authGuard())
  .get(
    "/me",
    async (ctx) => {
      const user = await db.query.users.findFirst({
        where: { userId: { eq: ctx.userId } },
        columns: { passwordHash: false },
        with: { profile: true, access: true },
      });
      if (!user) throw ctx.status(404, "User not found");
      return ctx.status(200, {
        ...user,
        access: { ...user.access, ...ctx.access },
      });
    },
    {
      ...me,
      detail: {
        description: "Get the currently authenticated user's profile.",
      },
    },
  )
  .get(
    "/sessions",
    async (ctx) => {
      const markedSessions = await db.query.sessions
        .findMany({
          where: { userId: { eq: ctx.userId }, user: { status: "active" } },
          orderBy: { lastUsedAt: "desc" },
          columns: { secretHash: false },
        })
        .then((sessions) => markCurrentSession(sessions, ctx.sessionId));
      return ctx.status(200, markedSessions);
    },
    {
      ...getSessions,
      detail: {
        description: "Get all active sessions for the current user.",
      },
    },
  )
  .delete(
    "/signout",
    async (ctx) => {
      if (!ctx.query.sessionId || ctx.query.sessionId === ctx.sessionId) {
        ctx.cookie.sessionToken?.remove();
        ctx.cookie.authToken?.remove();
      }
      await db
        .delete(schema.sessions)
        .where(
          and(
            eq(schema.sessions.sessionId, ctx.query.sessionId ?? ctx.sessionId),
            eq(schema.sessions.userId, ctx.userId),
          ),
        );
      return ctx.status(200, "Signed out");
    },
    {
      ...signout,
      detail: {
        description:
          "Sign out the current session or, if `sessionId` is provided, the specified session.",
      },
    },
  )
  .delete(
    "/signout/all",
    async (ctx) => {
      ctx.cookie.sessionToken?.remove();
      ctx.cookie.authToken?.remove();
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.userId, ctx.userId));
      return ctx.status(200, "Signed out all sessions");
    },
    {
      ...signoutAll,
      detail: {
        description: "Sign out all sessions for the current user.",
      },
    },
  );

function makeSafeSession<T extends { secretHash: Buffer }>(
  session: T,
): Omit<T, "secretHash"> {
  const { secretHash: _, ...safeSession } = session;
  return safeSession;
}

function markCurrentSession(
  sessions: Session[],
  currentSessionId: string,
): MarkedSession[] {
  return sessions.map((s) => ({
    ...s,
    isCurrent: s.sessionId === currentSessionId,
  }));
}
