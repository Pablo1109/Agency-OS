import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "teal"
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "teal" | "gold" | "coral" | "slate";
}) {
  const tones = {
    teal: "bg-primary/10 text-primary",
    gold: "bg-secondary/20 text-amber-700",
    coral: "bg-accent/10 text-accent",
    slate: "bg-slate-100 text-slate-600"
  };

  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 p-5">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-md", tones[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </CardContent>
    </Card>
  );
}
