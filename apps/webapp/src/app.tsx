import { useForm } from "@tanstack/react-form";
import { echoBodySchema } from "@theapp/server/schemas";
import type { FC } from "react";
import { extractZodIssuesFromResponse, server } from "./lib/api";
import { setZodIssuesAsFieldErrors } from "./lib/forms";

export const App: FC = () => {
  const form = useForm({
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
    <form
      style={{ display: "grid", maxWidth: 300, gap: 12 }}
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <form.Field name="message">
        {(field) => (
          <>
            <label htmlFor={field.name}>Message:</label>
            <input
              id={field.name}
              name={field.name}
              value={field.state.value}
              placeholder="Enter message"
              onChange={(e) => field.handleChange(e.target.value)}
            />
            {!field.state.meta.isValid && (
              <pre role="alert" style={{ color: "red", textWrap: "wrap" }}>
                {JSON.stringify(field.state.meta.errors, null, 2)}
              </pre>
            )}
          </>
        )}
      </form.Field>
      <button type="submit">Submit</button>
    </form>
  );
};
