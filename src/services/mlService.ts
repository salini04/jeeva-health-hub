/**
 * mlService — risk prediction service layer.
 *
 * Right now this contains deterministic, clinically-inspired MOCK scoring logic
 * so the whole app is interactive without a backend.
 *
 * FUTURE INTEGRATION (Python / FastAPI):
 *   const res = await fetch(`${import.meta.env.VITE_ML_API_URL}/predict/heart`, {
 *     method: "POST",
 *     headers: { "Content-Type": "application/json" },
 *     body: JSON.stringify(input),
 *   });
 *   return (await res.json()) as RiskResult;
 * Keep the input/output contracts below stable so swapping the implementation
 * requires no UI changes.
 */

export type RiskTier = "Low" | "Moderate" | "High";

export interface RiskFactor {
  label: string;
  impact: number; // 0-100 relative contribution
  detail: string;
}

export interface RiskResult {
  score: number; // 0-100 risk percentage
  tier: RiskTier;
  factors: RiskFactor[];
  recommendations: string[];
  consultAdvisory: string;
  model: string;
  generatedAt: string;
}

export interface HeartRiskInput {
  age: number;
  gender: "male" | "female" | "other";
  systolic: number;
  diastolic: number;
  cholesterol: number; // mg/dL
  restingHeartRate: number;
  bmi: number;
  smoker: boolean;
  diabetic: boolean;
  familyHistory: boolean;
  exerciseMinutesPerWeek: number;
  chestPain: "none" | "atypical" | "typical";
}

export interface DiabetesRiskInput {
  age: number;
  gender: "male" | "female" | "other";
  bmi: number;
  fastingGlucose: number; // mg/dL
  hba1c: number; // %
  waistCm: number;
  familyHistory: boolean;
  hypertension: boolean;
  physicalActivity: "low" | "moderate" | "high";
  sugaryDrinksPerDay: number;
}

const clamp = (n: number, min = 0, max = 100) => Math.max(min, Math.min(max, n));

function tierFor(score: number): RiskTier {
  if (score < 30) return "Low";
  if (score < 60) return "Moderate";
  return "High";
}

function advisoryFor(tier: RiskTier): string {
  if (tier === "High")
    return "Your inputs fall in a higher-risk range. Please book a consultation with a physician for proper clinical evaluation. This screening is not a diagnosis.";
  if (tier === "Moderate")
    return "Consider a routine check-up with a doctor within the next few months and discuss these results with them.";
  return "Keep up your current habits and continue routine annual health check-ups with your doctor.";
}

function topFactors(factors: RiskFactor[]): RiskFactor[] {
  return factors
    .filter((f) => f.impact > 0)
    .sort((a, b) => b.impact - a.impact)
    .slice(0, 5);
}

/** Mock heart disease risk prediction. Replace with FastAPI call later. */
export function predictHeartRisk(input: HeartRiskInput): RiskResult {
  const factors: RiskFactor[] = [];
  let score = 4;

  const ageScore = clamp((input.age - 25) * 0.55, 0, 26);
  score += ageScore;
  factors.push({
    label: "Age",
    impact: Math.round(ageScore),
    detail: `Cardiovascular risk rises steadily with age (you entered ${input.age}).`,
  });

  const bpScore = clamp((input.systolic - 115) * 0.35 + (input.diastolic - 75) * 0.25, 0, 20);
  score += bpScore;
  factors.push({
    label: "Blood pressure",
    impact: Math.round(bpScore),
    detail: `${input.systolic}/${input.diastolic} mmHg — optimal is around 120/80 mmHg.`,
  });

  const cholScore = clamp((input.cholesterol - 180) * 0.12, 0, 16);
  score += cholScore;
  factors.push({
    label: "Cholesterol",
    impact: Math.round(cholScore),
    detail: `${input.cholesterol} mg/dL total cholesterol (desirable is under 200 mg/dL).`,
  });

  const bmiScore = clamp((input.bmi - 24) * 1.4, 0, 14);
  score += bmiScore;
  factors.push({
    label: "Body mass index",
    impact: Math.round(bmiScore),
    detail: `BMI ${input.bmi.toFixed(1)} — the healthy range is 18.5-24.9.`,
  });

  if (input.smoker) {
    score += 12;
    factors.push({ label: "Smoking", impact: 12, detail: "Smoking is one of the strongest modifiable cardiac risk factors." });
  }
  if (input.diabetic) {
    score += 9;
    factors.push({ label: "Diabetes", impact: 9, detail: "Diabetes roughly doubles cardiovascular risk over time." });
  }
  if (input.familyHistory) {
    score += 6;
    factors.push({ label: "Family history", impact: 6, detail: "A first-degree relative with heart disease raises baseline risk." });
  }

  const chest = input.chestPain === "typical" ? 11 : input.chestPain === "atypical" ? 5 : 0;
  score += chest;
  if (chest)
    factors.push({ label: "Chest discomfort", impact: chest, detail: "Reported chest discomfort should always be reviewed by a clinician." });

  const hrScore = clamp((input.restingHeartRate - 70) * 0.25, 0, 8);
  score += hrScore;
  factors.push({
    label: "Resting heart rate",
    impact: Math.round(hrScore),
    detail: `${input.restingHeartRate} bpm — a lower resting rate generally reflects better fitness.`,
  });

  const activityBonus = clamp(input.exerciseMinutesPerWeek / 20, 0, 9);
  score -= activityBonus;

  const final = Math.round(clamp(score));
  const tier = tierFor(final);

  const recommendations = [
    input.smoker ? "Explore a structured smoking cessation programme — risk starts dropping within weeks." : "Stay smoke-free and avoid second-hand smoke.",
    input.exerciseMinutesPerWeek < 150
      ? "Work towards 150 minutes of moderate aerobic activity per week (brisk walking counts)."
      : "Maintain your current activity level — you are meeting weekly activity guidelines.",
    input.cholesterol > 200 ? "Reduce saturated fats and increase soluble fibre (oats, legumes, fruit)." : "Keep a balanced diet rich in vegetables, whole grains and healthy fats.",
    input.systolic > 130 ? "Lower sodium intake and monitor blood pressure at home a few times a week." : "Continue occasional blood pressure monitoring.",
    "Prioritise 7-8 hours of sleep and practise stress reduction such as breathing exercises.",
  ];

  return {
    score: final,
    tier,
    factors: topFactors(factors),
    recommendations,
    consultAdvisory: advisoryFor(tier),
    model: "jeeva-heart-mock-v1",
    generatedAt: new Date().toISOString(),
  };
}

/** Mock type-2 diabetes risk prediction. Replace with FastAPI call later. */
export function predictDiabetesRisk(input: DiabetesRiskInput): RiskResult {
  const factors: RiskFactor[] = [];
  let score = 3;

  const ageScore = clamp((input.age - 25) * 0.45, 0, 20);
  score += ageScore;
  factors.push({ label: "Age", impact: Math.round(ageScore), detail: `Risk increases notably after 40 (you entered ${input.age}).` });

  const bmiScore = clamp((input.bmi - 23) * 2.1, 0, 22);
  score += bmiScore;
  factors.push({ label: "Body mass index", impact: Math.round(bmiScore), detail: `BMI ${input.bmi.toFixed(1)} — excess weight drives insulin resistance.` });

  const glucoseScore = clamp((input.fastingGlucose - 90) * 0.7, 0, 24);
  score += glucoseScore;
  factors.push({
    label: "Fasting glucose",
    impact: Math.round(glucoseScore),
    detail: `${input.fastingGlucose} mg/dL — 100-125 mg/dL indicates prediabetes range.`,
  });

  const a1cScore = clamp((input.hba1c - 5.2) * 14, 0, 22);
  score += a1cScore;
  factors.push({ label: "HbA1c", impact: Math.round(a1cScore), detail: `${input.hba1c}% — 5.7-6.4% is the prediabetes range.` });

  const waistScore = clamp((input.waistCm - (input.gender === "female" ? 80 : 94)) * 0.5, 0, 12);
  score += waistScore;
  factors.push({ label: "Waist circumference", impact: Math.round(waistScore), detail: `${input.waistCm} cm — central fat is strongly linked to insulin resistance.` });

  if (input.familyHistory) {
    score += 8;
    factors.push({ label: "Family history", impact: 8, detail: "A parent or sibling with diabetes significantly raises risk." });
  }
  if (input.hypertension) {
    score += 6;
    factors.push({ label: "Hypertension", impact: 6, detail: "High blood pressure often clusters with metabolic risk." });
  }

  const drinkScore = clamp(input.sugaryDrinksPerDay * 3.5, 0, 12);
  score += drinkScore;
  if (drinkScore)
    factors.push({ label: "Sugary drinks", impact: Math.round(drinkScore), detail: `${input.sugaryDrinksPerDay} per day — liquid sugar spikes glucose quickly.` });

  const activityBonus = input.physicalActivity === "high" ? 10 : input.physicalActivity === "moderate" ? 5 : 0;
  score -= activityBonus;

  const final = Math.round(clamp(score));
  const tier = tierFor(final);

  const recommendations = [
    input.bmi > 25 ? "A 5-7% body-weight reduction can meaningfully lower type-2 diabetes risk." : "Maintain your current healthy weight.",
    input.physicalActivity === "low" ? "Add 30 minutes of movement on most days — even walking after meals helps glucose control." : "Keep up your regular physical activity.",
    input.sugaryDrinksPerDay > 0 ? "Swap sugary drinks for water, unsweetened tea or sparkling water." : "Continue avoiding sugar-sweetened beverages.",
    "Favour high-fibre, low-glycaemic foods: whole grains, legumes, nuts and vegetables.",
    "Ask your doctor about a fasting glucose or HbA1c test at your next visit.",
  ];

  return {
    score: final,
    tier,
    factors: topFactors(factors),
    recommendations,
    consultAdvisory: advisoryFor(tier),
    model: "jeeva-diabetes-mock-v1",
    generatedAt: new Date().toISOString(),
  };
}

export function bmiFrom(heightCm: number, weightKg: number): number {
  if (!heightCm || !weightKg) return 0;
  const m = heightCm / 100;
  return weightKg / (m * m);
}

export function bmiCategory(bmi: number): { label: string; tone: "good" | "warn" | "bad" } {
  if (bmi < 18.5) return { label: "Underweight", tone: "warn" };
  if (bmi < 25) return { label: "Healthy weight", tone: "good" };
  if (bmi < 30) return { label: "Overweight", tone: "warn" };
  return { label: "Obese", tone: "bad" };
}
