import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { PROFILE_PICTURE_FILE_TYPES, uploadPicture } from "@theapp/schemas";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
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
} from "@theapp/ui/components/field";
import { Input } from "@theapp/ui/components/input";
import { Spinner } from "@theapp/ui/components/spinner";
import { Image01Icon, Upload01Icon, X } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { extractZodIssuesFromValidationError } from "@theapp/webapp/lib/api";
import { setZodIssuesAsFieldErrors } from "@theapp/webapp/lib/forms";
import { meQueryOptions } from "@theapp/webapp/lib/query/auth";
import { useUploadProfilePictureMutation } from "@theapp/webapp/lib/query/profiles";
import { type ComponentProps, type FC, useState } from "react";
import z from "zod";

type DialogTriggerProps = ComponentProps<typeof DialogTrigger>;

export const UploadAvatarDialog: FC<{
  render: NonNullable<DialogTriggerProps["render"]>;
  nativeButton?: DialogTriggerProps["nativeButton"];
}> = ({ render, nativeButton }) => {
  const [open, setOpen] = useState(false);
  const [objectURL, setObjectURL] = useState("");

  const queryClient = useQueryClient();

  const uploadMutation = useUploadProfilePictureMutation({
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: meQueryOptions().queryKey,
      });
      form.reset();
      URL.revokeObjectURL(objectURL);
      setObjectURL("");
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
              fields: {
                file: { message: "An unknown error occurred" },
              },
            },
          });
      }
    },
  });

  const form = useForm({
    defaultValues: {
      file: null as File | null,
    },
    validators: {
      onSubmit: z.object({
        file: uploadPicture.body.shape.file
          .nullable()
          .refine((file) => file !== null, { message: "File is required" }),
      }),
    },
    onSubmit: ({ value }) => {
      // biome-ignore lint/style/noNonNullAssertion: schema guarantees value.file is not null
      uploadMutation.mutate({ file: value.file! });
    },
  });

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger nativeButton={nativeButton} render={render} />
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Pick a new look</DialogTitle>
          <DialogDescription>
            Upload a picture so we can recognize you
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
              name="file"
              listeners={{
                onChange: ({ value }) => {
                  setObjectURL((prev) => {
                    if (prev) URL.revokeObjectURL(prev);
                    return value ? URL.createObjectURL(value) : "";
                  });
                },
              }}
              children={(field) => {
                const isInvalid =
                  field.state.meta.isTouched && !field.state.meta.isValid;
                return (
                  <Field data-invalid={isInvalid}>
                    <div className="grid place-items-center p-4">
                      <Avatar className="size-24">
                        <AvatarImage
                          src={objectURL || undefined}
                          alt="Avatar preview"
                        />
                        <AvatarFallback>
                          <HugeiconsIcon icon={Image01Icon} strokeWidth={2} />
                        </AvatarFallback>
                      </Avatar>
                    </div>
                    <Input
                      disabled={uploadMutation.isPending}
                      id={field.name}
                      name={field.name}
                      onBlur={field.handleBlur}
                      onChange={(e) =>
                        field.handleChange(e.target.files?.item(0) ?? null)
                      }
                      aria-invalid={isInvalid}
                      type="file"
                    />
                    <FieldDescription>
                      {PROFILE_PICTURE_FILE_TYPES.join(", ")} files are
                      supported
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
              disabled={uploadMutation.isPending}
              variant="secondary"
              onClick={() => {
                form.reset();
                URL.revokeObjectURL(objectURL);
                setObjectURL("");
                setOpen(false);
              }}
            >
              <HugeiconsIcon icon={X} strokeWidth={2} />
              <span>Cancel</span>
            </Button>
            <Button disabled={uploadMutation.isPending} type="submit">
              {uploadMutation.isPending ? (
                <Spinner />
              ) : (
                <HugeiconsIcon icon={Upload01Icon} strokeWidth={2} />
              )}
              <span>Upload</span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
