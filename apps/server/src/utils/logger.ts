import { isProduction } from "elysia/error";
import pino from "pino";

export const logger = pino({
  level: isProduction ? "info" : "debug",
  transport: isProduction
    ? undefined
    : {
        target: "pino-pretty",
        options: {
          colorize: true,
        },
      },
});
