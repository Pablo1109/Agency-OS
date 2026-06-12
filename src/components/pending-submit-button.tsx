"use client";

import { useFormStatus } from "react-dom";
import type { LucideIcon } from "lucide-react";
import { Button, type ButtonProps } from "@/components/ui/button";

type PendingSubmitButtonProps = ButtonProps & {
  idleLabel: string;
  pendingLabel: string;
  icon?: LucideIcon;
};

export function PendingSubmitButton({
  idleLabel,
  pendingLabel,
  icon: Icon,
  disabled,
  children,
  ...props
}: PendingSubmitButtonProps) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={disabled || pending} {...props}>
      {Icon ? <Icon className="h-4 w-4" /> : null}
      {pending ? pendingLabel : children || idleLabel}
    </Button>
  );
}
