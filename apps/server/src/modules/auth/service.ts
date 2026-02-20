/** biome-ignore-all lint/complexity/noStaticOnlyClass: abstract class == no class alloc */

import type { DatabaseConnection } from "@theapp/server/db";

export abstract class AuthService {
  static async checkEmailAvailability(
    db: DatabaseConnection,
    email: string,
  ): Promise<boolean> {
    return db.query.users
      .findFirst({
        where: { email: { eq: email } },
      })
      .then((user) => !user);
  }
}
