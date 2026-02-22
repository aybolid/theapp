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
} from "@theapp/schemas";
import { db } from "@theapp/server/db";
import {
  hashPassword,
  signAuthJwt,
  verifyPassword,
} from "@theapp/server/utils/crypto";
import { parseUserAgent } from "@theapp/server/utils/ua";
import Elysia from "elysia";
import { ProfileService } from "../profiles/service";
import { UserService } from "../users/service";
import { authGuard, JWT_EXPIRATION_SECONDS } from "./guard";
import { AuthService } from "./service";
import { sessions } from "./sessions";
import { SessionService } from "./sessions/service";

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
      const isEmailAvailable = await AuthService.checkEmailAvailability(
        db,
        ctx.body.email,
      );
      if (!isEmailAvailable) {
        throw ctx.status(409, "Email already in use");
      }

      const passwordHash = await hashPassword(ctx.body.password);

      await db.transaction(async (tx) => {
        const createdUser = await UserService.createUser(tx, {
          email: ctx.body.email,
          passwordHash,
        });
        if (!createdUser) {
          throw new Error("Failed to create user");
        }
        const createdProfile = await ProfileService.createProfile(
          tx,
          createdUser.userId,
        );
        if (!createdProfile) {
          throw new Error("Failed to create profile");
        }
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
      const candidate = await UserService.getUserByEmail(db, ctx.body.email);
      if (!candidate) {
        throw ctx.status(400, "Invalid email or password");
      }

      const isValidPassword = await verifyPassword({
        hash: candidate.passwordHash,
        password: ctx.body.password,
      });
      if (!isValidPassword) {
        throw ctx.status(400, "Invalid email or password");
      }

      const { sessionId, token } = await SessionService.createSession(db, {
        userId: candidate.userId,
        uaData: parseUserAgent(ctx.request),
      });

      const jwt = await signAuthJwt(
        {
          sessionId,
          userId: candidate.userId,
        },
        JWT_EXPIRATION_SECONDS,
      );

      ctx.cookie.sessionToken?.set({
        httpOnly: true,
        sameSite: "lax",
        value: token,
        path: "/",
      });
      ctx.cookie.authToken?.set({
        httpOnly: true,
        sameSite: "lax",
        value: jwt,
        path: "/",
      });

      return ctx.status(200, "User signed in");
    },
    {
      body: signinBodySchema,
      response: { 400: signinBadRequestSchema, 200: signinOkSchema },
      detail: {
        description:
          "Sign in an existing user. Successful request will result in a auth cookies being set.",
      },
    },
  )
  .use(authGuard)
  .get(
    "/me",
    async (ctx) => {
      const user = await UserService.getUserById(db, ctx.userId);
      if (!user) throw ctx.status(404, "User not found");
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
      ctx.cookie.authToken?.remove();
      await SessionService.deleteSessionById(db, ctx.sessionId);
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
      ctx.cookie.authToken?.remove();
      await SessionService.deleteSessionsByUserId(db, ctx.userId);
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
