import { ShieldAlert } from "lucide-react";
import { cn } from "@/lib/utils";

export function Disclaimer({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <div
      className={cn(
        "flex items-start gap-3 rounded-xl border border-warning/40 bg-warning/10 px-4 py-3 text-sm text-foreground/80",
        className,
      )}
    >
      <ShieldAlert className="mt-0.5 size-4 shrink-0 text-warning-foreground" />
      <p className={cn(compact && "text-xs")}>
        <span className="font-semibold text-foreground">Medical disclaimer:</span> Jeeva's risk assessments and AI
        assistant are informational and educational only. They are not a medical diagnosis, treatment plan or
        substitute for advice from a qualified healthcare professional.
      </p>
    </div>
  );
}
