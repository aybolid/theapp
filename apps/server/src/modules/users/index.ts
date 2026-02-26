import Elysia from "elysia";
import { usersAdmin } from "./admin";

export const users = new Elysia({
  prefix: "/users",
  detail: {
    tags: ["users"],
  },
}).use(usersAdmin);
