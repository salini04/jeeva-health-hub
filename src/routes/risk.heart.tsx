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
import { bmiFrom, predictHeartRisk, type HeartRiskInput } from "@/services/mlService";

export const Route = createFileRoute("/risk/heart")({
  head: () => ({
    meta: [
      { title: "Heart disease risk — Jeeva" },
      { name: "description", content: "Educational heart disease risk screening using blood pressure, cholesterol, BMI, smoking and activity." },
      { property: "og:title", content: "Heart disease risk — Jeeva" },
      { property: "og:description", content: "See your estimated heart risk tier and the factors driving it." },
    ],
  }),
  component: HeartRisk,
});

function HeartRisk() {
  const { profile, risks, update } = useApp();
  const [form, setForm] = React.useState<HeartRiskInput>({
    age: profile.age,
    gender: profile.gender,
    systolic: profile.systolic,
    diastolic: profile.diastolic,
    cholesterol: profile.cholesterol,
    restingHeartRate: profile.restingHeartRate,
    bmi: +bmiFrom(profile.heightCm, profile.weightKg).toFixed(1),
    smoker: profile.smoker,
    diabetic: false,
    familyHistory: false,
    exerciseMinutesPerWeek: profile.activityLevel === "high" ? 240 : profile.activityLevel === "moderate" ? 120 : 40,
    chestPain: "none",
  });
  const [error, setError] = React.useState("");
  const result = risks.heart;

  const set = <K extends keyof HeartRiskInput>(k: K, v: HeartRiskInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  const run = (e: React.FormEvent) => {
    e.preventDefault();
    if (form.age < 1 || form.systolic < 70 || form.bmi <= 0) {
      setError("Please check age, blood pressure and BMI — some values look out of range.");
      return;
    }
    setError("");
    // Swap this call for the FastAPI ML endpoint when it is available.
    const res = predictHeartRisk(form);
    update({ risks: { ...risks, heart: res } });
    toast.success(`Heart risk assessed: ${res.tier} tier`);
  };

  const numField = (k: keyof HeartRiskInput, label: string, step?: string) => (
    <div className="space-y-2">
      <Label htmlFor={k}>{label}</Label>
      <Input id={k} type="number" step={step} value={String(form[k])} onChange={(e) => set(k, Number(e.target.value) as never)} />
    </div>
  );

  const toggle = (k: "smoker" | "diabetic" | "familyHistory", label: string, hint: string) => (
    <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>
      <Switch checked={form[k]} onCheckedChange={(v) => set(k, v)} />
    </div>
  );

  return (
    <AppShell title="Heart disease risk" description="Clinical inputs prefilled from your health profile.">
      <div className="grid gap-6 lg:grid-cols-2">
        <form onSubmit={run} className="card-soft space-y-5 p-5">
          <h2 className="text-base font-semibold">Clinical inputs</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {numField("age", "Age")}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v as HeartRiskInput["gender"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {numField("systolic", "Systolic BP (mmHg)")}
            {numField("diastolic", "Diastolic BP (mmHg)")}
            {numField("cholesterol", "Total cholesterol (mg/dL)")}
            {numField("restingHeartRate", "Resting heart rate (bpm)")}
            {numField("bmi", "BMI", "0.1")}
            {numField("exerciseMinutesPerWeek", "Exercise (min/week)")}
            <div className="space-y-2 sm:col-span-2">
              <Label>Chest discomfort</Label>
              <Select value={form.chestPain} onValueChange={(v) => set("chestPain", v as HeartRiskInput["chestPain"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">None</SelectItem>
                  <SelectItem value="atypical">Occasional / atypical</SelectItem>
                  <SelectItem value="typical">Typical on exertion</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-3">
            {toggle("smoker", "Smoker", "Cigarettes, vaping or tobacco")}
            {toggle("diabetic", "Diagnosed diabetes", "Type 1 or type 2")}
            {toggle("familyHistory", "Family history", "Parent or sibling with heart disease")}
          </div>
          {error && <p className="text-sm text-destructive">{error}</p>}
          <Button type="submit" className="w-full">Calculate heart risk</Button>
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
