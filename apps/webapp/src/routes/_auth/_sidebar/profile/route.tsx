import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import {
  type ProfileResponse,
  profilesPatchBodySchema,
  type UserResponse,
} from "@theapp/server/schemas";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
import { Card, CardFooter, CardHeader } from "@theapp/ui/components/card";
import { Field, FieldError, FieldGroup } from "@theapp/ui/components/field";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupTextarea,
} from "@theapp/ui/components/input-group";
import { Spinner } from "@theapp/ui/components/spinner";
import { Tick01Icon, User02Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import {
  meQueryOptions,
  useMeSuspenseQuery,
} from "@theapp/webapp/lib/query/auth";
import { useUpdateProfileMutation } from "@theapp/webapp/lib/query/profiles";
import type { FC } from "react";
import z from "zod";

export const Route = createFileRoute("/_auth/_sidebar/profile")({
  head: () => ({
    meta: [
      {
        title: "My Profile | theapp",
      },
    ],
  }),
  component: RouteComponent,
});

function RouteComponent() {
  const meQuery = useMeSuspenseQuery();

  return (
    <div className="container mx-auto max-w-3xl">
      <Card>
        <CardHeader>
          <Avatar className="size-16">
            <AvatarImage src={meQuery.data.profile.picture} alt="User Avatar" />
            <AvatarFallback>
              <HugeiconsIcon
                icon={User02Icon}
                strokeWidth={2}
                className="size-8"
              />
            </AvatarFallback>
          </Avatar>
        </CardHeader>
        <CardFooter>
          <EditableBio profile={meQuery.data.profile} />
        </CardFooter>
      </Card>
    </div>
  );
}

const bioSchema = z.object({
  bio: profilesPatchBodySchema.shape.bio.nonoptional(),
});

const EditableBio: FC<{ profile: ProfileResponse }> = ({ profile }) => {
  const queryClient = useQueryClient();

  const updateMutation = useUpdateProfileMutation({
    onSuccess: (profile) => {
      form.setFieldValue("bio", profile.bio);
      queryClient.setQueryData<UserResponse>(
        meQueryOptions.queryKey,
        (prev) => {
          if (!prev) return undefined;
          const clone = structuredClone(prev);
          clone.profile.bio = profile.bio;
          return clone;
        },
      );
      queryClient.invalidateQueries(meQueryOptions);
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
              fields: { bio: { message: "An unknown error occurred" } },
            },
          });
      }
    },
  });

  const form = useForm({
    formId: "bio-form",
    validators: {
      onSubmit: bioSchema,
    },
    defaultValues: { bio: profile.bio },
    onSubmit: ({ value }) => updateMutation.mutate(value),
  });

  const isBusy = updateMutation.isPending || form.state.isSubmitting;

  return (
    <form
      className="contents"
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
    >
      <FieldGroup>
        <form.Field
          name="bio"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <InputGroup aria-invalid={isInvalid}>
                  <InputGroupTextarea
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Your bio"
                    onKeyDown={(e) => {
                      if ((e.ctrlKey || e.shiftKey) && e.code === "Enter") {
                        e.preventDefault();
                        form.handleSubmit();
                      }
                    }}
                  />
                  {field.state.value.trim() !== profile.bio && (
                    <InputGroupAddon align="block-end">
                      <InputGroupButton
                        className="ml-auto"
                        title="Save"
                        type="submit"
                        variant="default"
                        disabled={isBusy}
                      >
                        {isBusy ? (
                          <Spinner />
                        ) : (
                          <HugeiconsIcon icon={Tick01Icon} strokeWidth={2} />
                        )}
                      </InputGroupButton>
                    </InputGroupAddon>
                  )}
                </InputGroup>
                {isInvalid && <FieldError errors={field.state.meta.errors} />}
              </Field>
            );
          }}
        />
      </FieldGroup>
    </form>
  );
};
