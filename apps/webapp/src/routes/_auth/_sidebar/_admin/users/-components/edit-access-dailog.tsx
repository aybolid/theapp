import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { type Access, patchUserAccess } from "@theapp/schemas";
import { Button } from "@theapp/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@theapp/ui/components/dialog";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@theapp/ui/components/field";
import { Spinner } from "@theapp/ui/components/spinner";
import { Switch } from "@theapp/ui/components/switch";
import { Save, X } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import {
  usersQueryOptions,
  useUpdateUserAccessMutation,
} from "@theapp/webapp/lib/query/users";
import { type ComponentProps, type FC, useState } from "react";

import z from "zod";

type DialogTriggerProps = ComponentProps<typeof DialogTrigger>;

const schema = z.object({
  admin: patchUserAccess.body.shape.admin.nonoptional(),
  wishes: patchUserAccess.body.shape.wishes.nonoptional(),
  f1: patchUserAccess.body.shape.f1.nonoptional(),
});

export const EditAccessDialog: FC<{
  isMe: boolean;
  access: Access;
  render: NonNullable<DialogTriggerProps["render"]>;
  nativeButton?: DialogTriggerProps["nativeButton"];
}> = ({ render, nativeButton, access, isMe }) => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const updateMutation = useUpdateUserAccessMutation({
    onSuccess: (user) => {
      queryClient.setQueryData(usersQueryOptions.queryKey, (prev) =>
        prev?.map((u) => (u.userId === user.userId ? user : u)),
      );
      queryClient.invalidateQueries({ queryKey: usersQueryOptions.queryKey });
      setOpen(false);
    },
    onError: (err) => {
      const issues =
        err.status === 422
          ? extractZodIssuesFromValidationError(err.value)
          : null;

      switch (err.status) {
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: expected
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
    defaultValues: {
      f1: access.f1,
      wishes: access.wishes,
      admin: access.admin,
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value }) => {
      updateMutation.mutate({ userId: access.userId, ...value });
    },
  });

  const isBusy = form.state.isSubmitting || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger nativeButton={nativeButton} render={render} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Edit access</DialogTitle>
          <DialogDescription>
            Configure which features this user has access to.
          </DialogDescription>
        </DialogHeader>
        <form
          className="contents"
          onSubmit={(e) => {
            e.preventDefault();
            form.handleSubmit();
          }}
        >
          <FieldGroup>
            <form.Field
              name="admin"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    orientation="horizontal"
                    data-invalid={isInvalid}
                    className={cn(
                      "rounded-md border p-4",
                      isMe && "opacity-50",
                    )}
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Admin</FieldLabel>
                      <FieldDescription>
                        Allows the user to access admin features.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Switch
                      disabled={isMe}
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <FieldGroup>
            <form.Field
              name="wishes"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    orientation="horizontal"
                    data-invalid={isInvalid}
                    className="rounded-md border p-4"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Wishes</FieldLabel>
                      <FieldDescription>
                        Access to the wishes app and its features.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      aria-invalid={isInvalid}
                    />
                  </Field>
                );
              }}
            />
          </FieldGroup>

          <FieldGroup>
            <form.Field
              name="f1"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field
                    orientation="horizontal"
                    data-invalid={isInvalid}
                    className="rounded-md border p-4"
                  >
                    <FieldContent>
                      <FieldLabel htmlFor={field.name}>Formula 1</FieldLabel>
                      <FieldDescription>
                        Access to the F1 app and its features.
                      </FieldDescription>
                      {isInvalid && (
                        <FieldError errors={field.state.meta.errors} />
                      )}
                    </FieldContent>
                    <Switch
                      id={field.name}
                      name={field.name}
                      checked={field.state.value}
                      onCheckedChange={field.handleChange}
                      aria-invalid={isInvalid}
                    />
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

          <DialogFooter>
            <Button
              variant="secondary"
              onClick={() => {
                setOpen(false);
                form.reset();
              }}
              disabled={isBusy}
            >
              <HugeiconsIcon icon={X} strokeWidth={2} />
              <span>Cancel</span>
            </Button>
            <Button type="submit" disabled={isBusy}>
              {isBusy ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={Save} strokeWidth={2} />
              )}
              <span>Save</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
