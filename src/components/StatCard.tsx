import type { LucideIcon } from "lucide-react";
import { cn } from "@/lib/utils";

export function StatCard({
  icon: Icon,
  label,
  value,
  unit,
  hint,
  tone = "default",
}: {
  icon: LucideIcon;
  label: string;
  value: string | number;
  unit?: string;
  hint?: string;
  tone?: "default" | "good" | "warn" | "bad";
}) {
  const toneClass = {
    default: "bg-primary/10 text-primary",
    good: "bg-success/15 text-success",
    warn: "bg-warning/20 text-warning-foreground",
    bad: "bg-destructive/12 text-destructive",
  }[tone];

  return (
    <div className="card-soft p-4">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
          <p className="mt-1.5 font-display text-2xl font-semibold">
            {value}
            {unit && <span className="ml-1 text-sm font-medium text-muted-foreground">{unit}</span>}
          </p>
        </div>
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-lg", toneClass)}>
          <Icon className="size-4" />
        </span>
      </div>
      {hint && <p className="mt-2 text-xs text-muted-foreground">{hint}</p>}
    </div>
  );
}
