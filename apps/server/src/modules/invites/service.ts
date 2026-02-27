/** biome-ignore-all lint/complexity/noStaticOnlyClass: abstract class == no class alloc */
import type { InviteResponse } from "@theapp/schemas";
import type { DatabaseConnection } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { eq } from "drizzle-orm";

export abstract class InviteService {
  static async checkEmailAvailability(
    db: DatabaseConnection,
    email: string,
  ): Promise<boolean> {
    return await db.transaction(async (tx) => {
      const userExists = await tx.query.users.findFirst({
        where: { email: { eq: email.toLowerCase() } },
      });
      if (userExists) return false;
      const inviteExists = await tx.query.invites.findFirst({
        where: { email: { eq: email.toLowerCase() } },
      });
      if (inviteExists) return false;
      return true;
    });
  }

  static async getInviteById(
    db: DatabaseConnection,
    inviteId: string,
  ): Promise<InviteResponse | undefined> {
    return db.query.invites.findFirst({
      where: { inviteId: { eq: inviteId } },
    });
  }

  static async getInvites(db: DatabaseConnection): Promise<InviteResponse[]> {
    return db.query.invites.findMany();
  }

  static async deleteInvite(
    db: DatabaseConnection,
    inviteId: string,
  ): Promise<void> {
    await db
      .delete(schema.invites)
      .where(eq(schema.invites.inviteId, inviteId));
  }

  static async createInvite(
    db: DatabaseConnection,
    email: string,
  ): Promise<InviteResponse | undefined> {
    return db
      .insert(schema.invites)
      .values({ email: email.toLowerCase() })
      .returning()
      .then((rows) => rows[0]);
  }
}
