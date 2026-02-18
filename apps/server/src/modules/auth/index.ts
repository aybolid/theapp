import { dbPlugin } from "@theapp/server/db/plugin";
import {
  signinBadRequestSchema,
  signinBodySchema,
  signinOkSchema,
  signoutOkSchema,
  signupBodySchema,
  signupCreatedSchema,
  singupConflictErrorSchema,
  userResponseSchema,
} from "@theapp/server/schemas";
import {
  generateSecureRandomString,
  hashSecret,
} from "@theapp/server/utils/crypto";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { authGuard, SESSION_TOKEN_DELIMITER } from "./guard";

const PASSWORD_ALGORITHM: Parameters<(typeof Bun)["password"]["hash"]>[1] =
  "argon2id";

export const auth = new Elysia({
  prefix: "/auth",
  detail: {
    tags: ["auth"],
  },
})
  .use(dbPlugin)
  .post(
    "/signup",
    async (ctx) => {
      const isEmailAvailable = !(await ctx.db.query.users.findFirst({
        where: { email: { eq: ctx.body.email } },
      }));
      if (!isEmailAvailable) {
        throw ctx.status(409, "Email already in use");
      }

      const passwordHash = await Bun.password.hash(
        ctx.body.password,
        PASSWORD_ALGORITHM,
      );

      await ctx.db.transaction(async (tx) => {
        const [createdUser] = await tx
          .insert(ctx.schema.users)
          .values({ email: ctx.body.email, passwordHash })
          .returning();
        if (!createdUser) {
          throw new Error("Failed to create user");
        }
        await tx.insert(ctx.schema.profiles).values({ userId: createdUser.id });
      });

      return ctx.status(201, "User created");
    },
    {
      body: signupBodySchema,
      response: { 409: singupConflictErrorSchema, 201: signupCreatedSchema },
      detail: { description: "Sign up a new user." },
    },
  )
  .post(
    "/signin",
    async (ctx) => {
      const candidate = await ctx.db.query.users.findFirst({
        where: { email: { eq: ctx.body.email } },
      });
      if (!candidate) {
        throw ctx.status(400, "Invalid email or password");
      }

      const isValidPassword = await Bun.password.verify(
        ctx.body.password,
        candidate.passwordHash,
        PASSWORD_ALGORITHM,
      );
      if (!isValidPassword) {
        throw ctx.status(400, "Invalid email or password");
      }

      const sessionId = generateSecureRandomString();
      const secret = generateSecureRandomString();
      const secretHash = await hashSecret(secret);

      await ctx.db.insert(ctx.schema.sessions).values({
        id: sessionId,
        secretHash: Buffer.from(secretHash),
        userId: candidate.id,
      });

      const token = `${sessionId}${SESSION_TOKEN_DELIMITER}${secret}`;

      ctx.cookie.sessionToken?.set({
        httpOnly: true,
        sameSite: "lax",
        value: token,
      });

      return ctx.status(200, "User signed in");
    },
    {
      body: signinBodySchema,
      response: { 400: signinBadRequestSchema, 200: signinOkSchema },
      detail: {
        description:
          "Sign in an existing user. Successful request will result in a session cookie being set.",
      },
    },
  )
  .use(authGuard)
  .get(
    "/me",
    (ctx) => {
      const { passwordHash: _, ...safeUser } = ctx.user;
      return ctx.status(200, safeUser);
    },
    {
      response: { 200: userResponseSchema },
      detail: {
        description: "Get the current user.",
      },
    },
  )
  .post(
    "/signout",
    async (ctx) => {
      ctx.cookie.sessionToken.remove();
      await ctx.db
        .delete(ctx.schema.sessions)
        .where(eq(ctx.schema.sessions.id, ctx.session.id));
      return ctx.status(200, "User signed out");
    },
    {
      response: { 200: signoutOkSchema },
      detail: {
        description: "Sign out the current user.",
      },
    },
  )
  .post(
    "/signout/all",
    async (ctx) => {
      ctx.cookie.sessionToken.remove();
      await ctx.db
        .delete(ctx.schema.sessions)
        .where(eq(ctx.schema.sessions.userId, ctx.user.id));
      return ctx.status(200, "User signed out");
    },
    {
      response: { 200: signoutOkSchema },
      detail: {
        description:
          "Sign out the current user and delete all related sessions.",
      },
    },
  );
