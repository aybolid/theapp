import { useForm } from "@tanstack/react-form";
import {
  createFileRoute,
  Link,
  redirect,
  SearchParamError,
  useNavigate,
} from "@tanstack/react-router";
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
import { Empty, EmptyMedia } from "@theapp/ui/components/empty";
import {
  Field,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@theapp/ui/components/field";
import { Input } from "@theapp/ui/components/input";
import { Item, ItemDescription, ItemTitle } from "@theapp/ui/components/item";
import { Spinner } from "@theapp/ui/components/spinner";
import { ThemeMenu } from "@theapp/webapp/components/theme-menu";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import { useSignupMutation } from "@theapp/webapp/lib/query/auth";
import { useValidInviteSuspenseQuery } from "@theapp/webapp/lib/query/invites";
import { Suspense } from "react";
import { ErrorBoundary } from "react-error-boundary";
import z from "zod";

export const Route = createFileRoute("/_no_auth/signup")({
  validateSearch: z.object({
    inviteId: z.uuidv7(),
  }),
  onError: (err) => {
    if (err instanceof SearchParamError) {
      throw redirect({ to: "/signin" });
    }
  },
  head: () => ({
    meta: [
      {
        title: "Create Account | theapp",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  return (
    <main className="grid h-screen place-items-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="border-b">
          <CardTitle>Create an account</CardTitle>
          <CardDescription>
            Enter your details below to get started.
          </CardDescription>
          <CardAction>
            <ThemeMenu />
          </CardAction>
        </CardHeader>
        <ErrorBoundary
          fallback={
            <CardContent>
              <Alert variant="destructive">
                <AlertTitle>Invalid invite</AlertTitle>
                <AlertDescription>
                  Your invite has expired or is invalid.
                </AlertDescription>
              </Alert>
            </CardContent>
          }
        >
          <Suspense
            fallback={
              <CardContent>
                <Empty>
                  <EmptyMedia variant="icon">
                    <Spinner />
                  </EmptyMedia>
                </Empty>
              </CardContent>
            }
          >
            <RouteComponentImpl />
          </Suspense>
        </ErrorBoundary>
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

function RouteComponentImpl() {
  const { inviteId } = Route.useSearch();

  const inviteQuery = useValidInviteSuspenseQuery(inviteId);

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
      inviteId,
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
      signupMutation.mutate({
        inviteId: value.inviteId,
        password: value.password,
      });
    },
  });

  const isBusy = signupMutation.isPending || form.state.isSubmitting;

  return (
    <form
      className="contents"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <CardContent className="space-y-4">
        <Item variant="muted">
          <ItemTitle>Email address</ItemTitle>
          <ItemDescription>{inviteQuery.data.email}</ItemDescription>
        </Item>
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
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
                  <FieldLabel htmlFor={field.name}>Confirm Password</FieldLabel>
                  <Input
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    type="password"
                  />
                  {isInvalid && <FieldError errors={field.state.meta.errors} />}
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
            <span>Create account</span>
          </Button>
        </FieldGroup>
      </CardContent>
    </form>
  );
}
