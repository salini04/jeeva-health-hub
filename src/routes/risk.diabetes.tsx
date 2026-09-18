import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { RiskResultView } from "@/components/RiskResultView";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import { bmiFrom, predictDiabetesRisk, type DiabetesRiskInput } from "@/services/mlService";

export const Route = createFileRoute("/risk/diabetes")({
  head: () => ({
    meta: [
      { title: "Type-2 diabetes risk — Jeeva" },
      { name: "description", content: "Educational type-2 diabetes risk screening using BMI, glucose, HbA1c, waist size and habits." },
      { property: "og:title", content: "Type-2 diabetes risk — Jeeva" },
      { property: "og:description", content: "See your estimated diabetes risk tier and the factors driving it." },
    ],
  }),
  component: DiabetesRisk,
});

function DiabetesRisk() {
  const { profile, risks, update } = useApp();
  const [form, setForm] = React.useState<DiabetesRiskInput>({
    age: profile.age,
    gender: profile.gender,
    bmi: +bmiFrom(profile.heightCm, profile.weightKg).toFixed(1),
    fastingGlucose: profile.fastingGlucose,
    hba1c: profile.hba1c,
    waistCm: profile.waistCm,
    familyHistory: false,
    hypertension: profile.systolic >= 140 || profile.diastolic >= 90,
    physicalActivity: profile.activityLevel,
    sugaryDrinksPerDay: 1,
  });
  const [error, setError] = React.useState("");
  const result = risks.diabetes;

  const set = <K extends keyof DiabetesRiskInput>(k: K, v: DiabetesRiskInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.age < 1 || form.bmi <= 0 || form.hba1c <= 0) {
      setError("Please check age, BMI and HbA1c — some values look out of range.");
      return;
    }
    setError("");
    // Swap this call for the FastAPI ML endpoint when it is available.
    const res = predictDiabetesRisk(form);
    update({ risks: { ...risks, diabetes: res } });
    toast.success(`Diabetes risk assessed: ${res.tier} tier`);
  };

  const numField = (k: keyof DiabetesRiskInput, label: string, step?: string) => (
    <div className="space-y-2">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type="number" step={step} value={String(form[k])} onChange={(e) => set(k, Number(e.target.value) as never)} />
    </div>
  );

  return (
    <AppShell title="Type-2 diabetes risk" description="Clinical inputs prefilled from your health profile.">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={run} className="card-soft space-y-5 p-5">
          <h2 className="text-base font-semibold">Clinical inputs</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {numField("age", "Age")}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v as DiabetesRiskInput["gender"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {numField("bmi", "BMI", "0.1")}
            {numField("waistCm", "Waist circumference (cm)")}
            {numField("fastingGlucose", "Fasting glucose (mg/dL)")}
            {numField("hba1c", "HbA1c (%)", "0.1")}
            {numField("sugaryDrinksPerDay", "Sugary drinks per day")}
            <div className="space-y-2">
              <Label>Physical activity</Label>
              <Select value={form.physicalActivity} onValueChange={(v) => set("physicalActivity", v as DiabetesRiskInput["physicalActivity"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3">
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Family history</p>
                <p className="text-xs text-muted-foreground">Parent or sibling with diabetes</p>
              </div>
              <Switch checked={form.familyHistory} onCheckedChange={(v) => set("familyHistory", v)} />
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Hypertension</p>
                <p className="text-xs text-muted-foreground">Diagnosed or on BP medication</p>
              </div>
              <Switch checked={form.hypertension} onCheckedChange={(v) => set("hypertension", v)} />
            </div>
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Calculate diabetes risk</Button>
        </form>

        <div>
          {result ? (
            <RiskResultView result={result} />
          ) : (
            <div className="card-soft grid h-full place-items-center p-10 text-center">
              <div>
                <p className="font-display text-lg font-semibold">No assessment yet</p>
                <p className="mt-2 text-sm text-muted-foreground">
                  Review the inputs on the left and calculate your risk to see the tier, score breakdown and guidance.
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </AppShell>
  );
}
