/** biome-ignore-all lint/complexity/noStaticOnlyClass: abstract class == no class alloc */

import type { DatabaseConnection } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";
import type { ProfileResponse } from "@theapp/server/schemas";
import { eq } from "drizzle-orm";

export abstract class ProfileService {
  static async createProfile(
    db: DatabaseConnection,
    userId: string,
  ): Promise<ProfileResponse | undefined> {
    return db
      .insert(schema.profiles)
      .values({ userId })
      .returning()
      .then((rows) => rows[0]);
  }

  static async updateProfile(
    db: DatabaseConnection,
    where: { userId: string },
    set: { name?: string; picture?: string; bio?: string },
  ): Promise<ProfileResponse | undefined> {
    return db
      .update(schema.profiles)
      .set({
        name: set.name?.trim(),
        picture: set.picture,
        bio: set.bio?.trim(),
      })
      .where(eq(schema.profiles.userId, where.userId))
      .returning()
      .then((rows) => rows[0]);
  }
}
