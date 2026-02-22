export * from "./auth";
export * from "./profiles";
export * from "./sessions";
export * from "./ua";

// see https://github.com/elysiajs/elysia/issues/1670

import z, { type ZodType } from "zod";

function overrideJSONSchema<T extends ZodType>(
  schema: T,
  toJSONSchema: () => unknown | undefined,
) {
  schema._zod.toJSONSchema = toJSONSchema;
  return schema;
}

const datetime = z.union([z.iso.datetime(), z.date()]);

export const zDate = overrideJSONSchema(
  z.codec(datetime, datetime, {
    decode: (isoString) => new Date(isoString),
    encode: (date) => new Date(date).toISOString(),
  }),
  () => z.toJSONSchema(z.iso.datetime()),
);
