import Elysia from "elysia";
import { db } from ".";
import { schema } from "./schema";

export const dbPlugin = new Elysia({ name: "db" })
  .decorate("db", db)
  .decorate("schema", schema);
