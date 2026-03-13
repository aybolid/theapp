import { isProduction } from "elysia/error";
import pino from "pino";

export const logger = pino(
  isProduction
    ? {
        level: "info",
      }
    : {
        level: "debug",
        transport: {
          target: "pino-pretty",
          options: {
            colorize: true,
          },
        },
      },
);
