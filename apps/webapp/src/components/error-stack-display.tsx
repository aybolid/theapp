import { cn } from "@theapp/ui/lib/utils";
import type { ComponentProps, FC } from "react";

export const ErrorStackDisplay: FC<
  { error: Error } & ComponentProps<"pre">
> = ({ error, className, ...props }) => {
  return (
    <pre
      {...props}
      className={cn(
        "text-wrap rounded-md border bg-card p-4 text-sm",
        className,
      )}
    >
      {error.stack
        ? error.stack.split("\n").map((line, index) => (
            <p
              className={
                line.includes("node_modules")
                  ? "text-muted-foreground"
                  : "text-destructive"
              }
              key={index}
            >
              {line}
            </p>
          ))
        : String(error)}
    </pre>
  );
};
