import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { createInviteBodySchema } from "@theapp/schemas";
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
  FieldDescription,
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@theapp/ui/components/field";
import { Input } from "@theapp/ui/components/input";
import { Spinner } from "@theapp/ui/components/spinner";
import { UserPlus, X } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import {
  invitesQueryOptions,
  useCreateInviteMutation,
} from "@theapp/webapp/lib/query/invites";
import { type ComponentProps, type FC, useState } from "react";

type DialogTriggerProps = ComponentProps<typeof DialogTrigger>;

export const InviteUserDialog: FC<{
  render: NonNullable<DialogTriggerProps["render"]>;
  nativeButton?: DialogTriggerProps["nativeButton"];
}> = ({ render, nativeButton }) => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const createMutation = useCreateInviteMutation({
    onSuccess: (invite) => {
      queryClient.setQueryData(invitesQueryOptions.queryKey, (prev) => [
        invite,
        ...(prev ?? []),
      ]);
      queryClient.invalidateQueries({ queryKey: invitesQueryOptions.queryKey });
      form.reset();
      setOpen(false);
    },
    onError: (err) => {
      const issues =
        err.status === 422
          ? extractZodIssuesFromValidationError(err.value)
          : null;

      switch (err.status) {
        case 409:
          form.setErrorMap({
            onSubmit: {
              fields: {
                email: { message: err.value },
              },
            },
          });
          break;
        // biome-ignore lint/suspicious/noFallthroughSwitchClause: expected
        case 422:
          if (issues) {
            setZodIssuesAsFieldErrors(form, issues);
            break;
          }
        default:
          form.setErrorMap({
            onSubmit: {
              fields: {
                email: { message: "An unknown error occurred" },
              },
            },
          });
      }
    },
  });

  const form = useForm({
    defaultValues: {
      email: "",
    },
    validators: {
      onSubmit: createInviteBodySchema,
    },
    onSubmit: ({ value }) => createMutation.mutate(value),
  });

  const isBusy = form.state.isSubmitting || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger nativeButton={nativeButton} render={render} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Bring someone in</DialogTitle>
          <DialogDescription>Send an invite link to a friend</DialogDescription>
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
              name="email"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Email</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      type="email"
                      placeholder="example@mail.com"
                    />
                    <FieldDescription>
                      They'll get an email with a link to join the group
                    </FieldDescription>
                    {isInvalid && (
                      <FieldError errors={field.state.meta.errors} />
                    )}
                  </Field>
                );
              }}
            />
          </FieldGroup>

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
                <HugeiconsIcon icon={UserPlus} strokeWidth={2} />
              )}
              <span>Invite</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
