import { Badge } from "@theapp/ui/components/badge";
import { Button } from "@theapp/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@theapp/ui/components/tooltip";
import { Copy01Icon, Tick01Icon } from "@theapp/ui/icons/huge";
import { HugeiconsIcon } from "@theapp/ui/icons/huge-react";
import { toast } from "@theapp/ui/lib/sonner";
import { cn } from "@theapp/ui/lib/utils";
import { type ComponentPropsWithoutRef, type FC, useState } from "react";
import { copyToClipboard } from "../lib/utils";

export const UuidDisplay: FC<
  { uuid: string } & ComponentPropsWithoutRef<"div">
> = ({ uuid, className, ...props }) => {
  const [isCopied, setIsCopied] = useState(false);

  const lastPart = uuid.split("-").pop();

  return (
    <div className={cn("flex items-center gap-1", className)} {...props}>
      <Tooltip>
        <TooltipTrigger render={<Badge variant="outline">{lastPart}</Badge>} />
        <TooltipContent className="font-mono text-sm">{uuid}</TooltipContent>
      </Tooltip>
      <Button
        disabled={isCopied}
        size="icon-xs"
        variant="ghost"
        onClick={() => {
          setIsCopied(true);
          copyToClipboard(uuid, {
            onSuccess: () => setTimeout(() => setIsCopied(false), 1000),
            onError: () => toast.error("Failed to copy"),
          });
        }}
      >
        <HugeiconsIcon
          icon={isCopied ? Tick01Icon : Copy01Icon}
          strokeWidth={2}
        />
      </Button>
    </div>
  );
};
