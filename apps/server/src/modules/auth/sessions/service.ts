/** biome-ignore-all lint/complexity/noStaticOnlyClass: abstract class == no class alloc */

import type { DatabaseConnection } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import type { UserAgentData } from "@theapp/server/schemas";
import {
  generateSecureRandomString,
  hashSecret,
} from "@theapp/server/utils/crypto";
import { eq } from "drizzle-orm";
import { SESSION_TOKEN_DELIMITER } from "../guard";

export abstract class SessionService {
  static async createSession(
    db: DatabaseConnection,
    data: {
      userId: string;
      uaData: UserAgentData | null;
    },
  ): Promise<string> {
    const sessionId = generateSecureRandomString();
    const secret = generateSecureRandomString();
    const secretHash = await hashSecret(secret);

    await db.insert(schema.sessions).values({
      sessionId,
      secretHash: Buffer.from(secretHash),
      userId: data.userId,
      uaData: data.uaData ?? undefined,
    });

    return `${sessionId}${SESSION_TOKEN_DELIMITER}${secret}`;
  }

  static async updateSession(
    db: DatabaseConnection,
    where: { sessionId: string },
    set: { lastUsedAt?: Date },
  ): Promise<typeof schema.sessions.$inferSelect | undefined> {
    return db
      .update(schema.sessions)
      .set(set)
      .where(eq(schema.sessions.sessionId, where.sessionId))
      .returning()
      .then((rows) => rows[0]);
  }

  static async getUserSessions(
    db: DatabaseConnection,
    userId: string,
  ): Promise<Omit<typeof schema.sessions.$inferSelect, "secretHash">[]> {
    return db.query.sessions.findMany({
      where: { userId: userId },
      columns: { secretHash: false },
    });
  }

  static async deleteSessionById(
    db: DatabaseConnection,
    sessionId: string,
  ): Promise<void> {
    db.delete(schema.sessions).where(eq(schema.sessions.sessionId, sessionId));
  }

  static async deleteSessionsByUserId(
    db: DatabaseConnection,
    userId: string,
  ): Promise<void> {
    db.delete(schema.sessions).where(eq(schema.sessions.userId, userId));
  }
}
