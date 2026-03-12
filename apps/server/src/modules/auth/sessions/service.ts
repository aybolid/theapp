import type { MarkedSession, Session } from "@theapp/schemas";
import { db } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { and, eq, lt } from "drizzle-orm";
import { INACTIVITY_TIMEOUT_SECONDS } from "../guard";

export function makeSafeSession<T extends { secretHash: Buffer }>(
  session: T,
): Omit<T, "secretHash"> {
  const { secretHash: _, ...safeSession } = session;
  return safeSession;
}

export function markCurrentSession(
  sessions: Session[],
  currentSessionId: string,
): MarkedSession[] {
  return sessions.map((s) => ({
    ...s,
    isCurrent: s.sessionId === currentSessionId,
  }));
}

export async function getActiveUserSessions(args: {
  userId: string;
}): Promise<Session[]> {
  return db.query.sessions.findMany({
    where: { userId: { eq: args.userId }, user: { status: "active" } },
    orderBy: { lastUsedAt: "desc" },
    columns: { secretHash: false },
  });
}

export async function getActiveUserSessionById(args: {
  sessionId: string;
  userId: string;
}): Promise<Session | undefined> {
  return db.query.sessions.findFirst({
    where: {
      sessionId: { eq: args.sessionId },
      userId: { eq: args.userId },
      user: { status: "active" },
    },
    columns: { secretHash: false },
  });
}

export async function deleteUserSessions(args: {
  userId: string;
}): Promise<Session[]> {
  return db
    .delete(schema.sessions)
    .where(eq(schema.sessions.userId, args.userId))
    .returning()
    .then((rows) => rows.map(makeSafeSession));
}

export async function deleteUserSessionById(args: {
  sessionId: string;
  userId: string;
}): Promise<Session | undefined> {
  return db
    .delete(schema.sessions)
    .where(
      and(
        eq(schema.sessions.sessionId, args.sessionId),
        eq(schema.sessions.userId, args.userId),
      ),
    )
    .returning()
    .then((rows) => {
      const row = rows[0];
      if (!row) return undefined;
      return makeSafeSession(row);
    });
}

export async function updateUserSessionById(args: {
  sessionId: string;
  userId: string;
  set: Partial<typeof schema.sessions.$inferInsert>;
}): Promise<Session | undefined> {
  return db
    .update(schema.sessions)
    .set(args.set)
    .where(
      and(
        eq(schema.sessions.sessionId, args.sessionId),
        eq(schema.sessions.userId, args.userId),
      ),
    )
    .returning()
    .then((rows) => {
      const row = rows[0];
      if (!row) return undefined;
      return makeSafeSession(row);
    });
}

export async function deleteInactiveSessions(): Promise<Session[]> {
  const cutoff = new Date(Date.now() - INACTIVITY_TIMEOUT_SECONDS * 1000);
  return db
    .delete(schema.sessions)
    .where(lt(schema.sessions.lastUsedAt, cutoff))
    .returning()
    .then((rows) => rows.map(makeSafeSession));
}
