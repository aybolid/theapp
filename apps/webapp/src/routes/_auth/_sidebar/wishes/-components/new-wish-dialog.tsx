import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import {
  createWishBodySchema,
  MAX_WISH_NOTE_LEN_AFTER_TRIM,
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
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
  InputGroupText,
  InputGroupTextarea,
} from "@theapp/ui/components/input-group";
import { Spinner } from "@theapp/ui/components/spinner";
import { PlusSignIcon, X } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { cn } from "@theapp/ui/lib/utils";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import { useGetUrlMetadataMutation } from "@theapp/webapp/lib/query/misc";
import {
  useCreateWishMutation,
  wishesQueryOptions,
} from "@theapp/webapp/lib/query/wishes";
import { parseAsBoolean, useQueryState } from "nuqs";
import type { ComponentProps, FC } from "react";

type DialogTriggerProps = ComponentProps<typeof DialogTrigger>;

export const NewWishDialog: FC<{
  render: NonNullable<DialogTriggerProps["render"]>;
  nativeButton?: DialogTriggerProps["nativeButton"];
}> = ({ render, nativeButton }) => {
  const [open, setOpen] = useQueryState(
    "newWish",
    parseAsBoolean.withDefault(false),
  );

  const queryClient = useQueryClient();

  const createMutation = useCreateWishMutation({
    onSuccess: (wish) => {
      queryClient.setQueryData<WishResponse[]>(
        wishesQueryOptions.queryKey,
        (prev) => [wish, ...(prev ?? [])],
      );
      queryClient.invalidateQueries({ queryKey: wishesQueryOptions.queryKey });
      form.reset();
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
      name: "",
      note: "",
      link: "",
    },
    validators: {
      onSubmit: createWishBodySchema,
    },
    onSubmit: ({ value }) => createMutation.mutate(value),
  });

  const getUrlMetadataMutation = useGetUrlMetadataMutation({
    onSettled: (data) => {
      if (data) {
        if (form.getFieldValue("name").trim() === "") {
          form.setFieldValue("name", data.title);
        }
        if (form.getFieldValue("note").trim() === "") {
          form.setFieldValue("note", data.description);
        }
      }
    },
  });

  const isBusy = form.state.isSubmitting || createMutation.isPending;

  return (
    <Dialog open={open} onOpenChange={(v) => setOpen(v)}>
      <DialogTrigger nativeButton={nativeButton} render={render} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create wish</DialogTitle>
          <DialogDescription>Add new wish with details below</DialogDescription>
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
              name="link"
              listeners={{
                onChangeDebounceMs: 200,
                onChange: ({ value, fieldApi }) => {
                  if (fieldApi.state.meta.isValid) {
                    getUrlMetadataMutation.mutate({ url: value });
                  }
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Link</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        placeholder="https://"
                      />
                      {getUrlMetadataMutation.isPending && (
                        <InputGroupAddon align="inline-end">
                          <Spinner />
                        </InputGroupAddon>
                      )}
                    </InputGroup>
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
              name="name"
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                    <InputGroup>
                      <InputGroupInput
                        id={field.name}
                        name={field.name}
                        value={field.state.value}
                        onBlur={field.handleBlur}
                        onChange={(e) => field.handleChange(e.target.value)}
                        aria-invalid={isInvalid}
                        autoComplete="off"
                        placeholder="New boots"
                      />
                      {field.state.value.trim() && (
                        <InputGroupAddon align="inline-end">
                          <InputGroupButton
                            onClick={() => field.setValue("")}
                            variant="destructive"
                          >
                            <HugeiconsIcon icon={X} strokeWidth={2} />
                          </InputGroupButton>
                        </InputGroupAddon>
                      )}
                    </InputGroup>
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
                        {trimmedValue && (
                          <InputGroupButton
                            onClick={() => field.setValue("")}
                            className="ml-auto"
                            variant="destructive"
                          >
                            <HugeiconsIcon icon={X} strokeWidth={2} />
                          </InputGroupButton>
                        )}
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
              disabled={isBusy || getUrlMetadataMutation.isPending}
            >
              <HugeiconsIcon icon={X} strokeWidth={2} />
              <span>Cancel</span>
            </Button>
            <Button
              type="submit"
              disabled={isBusy || getUrlMetadataMutation.isPending}
            >
              {isBusy ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={PlusSignIcon} strokeWidth={2} />
              )}
              <span>Create</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
