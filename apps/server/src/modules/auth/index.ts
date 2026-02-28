import {
  signinBadRequestSchema,
  signinBodySchema,
  signinOkSchema,
  signoutOkSchema,
  signoutQuerySchema,
  signupBodySchema,
  signupCreatedSchema,
  singupBadRequestErrorSchema,
  singupConflictErrorSchema,
  userNotFoundErrorSchema,
  userResponseSchema,
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
import { and, eq } from "drizzle-orm";
import Elysia from "elysia";
import { isProduction } from "elysia/error";
import {
  authGuard,
  INACTIVITY_TIMEOUT_SECONDS,
  JWT_EXPIRATION_SECONDS,
  SESSION_TOKEN_DELIMITER,
} from "./guard";
import { sessions } from "./sessions";

export const auth = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["auth"],
  },
})
  .use(sessions)
  .post(
    "/signup",
    async (ctx) => {
      const invite = await db.query.invites.findFirst({
        where: { inviteId: { eq: ctx.body.inviteId } },
      });
      if (!invite) {
        throw ctx.status(400, "Invalid invite");
      }
      if (new Date(invite.expiresAt).getTime() < Date.now()) {
        throw ctx.status(400, "Invite expired");
      }

      const userWithEmail = await db.query.users.findFirst({
        where: { email: { eq: invite.email.toLowerCase() } },
      });
      if (userWithEmail !== undefined) {
        throw ctx.status(409, "Email already in use");
      }

      const passwordHash = await hashPassword(ctx.body.password);

      await db.transaction(async (tx) => {
        const user = await tx
          .insert(schema.users)
          .values({
            email: invite.email.toLowerCase(),
            passwordHash,
          })
          .returning()
          .then((rows) => rows[0]);
        if (!user) {
          throw new Error("Failed to create user");
        }

        const profile = await tx
          .insert(schema.profiles)
          .values({ userId: user.userId })
          .returning()
          .then((rows) => rows[0]);
        if (!profile) {
          throw new Error("Failed to create profile");
        }

        await tx
          .delete(schema.invites)
          .where(eq(schema.invites.inviteId, ctx.body.inviteId));
      });

      return ctx.status(201, "User created");
    },
    {
      body: signupBodySchema,
      response: {
        409: singupConflictErrorSchema,
        201: signupCreatedSchema,
        400: singupBadRequestErrorSchema,
      },
      detail: {
        description: "Sign up with a valid invite. Creates a new user account.",
      },
    },
  )
  .post(
    "/signin",
    async (ctx) => {
      const candidate = await db.query.users.findFirst({
        where: { email: { eq: ctx.body.email.toLowerCase() } },
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
          role: candidate.role,
        },
        JWT_EXPIRATION_SECONDS,
      );

      ctx.cookie.sessionToken?.set({
        httpOnly: true,
        sameSite: "lax",
        value: token,
        path: "/",
        maxAge: INACTIVITY_TIMEOUT_SECONDS,
        secure: isProduction,
      });
      ctx.cookie.authToken?.set({
        httpOnly: true,
        sameSite: "lax",
        value: jwt,
        path: "/",
        secure: isProduction,
      });

      return ctx.status(200, "User signed in");
    },
    {
      body: signinBodySchema,
      response: { 400: signinBadRequestSchema, 200: signinOkSchema },
      detail: {
        description:
          "Sign in with email and password. Returns session and auth tokens.",
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
        with: { profile: true },
      });
      if (!user) throw ctx.status(404, "User not found");
      return ctx.status(200, user);
    },
    {
      response: { 200: userResponseSchema, 404: userNotFoundErrorSchema },
      detail: {
        description: "Get the currently authenticated user's profile.",
      },
    },
  )
  .post(
    "/signout",
    async (ctx) => {
      if (!ctx.query.sessionId || ctx.query.sessionId === ctx.sessionId) {
        ctx.cookie.sessionToken?.remove();
        ctx.cookie.authToken?.remove();
        await db
          .delete(schema.sessions)
          .where(eq(schema.sessions.sessionId, ctx.sessionId));
        return ctx.status(200, "User signed out");
      }

      await db
        .delete(schema.sessions)
        .where(
          and(
            eq(schema.sessions.sessionId, ctx.query.sessionId),
            eq(schema.sessions.userId, ctx.userId),
          ),
        );

      return ctx.status(200, "Session invalidated");
    },
    {
      query: signoutQuerySchema,
      response: { 200: signoutOkSchema },
      detail: {
        description:
          "Sign out the current session or, if `sessionId` is provided, the specified session.",
      },
    },
  )
  .post(
    "/signout/all",
    async (ctx) => {
      ctx.cookie.sessionToken?.remove();
      ctx.cookie.authToken?.remove();
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.userId, ctx.userId));
      return ctx.status(200, "User signed out");
    },
    {
      response: { 200: signoutOkSchema },
      detail: {
        description: "Sign out all sessions for the current user.",
      },
    },
  );
