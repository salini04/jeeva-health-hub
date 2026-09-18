import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Activity,
  Bell,
  Bot,
  CalendarDays,
  Droplets,
  Footprints,
  Gauge,
  HeartPulse,
  Moon,
  Scale,
  Stethoscope,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { AppShell } from "@/components/AppShell";
import { StatCard } from "@/components/StatCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";
import { bmiCategory, bmiFrom } from "@/services/mlService";

export const Route = createFileRoute("/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard — Jeeva" },
      { name: "description", content: "Your personalised health dashboard: BMI, vitals, risk summaries, trends and reminders." },
      { property: "og:title", content: "Dashboard — Jeeva" },
      { property: "og:description", content: "BMI, vitals, risk summaries, trend charts and upcoming appointments at a glance." },
    ],
  }),
  component: Dashboard,
});

const fmt = (d: string) => new Date(d).toLocaleDateString(undefined, { month: "short", day: "numeric" });

function Dashboard() {
  const { profile, vitals, appointments, notifications, risks, auth } = useApp();
  const latest = vitals[vitals.length - 1]!;
  const recent = vitals.slice(-14).map((v) => ({ ...v, label: fmt(v.date) }));
  const bmi = bmiFrom(profile.heightCm, latest.weightKg);
  const cat = bmiCategory(bmi);
  const upcoming = appointments.filter((a) => a.status === "upcoming");
  const unread = notifications.filter((n) => !n.read);
  const firstName = (auth.guest ? "there" : auth.name || profile.name).split(" ")[0];

  return (
    <AppShell
      title={`Good to see you, ${firstName}`}
      description="Here's how your health is trending this fortnight."
      actions={
        <Button asChild size="sm" className="hidden sm:inline-flex">
          <Link to="/tracker">Log vitals</Link>
        </Button>
      }
    >
      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard icon={Scale} label="BMI" value={bmi.toFixed(1)} hint={cat.label} tone={cat.tone} />
        <StatCard icon={Gauge} label="Blood pressure" value={`${latest.systolic}/${latest.diastolic}`} unit="mmHg" hint="Latest reading" tone={latest.systolic > 130 ? "warn" : "good"} />
        <StatCard icon={HeartPulse} label="Resting heart rate" value={latest.heartRate} unit="bpm" hint="Latest reading" tone={latest.heartRate > 85 ? "warn" : "good"} />
        <StatCard icon={Droplets} label="Glucose" value={latest.glucose} unit="mg/dL" hint="Fasting, latest" tone={latest.glucose > 110 ? "warn" : "good"} />
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-5 lg:col-span-2">
          <div className="flex items-center justify-between">
            <h2 className="text-base font-semibold">Vitals trend (14 days)</h2>
            <Badge variant="secondary">Blood pressure</Badge>
          </div>
          <div className="mt-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={recent}>
                <defs>
                  <linearGradient id="sys" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-chart-1)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--color-chart-1)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <YAxis domain={[60, 150]} tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" width={32} />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)", color: "var(--color-foreground)" }} />
                <Area type="monotone" dataKey="systolic" name="Systolic" stroke="var(--color-chart-1)" fill="url(#sys)" strokeWidth={2} />
                <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="card-soft space-y-4 p-5">
          <h2 className="text-base font-semibold">Risk summary</h2>
          {(["heart", "diabetes"] as const).map((k) => {
            const r = risks[k];
            return (
              <div key={k} className="rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-medium capitalize">{k === "heart" ? "Heart disease" : "Type-2 diabetes"}</p>
                  {r ? (
                    <Badge variant={r.tier === "High" ? "destructive" : r.tier === "Moderate" ? "secondary" : "default"}>{r.tier}</Badge>
                  ) : (
                    <Badge variant="outline">Not run</Badge>
                  )}
                </div>
                {r ? (
                  <>
                    <p className="mt-2 font-display text-2xl font-semibold">{r.score}%</p>
                    <Progress value={r.score} className="mt-2" />
                    <p className="mt-2 text-xs text-muted-foreground">Top factor: {r.factors[0]?.label ?? "—"}</p>
                  </>
                ) : (
                  <Button asChild size="sm" variant="outline" className="mt-3 w-full">
                    <Link to={k === "heart" ? "/risk/heart" : "/risk/diabetes"}>Run assessment</Link>
                  </Button>
                )}
              </div>
            );
          })}
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        <div className="card-soft p-5">
          <h2 className="text-base font-semibold">Activity this fortnight</h2>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={recent}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Bar dataKey="activityMinutes" name="Active minutes" fill="var(--color-chart-3)" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-3 gap-2 text-center text-xs">
            <div><Footprints className="mx-auto size-4 text-primary" /><p className="mt-1 font-semibold">{latest.steps.toLocaleString()}</p><p className="text-muted-foreground">steps</p></div>
            <div><Droplets className="mx-auto size-4 text-teal" /><p className="mt-1 font-semibold">{latest.waterLitres} L</p><p className="text-muted-foreground">water</p></div>
            <div><Moon className="mx-auto size-4 text-primary" /><p className="mt-1 font-semibold">{latest.sleepHours} h</p><p className="text-muted-foreground">sleep</p></div>
          </div>
        </div>

        <div className="card-soft p-5">
          <h2 className="text-base font-semibold">Weight trend</h2>
          <div className="mt-4 h-48">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={vitals.slice(-60).map((v) => ({ ...v, label: fmt(v.date) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} minTickGap={24} stroke="var(--color-muted-foreground)" />
                <YAxis domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} axisLine={false} fontSize={11} width={32} stroke="var(--color-muted-foreground)" />
                <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                <Line type="monotone" dataKey="weightKg" name="Weight (kg)" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="space-y-4">
          <div className="card-soft p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold"><CalendarDays className="size-4 text-primary" /> Upcoming appointments</h2>
            <ul className="mt-3 space-y-3">
              {upcoming.length === 0 && <li className="text-sm text-muted-foreground">No upcoming visits.</li>}
              {upcoming.map((a) => (
                <li key={a.id} className="rounded-lg border border-border p-3 text-sm">
                  <p className="font-medium">{a.doctorName}</p>
                  <p className="text-xs text-muted-foreground">{a.specialty} · {a.mode}</p>
                  <p className="mt-1 text-xs">{new Date(a.date).toDateString()} at {a.time}</p>
                </li>
              ))}
            </ul>
            <Button asChild variant="outline" size="sm" className="mt-3 w-full">
              <Link to="/appointments">Manage appointments</Link>
            </Button>
          </div>

          <div className="card-soft p-5">
            <h2 className="flex items-center gap-2 text-base font-semibold"><Bell className="size-4 text-primary" /> Reminders</h2>
            <ul className="mt-3 space-y-2 text-sm">
              {unread.slice(0, 3).map((n) => (
                <li key={n.id} className="rounded-lg bg-muted/60 p-3">
                  <p className="font-medium">{n.title}</p>
                  <p className="text-xs text-muted-foreground">{n.body}</p>
                </li>
              ))}
              {unread.length === 0 && <li className="text-sm text-muted-foreground">You're all caught up.</li>}
            </ul>
          </div>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { to: "/risk/heart", icon: HeartPulse, label: "Heart risk check" },
          { to: "/tracker", icon: Activity, label: "Log today's vitals" },
          { to: "/assistant", icon: Bot, label: "Ask Jeeva Assistant" },
          { to: "/doctors", icon: Stethoscope, label: "Book a doctor" },
        ].map((q) => (
          <Link key={q.to} to={q.to} className="card-soft flex items-center gap-3 p-4">
            <span className="grid size-10 place-items-center rounded-xl bg-primary/10 text-primary"><q.icon className="size-5" /></span>
            <span className="text-sm font-medium">{q.label}</span>
          </Link>
        ))}
      </section>
    </AppShell>
  );
}
