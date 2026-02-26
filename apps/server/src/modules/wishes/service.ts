/** biome-ignore-all lint/complexity/noStaticOnlyClass: abstract class == no class alloc */

import type { WishResponse } from "@theapp/schemas";
import type { DatabaseConnection } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import { and, eq, isNull, not } from "drizzle-orm";

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

  static async getWishById(
    db: DatabaseConnection,
    wishId: string,
  ): Promise<WishResponse | undefined> {
    return db.query.wishes.findFirst({
      where: { wishId: { eq: wishId } },
      with: {
        owner: { with: { profile: true } },
        reserver: { with: { profile: true } },
      },
    });
  }

  static async deleteWishById(
    db: DatabaseConnection,
    data: { wishId: string; currentUserId: string },
  ): Promise<void> {
    await db
      .delete(schema.wishes)
      .where(
        and(
          eq(schema.wishes.wishId, data.wishId),
          eq(schema.wishes.ownerId, data.currentUserId),
        ),
      );
  }

  static async updateWishById(
    db: DatabaseConnection,
    {
      wishId,
      currentUserId,
      ...set
    }: {
      wishId: string;
      currentUserId: string;
      name?: string;
      description?: string;
      isCompleted?: boolean;
    },
  ): Promise<Omit<WishResponse, "reserver" | "owner"> | undefined> {
    return db
      .update(schema.wishes)
      .set(set)
      .where(
        and(
          eq(schema.wishes.wishId, wishId),
          eq(schema.wishes.ownerId, currentUserId),
        ),
      )
      .returning()
      .then((rows) => rows[0]);
  }

  static async updateWishReserver(
    db: DatabaseConnection,
    {
      wishId,
      reserverId,
      currentUserId,
    }: {
      wishId: string;
      reserverId: string | null;
      currentUserId: string;
    },
  ): Promise<Omit<WishResponse, "reserver" | "owner"> | undefined> {
    return db
      .update(schema.wishes)
      .set({ reserverId })
      .where(
        reserverId
          ? and(
              eq(schema.wishes.wishId, wishId),
              not(eq(schema.wishes.ownerId, reserverId)),
              isNull(schema.wishes.reserverId),
            )
          : and(
              eq(schema.wishes.wishId, wishId),
              eq(schema.wishes.reserverId, currentUserId),
            ),
      )
      .returning()
      .then((rows) => rows[0]);
  }
}
