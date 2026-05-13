import * as React from "react";
import { cn } from "@/lib/utils";

export function Badge({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "inline-flex w-fit items-center rounded-md border px-2 py-1 text-xs font-semibold shadow-sm",
        className
      )}
      {...props}
    />
  );
}
