import { Badge } from "@theapp/ui/components/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@theapp/ui/components/tooltip";
import { cn } from "@theapp/ui/lib/utils";
import type { ComponentPropsWithoutRef, FC } from "react";

export const UuidDisplay: FC<
  { uuid: string } & ComponentPropsWithoutRef<typeof Badge>
> = ({ uuid, className, ...props }) => {
  const split = uuid.split("-");
  const lastPart = split.pop();

  return (
    <Tooltip>
      <TooltipTrigger
        render={
          <Badge
            variant="link"
            {...props}
            className={cn("cursor-pointer px-0", className)}
          >
            {lastPart}
          </Badge>
        }
      />
      <TooltipContent className="font-mono">
        {split.join("-")}-<span className="text-primary">{lastPart}</span>
      </TooltipContent>
    </Tooltip>
  );
};
