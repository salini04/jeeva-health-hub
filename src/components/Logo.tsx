import { Link } from "@tanstack/react-router";
import { HeartPulse } from "lucide-react";

export function Logo({ subtle }: { subtle?: boolean }) {
  return (
    <Link to="/" className="flex items-center gap-2.5">
      <span className="grid size-9 place-items-center rounded-xl bg-primary text-primary-foreground shadow-soft">
        <HeartPulse className="size-5" />
      </span>
      <span className="leading-tight">
        <span className="block font-display text-lg font-semibold tracking-tight">Jeeva</span>
        {!subtle && <span className="block text-[11px] text-muted-foreground">Smarter health insights</span>}
      </span>
    </Link>
  );
}
