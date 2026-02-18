import { useForm } from "@tanstack/react-form";
import { echoBodySchema } from "@theapp/server/schemas";
import { Button } from "@theapp/ui/components/button";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@theapp/ui/components/field";
import { Input } from "@theapp/ui/components/input";
import { Check, X } from "@theapp/ui/icons/lucide";
import type { FC } from "react";
import { extractZodIssuesFromResponse, server } from "./lib/api";
import { setZodIssuesAsFieldErrors } from "./lib/forms";

export const App: FC = () => {
  const form = useForm({
    formId: "echo-form",
    defaultValues: {
      message: "",
    },
    validators: {
      onSubmit: echoBodySchema,
    },
    onSubmit: async ({ value, formApi }) => {
      const resp = await server.api.echo.post(value);
      if (resp.error) {
        const issues = extractZodIssuesFromResponse(resp);
        if (issues) {
          setZodIssuesAsFieldErrors(formApi, issues);
        } else {
        }
      } else {
        alert(`Echo from server: ${resp.data}`);
      }
    },
  });

  return (
    <main className="grid h-screen place-items-center">
      <form
        className="w-full max-w-md space-y-3"
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <FieldGroup>
          <form.Field
            name="message"
            children={(field) => {
              const isInvalid =
                field.state.meta.isTouched && !field.state.meta.isValid;
              return (
                <Field data-invalid={isInvalid}>
                  <FieldLabel htmlFor={field.name}>Message</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Message..."
                    autoComplete="off"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
                </Field>
              );
            }}
          />
        </FieldGroup>
        <FieldGroup className="flex-row justify-between gap-4">
          <Button
            type="button"
            variant="destructive"
            onClick={() => form.reset()}
          >
            <X />
            <span>Clear</span>
          </Button>
          <Button type="submit">
            <Check />
            <span>Submit</span>
          </Button>
        </FieldGroup>
      </form>
    </main>
  );
};
