import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import type { Settings } from "@/lib/types";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — Jeeva" },
      { name: "description", content: "Choose measurement units, notification preferences, theme and manage your account." },
      { property: "og:title", content: "Settings — Jeeva" },
      { property: "og:description", content: "Units, notifications, theme and account management." },
    ],
  }),
  component: SettingsPage,
});

const notifLabels: Record<keyof Settings["notifications"], string> = {
  reminders: "Vitals logging reminders",
  hydration: "Hydration nudges",
  appointments: "Appointment alerts",
  weekly: "Weekly wellness check-in",
};

function SettingsPage() {
  const { settings, update, reset, auth } = useApp();
  const navigate = useNavigate();

  return (
    <AppShell title="Settings" description="Preferences, notifications and account.">
      <div className="card-soft space-y-4 p-5">
        <h2 className="text-base font-semibold">Preferences</h2>
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label>Measurement units</Label>
            <Select value={settings.units} onValueChange={(v) => update({ settings: { ...settings, units: v as Settings["units"] } })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="metric">Metric (kg, cm, °C)</SelectItem>
                <SelectItem value="imperial">Imperial (lb, in, °F)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <Label>Theme</Label>
            <Select value={settings.theme} onValueChange={(v) => update({ settings: { ...settings, theme: v as Settings["theme"] } })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="light">Light</SelectItem>
                <SelectItem value="dark">Dark</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      <div className="card-soft space-y-3 p-5">
        <h2 className="text-base font-semibold">Notifications</h2>
        {(Object.keys(notifLabels) as (keyof Settings["notifications"])[]).map((k) => (
          <div key={k} className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
            <p className="text-sm font-medium">{notifLabels[k]}</p>
            <Switch
              checked={settings.notifications[k]}
              onCheckedChange={(v) => update({ settings: { ...settings, notifications: { ...settings.notifications, [k]: v } } })}
            />
          </div>
        ))}
      </div>

      <div className="card-soft space-y-3 p-5">
        <h2 className="text-base font-semibold">Account</h2>
        <p className="text-sm text-muted-foreground">
          {auth.signedIn ? (auth.guest ? "You're exploring in demo guest mode." : `Signed in as ${auth.email}`) : "You're browsing with demo data."}
        </p>
        <div className="flex flex-wrap gap-3">
          <Button
            variant="outline"
            onClick={() => {
              update({ auth: { signedIn: false, guest: false, name: "", email: "" } });
              toast.success("Signed out");
              navigate({ to: "/auth" });
            }}
          >
            Sign out
          </Button>
          <Button
            variant="destructive"
            onClick={() => {
              reset();
              toast.success("Demo data restored");
            }}
          >
            Reset demo data
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
