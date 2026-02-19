import { useForm } from "@tanstack/react-form";
import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import {
  type ProfileResponse,
  profilesPatchBodySchema,
  type UserResponse,
} from "@theapp/server/schemas";
import { Avatar, AvatarFallback } from "@theapp/ui/components/avatar";
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
} from "@theapp/ui/components/input-group";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemGroup,
  ItemMedia,
  ItemTitle,
} from "@theapp/ui/components/item";
import { Spinner } from "@theapp/ui/components/spinner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@theapp/ui/components/tabs";
import {
  Login01Icon,
  Logout01Icon,
  Mail01Icon,
  SecurityIcon,
  Tick01Icon,
  User02Icon,
} from "@theapp/ui/icons/huge";
import {
  HugeiconsIcon,
  type IconSvgElement,
} from "@theapp/ui/icons/huge-react";
import dayjs from "dayjs";
import type { ComponentProps, FC } from "react";
import z from "zod";
import { extractZodIssuesFromValidationError } from "../lib/api";
import { setZodIssuesAsFieldErrors } from "../lib/forms";
import {
  meQueryOptions,
  useMeSuspenseQuery,
  useSignoutMutation,
} from "../lib/query/auth";
import { useUpdateProfile } from "../lib/query/profiles";

export const UserAccountDialog: FC<{
  render: NonNullable<ComponentProps<typeof DialogTrigger>["render"]>;
}> = ({ render }) => {
  const router = useRouter();
  const meQuery = useMeSuspenseQuery();

  const signoutMutation = useSignoutMutation({
    onSettled: () => router.invalidate(),
  });

  const profileDetails: {
    title: string;
    icon: IconSvgElement;
    render: string;
  }[] = [
    {
      title: "Email",
      icon: Mail01Icon,
      render: meQuery.data.email,
    },
    {
      title: "Member since",
      icon: Login01Icon,
      render: dayjs(meQuery.data.createdAt).format("MMMM D, YYYY"),
    },
  ];

  return (
    <Dialog>
      <DialogTrigger render={render} />
      <DialogContent>
        <Tabs defaultValue="profile" className="contents">
          <DialogHeader>
            <DialogTitle className="sr-only">User account</DialogTitle>
            <DialogDescription className="sr-only">
              View profile and access security settings
            </DialogDescription>
            <TabsList>
              <TabsTrigger value="profile">
                <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security">
                <HugeiconsIcon icon={SecurityIcon} strokeWidth={2} />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>
          </DialogHeader>
          <TabsContent value="profile">
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <Avatar className="size-16">
                <AvatarFallback>
                  <HugeiconsIcon icon={User02Icon} strokeWidth={2} />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center justify-center">
                <h2 className="font-medium">{meQuery.data.profile.name}</h2>
                <p className="text-muted-foreground text-xs">
                  {meQuery.data.email}
                </p>
              </div>
            </div>
            <div className="pt-4">
              <h3 className="text-muted-foreground">Profile details</h3>
              <ItemGroup className="gap-2 pt-4">
                <Item variant="outline">
                  <NameForm profile={meQuery.data.profile} />
                </Item>
                {profileDetails.map((detail) => (
                  <Item key={detail.title} variant="muted">
                    <ItemMedia variant="icon">
                      <HugeiconsIcon icon={detail.icon} strokeWidth={2} />
                    </ItemMedia>
                    <ItemContent>
                      <ItemTitle>{detail.title}</ItemTitle>
                      <ItemDescription>{detail.render}</ItemDescription>
                    </ItemContent>
                  </Item>
                ))}
              </ItemGroup>
            </div>
          </TabsContent>
        </Tabs>
        <DialogFooter>
          <Button
            variant="destructive"
            disabled={signoutMutation.isPending}
            onClick={() => signoutMutation.mutate()}
          >
            {signoutMutation.isPending ? (
              <Spinner />
            ) : (
              <HugeiconsIcon icon={Logout01Icon} strokeWidth={2} />
            )}
            <span>Sign Out</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const nameSchema = z.object({
  name: profilesPatchBodySchema.shape.name.nonoptional(),
});

const NameForm: FC<{ profile: ProfileResponse }> = ({ profile }) => {
  const queryClient = useQueryClient();

  const updateMutation = useUpdateProfile(profile.profileId, {
    onSuccess: (profile) => {
      form.setFieldValue("name", profile.name);
      queryClient.setQueryData<UserResponse>(
        meQueryOptions.queryKey,
        (prev) => {
          if (!prev) return undefined;
          const clone = structuredClone(prev);
          clone.profile.name = profile.name;
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
              fields: { name: { message: "An unknown error occurred" } },
            },
          });
      }
    },
  });

  const form = useForm({
    formId: "name-form",
    validators: {
      onSubmit: nameSchema,
    },
    defaultValues: { name: profile.name },
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
          name="name"
          children={(field) => {
            const isInvalid =
              field.state.meta.isTouched && !field.state.meta.isValid;
            return (
              <Field data-invalid={isInvalid}>
                <FieldLabel htmlFor={field.name}>Name</FieldLabel>
                <InputGroup>
                  <InputGroupInput
                    className="text-foreground"
                    id={field.name}
                    name={field.name}
                    value={field.state.value}
                    onBlur={field.handleBlur}
                    onChange={(e) => field.handleChange(e.target.value)}
                    aria-invalid={isInvalid}
                    placeholder="Your name"
                  />
                  {field.state.value.trim() !== profile.name && (
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
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
