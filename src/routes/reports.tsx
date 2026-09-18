import { createFileRoute } from "@tanstack/react-router";
import { Printer } from "lucide-react";
import { CartesianGrid, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Disclaimer } from "@/components/Disclaimer";
import { useApp } from "@/lib/store";
import { bmiCategory, bmiFrom } from "@/services/mlService";

export const Route = createFileRoute("/reports")({
  head: () => ({
    meta: [
      { title: "Health report — Jeeva" },
      { name: "description", content: "A consolidated, printable health summary with vitals, risk results and trend charts." },
      { property: "og:title", content: "Health report — Jeeva" },
      { property: "og:description", content: "Download or print a summary to share with your doctor." },
    ],
  }),
  component: Reports,
});

function Reports() {
  const { profile, vitals, risks, appointments } = useApp();
  const latest = vitals[vitals.length - 1]!;
  const bmi = bmiFrom(profile.heightCm, latest.weightKg);
  const trend = vitals.slice(-60).map((v) => ({ ...v, label: new Date(v.date).toLocaleDateString(undefined, { month: "short", day: "numeric" }) }));

  const rows: [string, string][] = [
    ["Name", profile.name],
    ["Age / Gender", `${profile.age} · ${profile.gender}`],
    ["Blood group", profile.bloodGroup],
    ["Height / Weight", `${profile.heightCm} cm · ${latest.weightKg} kg`],
    ["BMI", `${bmi.toFixed(1)} (${bmiCategory(bmi).label})`],
    ["Blood pressure", `${latest.systolic}/${latest.diastolic} mmHg`],
    ["Resting heart rate", `${latest.heartRate} bpm`],
    ["Fasting glucose", `${latest.glucose} mg/dL`],
    ["HbA1c", `${profile.hba1c}%`],
    ["Cholesterol", `${profile.cholesterol} mg/dL`],
    ["Medical history", profile.medicalHistory || "—"],
    ["Allergies", profile.allergies || "—"],
    ["Emergency contact", profile.emergencyContact || "—"],
  ];

  return (
    <AppShell
      title="Health report"
      description={`Generated ${new Date().toLocaleDateString()}`}
      actions={
        <Button size="sm" onClick={() => window.print()}>
          <Printer className="size-4" /> Print / save PDF
        </Button>
      }
    >
      <div className="card-soft p-6">
        <h2 className="text-base font-semibold">Patient summary</h2>
        <dl className="mt-4 grid gap-x-8 gap-y-3 sm:grid-cols-2">
          {rows.map(([k, v]) => (
            <div key={k} className="flex justify-between gap-4 border-b border-border pb-2 text-sm">
              <dt className="text-muted-foreground">{k}</dt>
              <dd className="text-right font-medium">{v}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="card-soft p-6">
        <h2 className="text-base font-semibold">Risk assessment results</h2>
        <div className="mt-4 grid gap-4 sm:grid-cols-2">
          {(["heart", "diabetes"] as const).map((k) => {
            const r = risks[k];
            return (
              <div key={k} className="rounded-xl border border-border p-4">
                <p className="text-sm font-medium">{k === "heart" ? "Heart disease" : "Type-2 diabetes"}</p>
                {r ? (
                  <>
                    <p className="mt-1 font-display text-3xl font-semibold">{r.score}%</p>
                    <Badge className="mt-1" variant={r.tier === "High" ? "destructive" : "secondary"}>{r.tier} tier</Badge>
                    <p className="mt-2 text-xs text-muted-foreground">Top factors: {r.factors.map((f) => f.label).join(", ")}</p>
                  </>
                ) : (
                  <p className="mt-2 text-sm text-muted-foreground">Not assessed yet.</p>
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div className="card-soft p-6">
        <h2 className="text-base font-semibold">Vitals trend (60 days)</h2>
        <div className="mt-4 h-72">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trend}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" vertical={false} />
              <XAxis dataKey="label" tickLine={false} axisLine={false} fontSize={11} minTickGap={30} stroke="var(--color-muted-foreground)" />
              <YAxis tickLine={false} axisLine={false} fontSize={11} width={36} stroke="var(--color-muted-foreground)" />
              <Tooltip contentStyle={{ borderRadius: 12, border: "1px solid var(--color-border)", background: "var(--color-card)" }} />
              <Line type="monotone" dataKey="systolic" name="Systolic" stroke="var(--color-chart-1)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="diastolic" name="Diastolic" stroke="var(--color-chart-2)" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="glucose" name="Glucose" stroke="var(--color-chart-3)" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div className="card-soft p-6">
        <h2 className="text-base font-semibold">Consultations</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {appointments.map((a) => (
            <li key={a.id} className="flex flex-wrap justify-between gap-2 border-b border-border pb-2">
              <span>{new Date(a.date).toDateString()} — {a.doctorName} ({a.specialty})</span>
              <span className="text-muted-foreground">{a.status}</span>
            </li>
          ))}
        </ul>
      </div>

      <Disclaimer />
    </AppShell>
  );
}
