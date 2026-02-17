import type { AnyFormApi } from "@tanstack/react-form";
import type z from "zod";

export function setZodIssuesAsFieldErrors(
  formApi: AnyFormApi,
  issues: z.core.$ZodIssue[],
) {
  const errorMap = Object.fromEntries(
    issues.map((issue) => [issue.path.join("."), issue]),
  );
  formApi.setErrorMap({ onSubmit: { fields: errorMap } });
}
