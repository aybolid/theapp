import Elysia from "elysia";
import { invitesAdmin } from "./admin";

export const invites = new Elysia({
  prefix: "/invites",
  detail: {
    tags: ["invites"],
  },
}).use(invitesAdmin);
