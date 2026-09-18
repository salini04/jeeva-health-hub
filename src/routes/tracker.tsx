import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { uid, useApp } from "@/lib/store";
import type { VitalsLog } from "@/lib/types";

export const Route = createFileRoute("/tracker")({
  head: () => ({
    meta: [
      { title: "Health tracker — Jeeva" },
      { name: "description", content: "Log weight, blood pressure, glucose, heart rate, water, sleep and activity with 7-day, 30-day and 6-month charts." },
      { property: "og:title", content: "Health tracker — Jeeva" },
      { property: "og:description", content: "Track your vitals over time and spot trends early." },
    ],
  }),
  component: Tracker,
});

const metrics = [
  { key: "weightKg", label: "Weight (kg)" },
  { key: "systolic", label: "Systolic BP" },
  { key: "diastolic", label: "Diastolic BP" },
  { key: "glucose", label: "Glucose (mg/dL)" },
  { key: "heartRate", label: "Heart rate (bpm)" },
  { key: "waterLitres", label: "Water (L)" },
  { key: "sleepHours", label: "Sleep (h)" },
  { key: "activityMinutes", label: "Activity (min)" },
] as const;

type MetricKey = (typeof metrics)[number]["key"];

function Tracker() {
  const { vitals, update } = useApp();
  const last = vitals[vitals.length - 1]!;
  const [range, setRange] = React.useState<"7" | "30" | "180">("30");
  const [metric, setMetric] = React.useState<MetricKey>("weightKg");
  const [form, setForm] = React.useState({
    weightKg: last.weightKg,
    systolic: last.systolic,
    diastolic: last.diastolic,
    glucose: last.glucose,
    heartRate: last.heartRate,
    waterLitres: last.waterLitres,
    sleepHours: last.sleepHours,
    activityMinutes: last.activityMinutes,
    steps: last.steps,
  });

  const data = vitals.slice(-Number(range)).map((v) => ({
    ...v,
    label: new Date(v.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }),
  }));

  const avg = (k: MetricKey) => (data.reduce((s, d) => s + Number(d[k]), 0) / (data.length || 1)).toFixed(1);
  const min = Math.min(...data.map((d) => Number(d[metric])));
  const max = Math.max(...data.map((d) => Number(d[metric])));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const entry: VitalsLog = { id: uid(), date: new Date().toISOString(), ...form };
    update({ vitals: [...vitals, entry] });
    toast.success("Today's vitals logged");
  };

  return (
    <AppShell title="Health tracker" description="Log today's numbers and watch the trend.">
      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={save} className="card-soft space-y-4 p-5">
          <h2 className="text-base font-semibold">Log an entry</h2>
          <div className="grid grid-cols-2 gap-3">
            {[...metrics, { key: "steps", label: "Steps" } as const].map((m) => (
              <div key={m.key} className="space-y-1.5">
                <Label htmlFor={m.key} className="text-xs">{m.label}</Label>
                <Input
                  id={m.key}
                  type="number"
                  step="0.1"
                  value={String(form[m.key as keyof typeof form])}
                  onChange={(e) => setForm({ ...form, [m.key]: Number(e.target.value) })}
                />
              </div>
            ))}
          </div>
          <Button type="submit" className="w-full">Save entry</Button>
        </form>

        <div className="space-y-4">
          <div className="card-soft p-5">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-base font-semibold">Trends</h2>
              <Tabs value={range} onValueChange={(v) => setRange(v as typeof range)}>
                <TabsList>
                  <TabsTrigger value="7">7 days</TabsTrigger>
                  <TabsTrigger value="30">30 days</TabsTrigger>
                  <TabsTrigger value="180">6 months</TabsTrigger>
                </TabsList>
              </Tabs>
            </div>
            <div className="mt-3 flex flex-wrap gap-2">
              {metrics.map((m) => (
                <Button key={m.key} size="sm" variant={metric === m.key ? "default" : "outline"} onClick={() => setMetric(m.key)}>
                  {m.label}
                </Button>
              ))}
            </div>
            <div className="mt-4 h-72">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={data}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
                  <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} minTickGap={28} stroke="var(--color-muted-foreground)" />
                  <YAxis domain={["dataMin - 2", "dataMax + 2"]} tickLine={false} axisLine={false} fontSize={11} width={38} stroke="var(--color-muted-foreground)" />
                  <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
                  <Line type="monotone" dataKey={metric} stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="card-soft p-4"><p className="text-xs uppercase text-muted-foreground">Average</p><p className="font-display text-2xl font-semibold">{avg(metric)}</p></div>
            <div className="card-soft p-4"><p className="text-xs uppercase text-muted-foreground">Lowest</p><p className="font-display text-2xl font-semibold">{min}</p></div>
            <div className="card-soft p-4"><p className="text-xs uppercase text-muted-foreground">Highest</p><p className="font-display text-2xl font-semibold">{max}</p></div>
          </div>
        </div>
      </div>
    </AppShell>
  );
}
