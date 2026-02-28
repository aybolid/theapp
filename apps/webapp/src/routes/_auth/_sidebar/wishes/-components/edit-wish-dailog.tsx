import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  MAX_WISH_NOTE_LEN_AFTER_TRIM,
  patchWishBodySchema,
  type WishResponse,
} from "@theapp/schemas";
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
  FieldError,
  FieldGroup,
  FieldLabel,
} from "@theapp/ui/components/field";
import { Input } from "@theapp/ui/components/input";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupText,
  InputGroupTextarea,
} from "@theapp/ui/components/input-group";
import { Spinner } from "@theapp/ui/components/spinner";
import { Save, X } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import {
  useUpdateWishMutation,
  wishesQueryOptions,
} from "@theapp/webapp/lib/query/wishes";
import { type ComponentProps, type FC, useState } from "react";
import z from "zod";

type DialogTriggerProps = ComponentProps<typeof DialogTrigger>;

const schema = z.object({
  name: patchWishBodySchema.shape.name.nonoptional(),
  note: patchWishBodySchema.shape.note.nonoptional(),
  isCompleted: patchWishBodySchema.shape.isCompleted.nonoptional(),
});

export const EditWishDialog: FC<{
  wish: WishResponse;
  render: NonNullable<DialogTriggerProps["render"]>;
  nativeButton?: DialogTriggerProps["nativeButton"];
}> = ({ render, nativeButton, wish }) => {
  const [open, setOpen] = useState(false);

  const queryClient = useQueryClient();

  const updateMutation = useUpdateWishMutation({
    onSuccess: (wish) => {
      queryClient.setQueryData<WishResponse[]>(
        wishesQueryOptions.queryKey,
        (prev) => prev?.map((w) => (w.wishId === wish.wishId ? wish : w)),
      );
      queryClient.invalidateQueries({ queryKey: wishesQueryOptions.queryKey });
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
      name: wish.name,
      note: wish.note,
      isCompleted: wish.isCompleted,
    },
    validators: {
      onSubmit: schema,
    },
    onSubmit: ({ value }) =>
      updateMutation.mutate({ wishId: wish.wishId, ...value }),
  });

  const isBusy = form.state.isSubmitting || updateMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger nativeButton={nativeButton} render={render} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Change your wish</DialogTitle>
          <DialogDescription>
            Made a mistake? No worries, fix it here.
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
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <Input
                      id={field.name}
                      name={field.name}
                      value={field.state.value}
                      onBlur={field.handleBlur}
                      onChange={(e) => field.handleChange(e.target.value)}
                      aria-invalid={isInvalid}
                      autoComplete="off"
                      placeholder="New boots"
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
              name="note"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                const trimmedValue = field.state.value.trim();
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Note</FieldLabel>
                    <InputGroup>
                      <InputGroupTextarea
                        className="max-h-48"
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        placeholder="Green color, 42 size"
                      />
                      <InputGroupAddon align="block-end">
                        <InputGroupText
                          className={cn("font-mono text-xs", {
                            "text-destructive":
                              trimmedValue.length >
                              MAX_WISH_NOTE_LEN_AFTER_TRIM,
                          })}
                        >
                          {trimmedValue.length}/{MAX_WISH_NOTE_LEN_AFTER_TRIM}
                        </InputGroupText>
                      </InputGroupAddon>
                    </InputGroup>
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
