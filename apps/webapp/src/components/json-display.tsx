import { cn } from "@theapp/ui/lib/utils";
import type { ComponentProps, FC } from "react";

export const JsonDisplay: FC<{ value: unknown } & ComponentProps<"pre">> = ({
  value: error,
  className,
  ...props
}) => {
  return (
    <pre
      {...props}
      className={cn(
        "text-wrap rounded-md border bg-card p-4 text-sm",
        className,
      )}
    >
      {JSON.stringify(error, null, 2)}
    </pre>
  );
};
