import * as React from "react";
import { createFileRoute } from "@tanstack/react-router";
import { toast } from "sonner";
import { AppShell } from "@/components/AppShell";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useApp } from "@/lib/store";
import type { HealthProfile } from "@/lib/types";
import { bmiCategory, bmiFrom } from "@/services/mlService";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Health profile — Jeeva" },
      { name: "description", content: "Edit your age, vitals, lifestyle habits, medical history and allergies; BMI and health tier update automatically." },
      { property: "og:title", content: "Health profile — Jeeva" },
      { property: "og:description", content: "Keep your vitals and history current so risk screening stays accurate." },
    ],
  }),
  component: ProfilePage,
});

function healthTier(bmi: number, p: HealthProfile) {
  let score = 0;
  if (bmi >= 18.5 && bmi < 25) score += 2;
  else if (bmi < 30) score += 1;
  if (p.systolic < 130 && p.diastolic < 85) score += 2;
  else if (p.systolic < 140) score += 1;
  if (!p.smoker) score += 1;
  if (p.activityLevel === "high") score += 2;
  else if (p.activityLevel === "moderate") score += 1;
  if (p.fastingGlucose < 100) score += 1;
  if (score >= 7) return { label: "Excellent", tone: "good" as const };
  if (score >= 5) return { label: "Good", tone: "good" as const };
  if (score >= 3) return { label: "Needs attention", tone: "warn" as const };
  return { label: "At risk", tone: "bad" as const };
}

function ProfilePage() {
  const { profile, update } = useApp();
  const [form, setForm] = React.useState<HealthProfile>(profile);
  const [errors, setErrors] = React.useState<Record<string, string>>({});

  const bmi = bmiFrom(form.heightCm, form.weightKg);
  const cat = bmiCategory(bmi);
  const tier = healthTier(bmi, form);

  const set = <K extends keyof HealthProfile>(k: K, v: HealthProfile[K]) => setForm((f) => ({ ...f, [k]: v }));
  const num = (v: string) => (v === "" ? 0 : Number(v));

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    const next: Record<string, string> = {};
    if (form.age < 1 || form.age > 120) next["age"] = "Enter an age between 1 and 120";
    if (form.heightCm < 80 || form.heightCm > 250) next["heightCm"] = "Enter height in cm (80-250)";
    if (form.weightKg < 20 || form.weightKg > 300) next["weightKg"] = "Enter weight in kg (20-300)";
    if (form.systolic < 70 || form.systolic > 250) next["systolic"] = "Systolic should be 70-250";
    if (form.diastolic < 40 || form.diastolic > 150) next["diastolic"] = "Diastolic should be 40-150";
    setErrors(next);
    if (Object.keys(next).length) return toast.error("Please fix the highlighted fields");
    update({ profile: form });
    toast.success("Health profile saved");
  };

  const field = (id: keyof HealthProfile, label: string, type = "number", step?: string) => (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type={type}
        step={step}
        value={String(form[id] ?? "")}
        onChange={(e) => set(id, (type === "number" ? num(e.target.value) : e.target.value) as HealthProfile[typeof id])}
      />
      {errors[id] && <p className="text-xs text-destructive">{errors[id]}</p>}
    </div>
  );

  return (
    <AppShell title="Health profile" description="Used across risk assessments, reports and your dashboard.">
      <form onSubmit={save} className="space-y-6">
        <section className="grid gap-4 sm:grid-cols-3">
          <div className="card-soft p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Calculated BMI</p>
            <p className="mt-1 font-display text-3xl font-semibold">{bmi ? bmi.toFixed(1) : "—"}</p>
            <Badge className="mt-2" variant={cat.tone === "good" ? "default" : "secondary"}>{cat.label}</Badge>
          </div>
          <div className="card-soft p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Health tier</p>
            <p className="mt-1 font-display text-3xl font-semibold">{tier.label}</p>
            <p className="mt-2 text-xs text-muted-foreground">Based on BMI, blood pressure, activity, glucose and smoking.</p>
          </div>
          <div className="card-soft p-4">
            <p className="text-xs uppercase tracking-wide text-muted-foreground">Blood group</p>
            <p className="mt-1 font-display text-3xl font-semibold">{form.bloodGroup || "—"}</p>
            <p className="mt-2 text-xs text-muted-foreground">Emergency contact: {form.emergencyContact || "not set"}</p>
          </div>
        </section>

        <section className="card-soft space-y-4 p-5">
          <h2 className="text-base font-semibold">Personal details</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {field("name", "Full name", "text")}
            {field("email", "Email", "email")}
            {field("age", "Age")}
            <div className="space-y-2">
              <Label>Gender</Label>
              <Select value={form.gender} onValueChange={(v) => set("gender", v as HealthProfile["gender"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {field("bloodGroup", "Blood group", "text")}
            {field("emergencyContact", "Emergency contact", "text")}
          </div>
        </section>

        <section className="card-soft space-y-4 p-5">
          <h2 className="text-base font-semibold">Body & vitals</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {field("heightCm", "Height (cm)")}
            {field("weightKg", "Weight (kg)", "number", "0.1")}
            {field("waistCm", "Waist (cm)")}
            {field("systolic", "Systolic BP (mmHg)")}
            {field("diastolic", "Diastolic BP (mmHg)")}
            {field("restingHeartRate", "Resting heart rate (bpm)")}
            {field("cholesterol", "Total cholesterol (mg/dL)")}
            {field("fastingGlucose", "Fasting glucose (mg/dL)")}
            {field("hba1c", "HbA1c (%)", "number", "0.1")}
          </div>
        </section>

        <section className="card-soft space-y-4 p-5">
          <h2 className="text-base font-semibold">Lifestyle</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            <div className="space-y-2">
              <Label>Physical activity</Label>
              <Select value={form.activityLevel} onValueChange={(v) => set("activityLevel", v as HealthProfile["activityLevel"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low — mostly sedentary</SelectItem>
                  <SelectItem value="moderate">Moderate — 2-4 days a week</SelectItem>
                  <SelectItem value="high">High — 5+ days a week</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Alcohol</Label>
              <Select value={form.alcohol} onValueChange={(v) => set("alcohol", v as HealthProfile["alcohol"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="never">Never</SelectItem>
                  <SelectItem value="occasional">Occasional</SelectItem>
                  <SelectItem value="regular">Regular</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center justify-between rounded-xl border border-border px-4 py-3">
              <div>
                <p className="text-sm font-medium">Smoker</p>
                <p className="text-xs text-muted-foreground">Includes vaping and tobacco</p>
              </div>
              <Switch checked={form.smoker} onCheckedChange={(v) => set("smoker", v)} />
            </div>
          </div>
        </section>

        <section className="card-soft space-y-4 p-5">
          <h2 className="text-base font-semibold">Medical history</h2>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="medicalHistory">Conditions & past history</Label>
              <Textarea id="medicalHistory" rows={4} value={form.medicalHistory} onChange={(e) => set("medicalHistory", e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="allergies">Allergies</Label>
              <Textarea id="allergies" rows={4} value={form.allergies} onChange={(e) => set("allergies", e.target.value)} />
            </div>
          </div>
        </section>

        <div className="flex gap-3">
          <Button type="submit">Save profile</Button>
          <Button type="button" variant="outline" onClick={() => setForm(profile)}>Reset changes</Button>
        </div>
      </form>
    </AppShell>
  );
}
