import { createFileRoute, Link } from "@tanstack/react-router";
import { Activity, ArrowRight, Droplets, HeartPulse } from "lucide-react";
import { AppShell } from "@/components/AppShell";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useApp } from "@/lib/store";

export const Route = createFileRoute("/risk/")({
  head: () => ({
    meta: [
      { title: "Risk assessment — Jeeva" },
      { name: "description", content: "Educational heart disease and type-2 diabetes risk screening with factor breakdowns." },
      { property: "og:title", content: "Risk assessment — Jeeva" },
      { property: "og:description", content: "Screen your heart and diabetes risk and see which factors matter most." },
    ],
  }),
  component: RiskIndex,
});

function RiskIndex() {
  const { risks } = useApp();

  const modules = [
    {
      to: "/risk/heart" as const,
      icon: HeartPulse,
      title: "Heart disease risk",
      body: "Uses age, blood pressure, cholesterol, BMI, smoking, family history and activity.",
      result: risks.heart,
    },
    {
      to: "/risk/diabetes" as const,
      icon: Droplets,
      title: "Type-2 diabetes risk",
      body: "Uses BMI, fasting glucose, HbA1c, waist size, family history and daily habits.",
      result: risks.diabetes,
    },
  ];

  return (
    <AppShell title="Risk assessment" description="Educational screening — never a diagnosis.">
      <div className="grid gap-4 md:grid-cols-2">
        {modules.map((m) => (
          <Link key={m.to} to={m.to} className="card-soft group block p-6">
            <div className="flex items-center gap-3">
              <span className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary"><m.icon className="size-5" /></span>
              <h2 className="text-lg font-semibold">{m.title}</h2>
              <ArrowRight className="ml-auto size-4 text-muted-foreground transition-transform group-hover:translate-x-1" />
            </div>
            <p className="mt-3 text-sm text-muted-foreground">{m.body}</p>
            {m.result ? (
              <div className="mt-4 rounded-xl border border-border p-4">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">Last result</p>
                  <Badge variant={m.result.tier === "High" ? "destructive" : m.result.tier === "Moderate" ? "secondary" : "default"}>{m.result.tier}</Badge>
                </div>
                <p className="mt-1 font-display text-3xl font-semibold">{m.result.score}%</p>
                <Progress value={m.result.score} className="mt-2" />
                <p className="mt-2 text-xs text-muted-foreground">
                  Assessed {new Date(m.result.generatedAt).toLocaleString()}
                </p>
              </div>
            ) : (
              <p className="mt-4 text-sm font-medium text-primary">Start assessment →</p>
            )}
          </Link>
        ))}
      </div>

      <div className="card-soft p-6">
        <h2 className="flex items-center gap-2 text-base font-semibold"><Activity className="size-4 text-teal" /> How scoring works</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Jeeva scores each clinical input against widely published risk ranges and ranks the factors contributing most
          to your result. The scoring lives in a single service layer, so a trained model served from a Python/FastAPI
          endpoint can replace it without any change to these screens.
        </p>
      </div>
    </AppShell>
  );
}
