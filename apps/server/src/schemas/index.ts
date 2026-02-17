import z from "zod";

export * from "./auth";

export const echoBodySchema = z.object({
  message: z.string().min(1).max(100),
});

export type EchoBody = z.infer<typeof echoBodySchema>;
