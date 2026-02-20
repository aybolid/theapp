import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import {
  signinBadRequestSchema,
  signinBodySchema,
  signinOkSchema,
  signoutOkSchema,
  signupBodySchema,
  signupCreatedSchema,
  singupConflictErrorSchema,
  userNotFoundErrorSchema,
  userResponseSchema,
} from "@theapp/server/schemas";
import {
  generateSecureRandomString,
  hashSecret,
} from "@theapp/server/utils/crypto";
import { parseUserAgent } from "@theapp/server/utils/ua";
import { eq } from "drizzle-orm";
import Elysia from "elysia";
import { authGuard, SESSION_TOKEN_DELIMITER } from "./guard";
import { sessions } from "./sessions";

const PASSWORD_ALGORITHM: Parameters<(typeof Bun)["password"]["hash"]>[1] =
  "argon2id";

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
      const isEmailAvailable = !(await db.query.users.findFirst({
        where: { email: { eq: ctx.body.email } },
      }));
      if (!isEmailAvailable) {
        throw ctx.status(409, "Email already in use");
      }

      const passwordHash = await Bun.password.hash(
        ctx.body.password,
        PASSWORD_ALGORITHM,
      );

      await db.transaction(async (tx) => {
        const [createdUser] = await tx
          .insert(schema.users)
          .values({ email: ctx.body.email.toLowerCase(), passwordHash })
          .returning();
        if (!createdUser) {
          throw new Error("Failed to create user");
        }
        await tx.insert(schema.profiles).values({ userId: createdUser.userId });
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
      const candidate = await db.query.users.findFirst({
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

      const uaData = parseUserAgent(ctx.request);

      await db.insert(schema.sessions).values({
        sessionId,
        secretHash: Buffer.from(secretHash),
        userId: candidate.userId,
        uaData: uaData ?? undefined,
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
    async (ctx) => {
      const user = await db.query.users.findFirst({
        where: { userId: { eq: ctx.userId } },
        columns: { passwordHash: false },
        with: { profile: true },
      });
      if (!user) {
        throw ctx.status(404, "User not found");
      }
      return ctx.status(200, user);
    },
    {
      response: { 200: userResponseSchema, 404: userNotFoundErrorSchema },
      detail: {
        description: "Get the current user.",
      },
    },
  )
  .post(
    "/signout",
    async (ctx) => {
      ctx.cookie.sessionToken?.remove();
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.sessionId, ctx.sessionId));
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
      ctx.cookie.sessionToken?.remove();
      await db
        .delete(schema.sessions)
        .where(eq(schema.sessions.userId, ctx.userId));
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
