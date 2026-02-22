/** biome-ignore-all lint/complexity/noStaticOnlyClass: abstract class == no class alloc */

import type { UserResponse } from "@theapp/schemas";
import type { DatabaseConnection } from "@theapp/server/db";
import { schema } from "@theapp/server/db/schema";

export abstract class UserService {
  static async createUser(
    db: DatabaseConnection,
    data: { email: string; passwordHash: string },
  ): Promise<
    (Omit<UserResponse, "profile"> & { passwordHash: string }) | undefined
  > {
    return db
      .insert(schema.users)
      .values({
        email: data.email.toLowerCase(),
        passwordHash: data.passwordHash,
      })
      .returning()
      .then((rows) => rows[0]);
  }

  static async getUserByEmail(
    db: DatabaseConnection,
    email: string,
  ): Promise<
    (Omit<UserResponse, "profile"> & { passwordHash: string }) | undefined
  > {
    return db.query.users.findFirst({
      where: { email: { eq: email } },
    });
  }

  static async getUserById(
    db: DatabaseConnection,
    userId: string,
  ): Promise<UserResponse | undefined> {
    return db.query.users.findFirst({
      where: { userId: { eq: userId } },
      columns: { passwordHash: false },
      with: { profile: true },
    });
  }
}
