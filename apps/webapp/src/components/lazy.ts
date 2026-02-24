import { lazy } from "react";

export const LazyDevErrorStackDisplay = import.meta.env.DEV
  ? lazy(() =>
      import("./error-stack-display").then(({ ErrorStackDisplay }) => ({
        default: ErrorStackDisplay,
      })),
    )
  : () => null;

export const LazyDevJsonDisplay = import.meta.env.DEV
  ? lazy(() =>
      import("./json-display").then(({ JsonDisplay }) => ({
        default: JsonDisplay,
      })),
    )
  : () => null;
