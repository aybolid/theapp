import { useForm } from "@tanstack/react-form";
import { createFileRoute, useRouter } from "@tanstack/react-router";
import { signinBodySchema } from "@theapp/schemas";
import { Button } from "@theapp/ui/components/button";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
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
import { ThemeMenu } from "@theapp/webapp/components/theme-menu";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import { useSigninMutation } from "@theapp/webapp/lib/query/auth";

export const Route = createFileRoute("/_no_auth/signin")({
  head: () => ({
    meta: [
      {
        title: "Sign In | theapp",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const router = useRouter();

  const signinMutation = useSigninMutation({
    onSuccess: () => router.invalidate(),
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
    formId: "signin-form",
    defaultValues: {
      email: "",
      password: "",
    },
    validators: {
      onSubmit: signinBodySchema,
    },
    onSubmit: ({ value }) => {
      signinMutation.mutate(value);
    },
  });

  const isBusy = signinMutation.isPending || form.state.isSubmitting;

  return (
    <main className="grid h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <CardTitle>Welcome back!</CardTitle>
          <CardDescription>
            Ready to jump back in? Just drop your details below.
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
            {!form.state.isFormValid && (
              <FieldGroup>
                <FieldError errors={form.state.errors} />
              </FieldGroup>
            )}
            <FieldGroup>
              <Button disabled={isBusy} type="submit">
                {isBusy && <Spinner />}
                <span>Let's go!</span>
              </Button>
            </FieldGroup>
          </CardContent>
        </form>
      </Card>
    </main>
  );
}
