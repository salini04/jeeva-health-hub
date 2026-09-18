import { createFileRoute } from "@tanstack/react-router";
import { Bell, CalendarDays, Droplets, HeartPulse } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/notifications")({
  head: () => ({
    meta: [
      { title: "Notifications — Jeeva" },
      { name: "description", content: "Reminders for logging vitals, hydration, upcoming appointments and wellness check-ins." },
      { property: "og:title", content: "Notifications — Jeeva" },
      { property: "og:description", content: "Stay on top of your daily health habits with gentle reminders." },
    ],
  }),
  component: Notifications,
});

const icons = { reminder: Bell, hydration: Droplets, appointment: CalendarDays, wellness: HeartPulse };

function Notifications() {
  const { notifications, update } = useApp();

  return (
    <AppShell
      title="Notifications & reminders"
      actions={
        <Button size="sm" variant="outline" onClick={() => update({ notifications: notifications.map((n) => ({ ...n, read: true })) })}>
          Mark all read
        </Button>
      }
    >
      <div className="space-y-3">
        {notifications.map((n) => {
          const Icon = icons[n.type];
          return (
            <div key={n.id} className="card-soft flex items-start gap-4 p-4">
              <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-primary/10 text-primary"><Icon className="size-5" /></span>
              <div className="flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{n.title}</p>
                  {!n.read && <Badge variant="secondary">New</Badge>}
                </div>
                <p className="text-sm text-muted-foreground">{n.body}</p>
                <p className="mt-1 text-xs text-muted-foreground">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              {!n.read && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => update({ notifications: notifications.map((x) => (x.id === n.id ? { ...x, read: true } : x)) })}
                >
                  Dismiss
                </Button>
              )}
            </div>
          );
        })}
      </div>
    </AppShell>
  );
}
