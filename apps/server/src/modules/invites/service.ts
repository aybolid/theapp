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
    return db.query.invites
      .findFirst({
        where: { email: { eq: email } },
      })
      .then((invite) => !invite);
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
      .values({ email })
      .returning()
      .then((rows) => rows[0]);
  }
}
