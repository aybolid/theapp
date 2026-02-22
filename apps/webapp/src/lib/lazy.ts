import { lazy } from "react";

export const LazyDevErrorStackDisplay = import.meta.env.DEV
  ? lazy(() =>
      import("../components/error-stack-display").then(
        ({ ErrorStackDisplay }) => ({ default: ErrorStackDisplay }),
      ),
    )
  : () => null;

export const LazyDevJsonDisplay = import.meta.env.DEV
  ? lazy(() =>
      import("../components/json-display").then(({ JsonDisplay }) => ({
        default: JsonDisplay,
      })),
    )
  : () => null;
