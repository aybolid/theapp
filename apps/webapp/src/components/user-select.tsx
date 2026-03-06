import type { UserResponse } from "@theapp/schemas";
import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@theapp/ui/components/combobox";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@theapp/ui/components/item";
import type { FC } from "react";
import { normalize } from "../lib/utils";
import { UserAvatar } from "./user-avatar";

export const UserSelect: FC<{
  users: UserResponse[];
  value?: string;
  onValueChange?: (user: UserResponse | null) => void;
}> = ({ users, value, onValueChange }) => {
  const valueUser = users.find((user) => user.userId === value) ?? null;

  const disabled = users.length === 0;

  return (
    <Combobox
      disabled={disabled}
      value={valueUser}
      onValueChange={onValueChange}
      items={users}
      itemToStringLabel={(user: UserResponse) => user.profile.name}
      itemToStringValue={(user: UserResponse) => user.userId}
      filter={(user, needle) => {
        needle = normalize(needle);
        const nameMatches = normalize(user.profile.name).includes(needle);
        const emailMatches = normalize(user.email).includes(needle);
        return nameMatches || emailMatches;
      }}
    >
      <ComboboxInput
        placeholder={users.length === 0 ? "No users found" : "Select user"}
        showClear
        disabled={disabled}
      />
      <ComboboxContent>
        <ComboboxEmpty>No users found.</ComboboxEmpty>
        <ComboboxList>
          {(user: UserResponse) => (
            <ComboboxItem key={user.userId} value={user}>
              <Item className="flex-nowrap p-1">
                <UserAvatar user={user} />
                <ItemContent className="gap-0">
                  <ItemTitle className="text-nowrap">
                    {user.profile.name}
                  </ItemTitle>
                  <ItemDescription className="text-nowrap text-xs">
                    {user.email}
                  </ItemDescription>
                </ItemContent>
              </Item>
            </ComboboxItem>
          )}
        </ComboboxList>
      </ComboboxContent>
    </Combobox>
  );
};
