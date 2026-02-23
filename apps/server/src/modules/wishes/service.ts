/** biome-ignore-all lint/complexity/noStaticOnlyClass: abstract class == no class alloc */

import type { WishResponse } from "@theapp/schemas";
import type { DatabaseConnection } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";

export abstract class WishService {
  static async createWish(
    db: DatabaseConnection,
    data: { ownerId: string; note?: string; name: string; link: string },
  ): Promise<Omit<WishResponse, "reserver" | "owner"> | undefined> {
    return db
      .insert(schema.wishes)
      .values({
        ownerId: data.ownerId,
        name: data.name.trim(),
        note: data.note?.trim(),
        link: data.link.trim(),
      })
      .returning()
      .then((rows) => rows[0]);
  }

  static async getWishes(db: DatabaseConnection): Promise<WishResponse[]> {
    return db.query.wishes.findMany({
      orderBy: { createdAt: "desc" },
      with: {
        owner: { with: { profile: true } },
        reserver: { with: { profile: true } },
      },
    });
  }
}
