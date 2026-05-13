import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "./ui/card";
import { cn } from "@/lib/utils";

export function MetricCard({
  title,
  value,
  detail,
  icon: Icon,
  tone = "teal",
  href
}: {
  title: string;
  value: string;
  detail: string;
  icon: LucideIcon;
  tone?: "teal" | "gold" | "coral" | "slate";
  href?: string;
}) {
  const tones = {
    teal: "bg-accent/10 text-accent ring-accent/20",
    gold: "bg-amber-50 text-amber-700 ring-amber-200/70",
    coral: "bg-rose-50 text-rose-700 ring-rose-200/70",
    slate: "bg-slate-100 text-slate-600 ring-slate-200"
  };

  return (
    <Card className="overflow-hidden">
      <CardContent className="relative flex items-start justify-between gap-3 p-5">
        <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/70 via-primary/40 to-transparent" />
        <div className="min-w-0">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="mt-2 text-2xl font-semibold tracking-normal text-foreground">{value}</p>
          <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
        </div>
        {href ? (
          <a
            href={href}
            aria-label={`Abrir ${title}`}
            className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1 transition hover:scale-105", tones[tone])}
          >
            <Icon className="h-5 w-5" />
          </a>
        ) : (
          <div className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-md ring-1", tones[tone])}>
            <Icon className="h-5 w-5" />
          </div>
        )}
      </CardContent>
    </Card>
  );
}
