import type { RiskResult } from "@/services/mlService";

export interface HealthProfile {
  name: string;
  email: string;
  age: number;
  gender: "male" | "female" | "other";
  heightCm: number;
  weightKg: number;
  systolic: number;
  diastolic: number;
  restingHeartRate: number;
  cholesterol: number;
  fastingGlucose: number;
  hba1c: number;
  waistCm: number;
  activityLevel: "low" | "moderate" | "high";
  smoker: boolean;
  alcohol: "never" | "occasional" | "regular";
  medicalHistory: string;
  allergies: string;
  bloodGroup: string;
  emergencyContact: string;
}

export interface VitalsLog {
  id: string;
  date: string;
  weightKg: number;
  systolic: number;
  diastolic: number;
  glucose: number;
  heartRate: number;
  waterLitres: number;
  sleepHours: number;
  activityMinutes: number;
  steps: number;
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
  location: string;
  hospital: string;
  experience: number;
  rating: number;
  fee: number;
  languages: string[];
  about: string;
  slots: string[];
}

export interface Appointment {
  id: string;
  doctorId: string;
  doctorName: string;
  specialty: string;
  date: string;
  time: string;
  reason: string;
  status: "upcoming" | "completed" | "cancelled";
  mode: "In-person" | "Video";
}

export interface Notification {
  id: string;
  type: "reminder" | "hydration" | "appointment" | "wellness";
  title: string;
  body: string;
  createdAt: string;
  read: boolean;
}

export interface ChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
}

export interface Settings {
  units: "metric" | "imperial";
  notifications: { reminders: boolean; hydration: boolean; appointments: boolean; weekly: boolean };
  theme: "light" | "dark";
}

export interface StoredRisk {
  heart?: RiskResult;
  diabetes?: RiskResult;
}

export interface AuthState {
  signedIn: boolean;
  guest: boolean;
  name: string;
  email: string;
}
