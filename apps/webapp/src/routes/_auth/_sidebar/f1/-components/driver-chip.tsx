import type { F1Driver } from "@theapp/schemas";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@theapp/ui/components/avatar";
import {
  Item,
  ItemContent,
  ItemDescription,
  ItemTitle,
} from "@theapp/ui/components/item";
import { UserIcon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import type { FC } from "react";

export const DriverChip: FC<{ driver: F1Driver }> = ({ driver }) => {
  return (
    <Item className="flex-nowrap p-0">
      <Avatar style={{ backgroundColor: `#${driver.team_colour}` }}>
        <AvatarImage
          src={driver.headshot_url ?? undefined}
          alt={driver.full_name ?? "Headshot"}
        />
        <AvatarFallback>
          {driver.name_acronym ?? (
            <HugeiconsIcon icon={UserIcon} strokeWidth={2} />
          )}
        </AvatarFallback>
      </Avatar>
      <ItemContent className="gap-0">
        <ItemTitle className="text-nowrap">
          {driver.full_name ?? "Unknown Driver"}
        </ItemTitle>
        <ItemDescription className="text-nowrap text-xs">
          #{driver.driver_number} | {driver.team_name ?? "Unknown Team"}
        </ItemDescription>
      </ItemContent>
    </Item>
  );
};
