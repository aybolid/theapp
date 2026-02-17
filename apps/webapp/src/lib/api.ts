import { type Treaty, treaty } from "@elysiajs/eden";
import type { App } from "@theapp/server";
import type z from "zod";

export const server = treaty<App>(
  import.meta.env.DEV
    ? `${window.location.origin}/server-proxy`
    : import.meta.env.VITE_API_BASE_URL,
);

export function extractZodIssuesFromResponse(
  resp: Treaty.TreatyResponse<{
    422: {
      type: "validation";
      on: string;
      summary?: string | undefined;
      message?: string | undefined;
      found?: unknown;
      property?: string | undefined;
      expected?: string | undefined;
      errors?: unknown | undefined;
    };
  }>,
): z.core.$ZodIssue[] | null {
  if (!resp.error) return null;
  if (resp.error.value.type !== "validation") return null;
  if (!resp.error.value.errors) return null;
  if (!Array.isArray(resp.error.value.errors)) return null;
  const issues = [];
  for (const error of resp.error.value.errors) {
    if (!isZodIssue(error)) return null;
    issues.push(error);
  }
  return issues;
}

function isZodIssue(value: unknown): value is z.core.$ZodIssue {
  return (
    typeof value === "object" &&
    value !== null &&
    "code" in value &&
    "message" in value &&
    "path" in value
  );
}
