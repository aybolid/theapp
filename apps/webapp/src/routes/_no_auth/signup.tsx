import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { signupBodySchema } from "@theapp/server/schemas";
import { Button } from "@theapp/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@theapp/ui/components/card";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@theapp/ui/components/field";
import { Input } from "@theapp/ui/components/input";
import { Spinner } from "@theapp/ui/components/spinner";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import { useSignupMutation } from "@theapp/webapp/lib/query/auth";
import z from "zod";

export const Route = createFileRoute("/_no_auth/signup")({
  component: RouteComponent,
});

function RouteComponent() {
  const navigate = useNavigate();

  const signupMutation = useSignupMutation({
    onSuccess: () => {
      navigate({ to: "/signin" });
    },
    onError: (err) => {
      const issues =
        err.status === 422
          ? extractZodIssuesFromValidationError(err.value)
          : null;

      switch (err.status) {
        case 409:
          form.setErrorMap({
            onSubmit: { fields: { email: { message: err.value } } },
          });
          break;
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: expected fallthrough
        case 422:
          if (issues) {
            setZodIssuesAsFieldErrors(form, issues);
            break;
          }
        default:
          form.setErrorMap({
            onSubmit: {
              form: { message: "An unknown error occurred" },
              fields: {},
            },
          });
      }
    },
  });

  const form = useForm({
    formId: "signup-form",
    defaultValues: {
      email: "",
      password: "",
      passwordConfirm: "",
    },
    validators: {
      onSubmit: z
        .object({
          ...signupBodySchema.shape,
          passwordConfirm: z.string(),
        })
        .refine((data) => data.password === data.passwordConfirm, {
          message: "Passwords do not match",
          path: ["passwordConfirm"],
        }),
    },
    onSubmit: ({ value }) => {
      signupMutation.mutate({ email: value.email, password: value.password });
    },
  });

  const isBusy = signupMutation.isPending || form.state.isSubmitting;

  return (
    <main className="grid h-screen place-items-center">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to get started.
          </CardDescription>
        </CardHeader>
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <CardContent className="space-y-4">
            <FieldGroup>
              <form.Field
                name="email"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Email address
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type="email"
                        placeholder="email@example.com"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
            <FieldGroup>
              <form.Field
                name="password"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>Password</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type="password"
                        placeholder="••••••••"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
            <FieldGroup>
              <form.Field
                name="passwordConfirm"
                children={(field) => {
                  const isInvalid =
                    field.state.meta.isTouched && !field.state.meta.isValid;
                  return (
                    <Field data-invalid={isInvalid}>
                      <FieldLabel htmlFor={field.name}>
                        Confirm Password
                      </FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type="password"
                        placeholder="••••••••"
                      />
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </Field>
                  );
                }}
              />
            </FieldGroup>
            {!form.state.isFormValid && (
              <FieldGroup>
                <FieldError errors={form.state.errors} />
              </FieldGroup>
            )}
            <FieldGroup>
              <Button disabled={isBusy}>
                {isBusy && <Spinner />}
                <span>Create account</span>
              </Button>
            </FieldGroup>
          </CardContent>
        </form>
        <CardFooter>
          <p className="text-muted-foreground text-sm">
            Already have an account?{" "}
            <Link className="text-foreground hover:underline" to="/signin">
              Sign in
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
