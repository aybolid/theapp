import { useForm } from "@tanstack/react-form";
import { createFileRoute, Link } from "@tanstack/react-router";
import { signupBodySchema } from "@theapp/schemas";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@theapp/ui/components/alert";
import { Button } from "@theapp/ui/components/button";
import {
  Card,
  CardAction,
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
import { CheckCircle } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { ThemeMenu } from "@theapp/webapp/components/theme-menu";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import { useSignupMutation } from "@theapp/webapp/lib/query/auth";
import { useState } from "react";
import z from "zod";

export const Route = createFileRoute("/_no_auth/signup")({
  head: () => ({
    meta: [
      { title: "Create an account" },
      { name: "description", content: "Create a new account" },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const [isSignupSuccess, setIsSignupSuccess] = useState(false);

  const signupMutation = useSignupMutation({
    onSuccess: () => setIsSignupSuccess(true),
    onError: (err) => {
      const issues =
        err.status === 422
          ? extractZodIssuesFromValidationError(err.value)
          : null;

      switch (err.status) {
        case 400:
          form.setErrorMap({
            onSubmit: { form: { message: err.value }, fields: {} },
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
          passwordConfirm: z.string().min(1, "Required"),
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

  if (isSignupSuccess) {
    return (
      <main className="grid h-screen place-items-center p-4">
        <Alert className="w-full max-w-md">
          <HugeiconsIcon icon={CheckCircle} strokeWidth={2} />
          <AlertTitle>Thank you for signing up!</AlertTitle>
          <AlertDescription>
            Your account has been created! You will be able to{" "}
            <Link to="/signin">sign in</Link> as soon as admin approves your
            account.
          </AlertDescription>
        </Alert>
      </main>
    );
  }

  const isBusy = signupMutation.isPending || form.state.isSubmitting;

  return (
    <main className="grid h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Ready to join? Add your details below.
          </CardDescription>
          <CardAction>
            <ThemeMenu />
          </CardAction>
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
                      <FieldLabel htmlFor={field.name}>Your email</FieldLabel>
                      <Input
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        type="email"
                        placeholder="you@example.com"
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
                        Confirm password
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
              <Button disabled={isBusy} type="submit">
                {isBusy && <Spinner />}
                <span>Join!</span>
              </Button>
            </FieldGroup>
          </CardContent>
        </form>
        <CardFooter className="py-2">
          <p className="text-muted-foreground">
            Already have an account?{" "}
            <Link to="/signin" className="text-foreground hover:underline">
              Sign in.
            </Link>
          </p>
        </CardFooter>
      </Card>
    </main>
  );
}
