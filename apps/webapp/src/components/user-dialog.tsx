import { useForm } from "@tanstack/react-form";
import { useRouter } from "@tanstack/react-router";
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
  Check,
  Lock,
  LogIn,
  LogOut,
  type LucideIcon,
  Mail,
  User,
} from "@theapp/ui/icons/lucide";
import dayjs from "dayjs";
import type { FC, PropsWithChildren } from "react";
import { useMeSuspenseQuery, useSignoutMutation } from "../lib/query/auth";

export const UserDialog: FC<PropsWithChildren> = ({ children }) => {
  const router = useRouter();
  const meQuery = useMeSuspenseQuery();

  const signoutMutation = useSignoutMutation({
    onSettled: () => router.invalidate(),
  });

  const profileDetails: {
    title: string;
    icon: LucideIcon;
    render: string;
  }[] = [
    {
      title: "Email",
      icon: Mail,
      render: meQuery.data.email,
    },
    {
      title: "Member since",
      icon: LogIn,
      render: dayjs(meQuery.data.createdAt).format("MMMM D, YYYY"),
    },
  ];

  return (
    <Dialog>
      <DialogTrigger asChild>{children}</DialogTrigger>
      <DialogContent>
        <Tabs defaultValue="profile" className="contents">
          <DialogHeader>
            <DialogTitle className="sr-only">User account</DialogTitle>
            <DialogDescription className="sr-only">
              View profile and access security settings
            </DialogDescription>
            <TabsList>
              <TabsTrigger value="profile">
                <User />
                <span>Profile</span>
              </TabsTrigger>
              <TabsTrigger value="security">
                <Lock />
                <span>Security</span>
              </TabsTrigger>
            </TabsList>
          </DialogHeader>
          <TabsContent value="profile">
            <div className="flex flex-col items-center justify-center gap-2 py-4">
              <Avatar className="size-16">
                <AvatarFallback>
                  <User />
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center justify-center">
                <h2 className="font-medium">Unknown User</h2>
                <p className="text-muted-foreground text-xs">
                  {meQuery.data.email}
                </p>
              </div>
            </div>
            <div className="pt-4">
              <h3 className="text-muted-foreground">Profile details</h3>
              <ItemGroup className="gap-2 pt-4">
                <Item variant="outline">
                  <NameForm defaultValue="Unknown Name" />
                </Item>
                {profileDetails.map((detail) => (
                  <Item key={detail.title} variant="outline">
                    <ItemMedia variant="icon">
                      <detail.icon />
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
            {signoutMutation.isPending ? <Spinner /> : <LogOut />}
            <span>Sign Out</span>
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

const NameForm: FC<{ defaultValue: string }> = ({ defaultValue }) => {
  const form = useForm({
    formId: "name-form",
    defaultValues: { name: defaultValue },
  });

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
                  {field.state.value.trim() !== defaultValue && (
                    <InputGroupAddon align="inline-end">
                      <InputGroupButton
                        title="Save"
                        type="submit"
                        variant="default"
                      >
                        <Check />
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
