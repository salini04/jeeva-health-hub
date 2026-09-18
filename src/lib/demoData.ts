import type { Appointment, ChatMessage, Doctor, HealthProfile, Notification, VitalsLog } from "./types";

const day = 24 * 60 * 60 * 1000;
const iso = (offsetDays: number) => new Date(Date.now() - offsetDays * day).toISOString();

export const demoProfile: HealthProfile = {
  name: "Salini Kumari Yadav",
  email: "salini@student.jeeva.health",
  age: 22,
  gender: "female",
  heightCm: 163,
  weightKg: 58,
  systolic: 118,
  diastolic: 76,
  restingHeartRate: 72,
  cholesterol: 186,
  fastingGlucose: 94,
  hba1c: 5.3,
  waistCm: 74,
  activityLevel: "moderate",
  smoker: false,
  alcohol: "occasional",
  medicalHistory: "Mild seasonal asthma (inhaler as needed)",
  allergies: "Dust mites, penicillin",
  bloodGroup: "B+",
  emergencyContact: "+91 98765 43210",
};

function wave(base: number, i: number, amp: number, seed: number) {
  return +(base + Math.sin((i + seed) / 3.1) * amp + ((i * 7 + seed * 13) % 5) * (amp / 6)).toFixed(1);
}

export const demoVitals: VitalsLog[] = Array.from({ length: 180 }, (_, idx) => {
  const i = 179 - idx;
  return {
    id: `v-${i}`,
    date: iso(i),
    weightKg: +(58 + i * 0.012 + Math.sin(i / 9) * 0.5).toFixed(1),
    systolic: Math.round(wave(118, i, 5, 1)),
    diastolic: Math.round(wave(76, i, 4, 2)),
    glucose: Math.round(wave(94, i, 7, 3)),
    heartRate: Math.round(wave(72, i, 6, 4)),
    waterLitres: +Math.max(1, wave(2.3, i, 0.6, 5)).toFixed(1),
    sleepHours: +Math.max(4.5, wave(7.1, i, 1.1, 6)).toFixed(1),
    activityMinutes: Math.max(0, Math.round(wave(38, i, 22, 7))),
    steps: Math.max(1200, Math.round(wave(7600, i, 2600, 8))),
  };
}).reverse();

export const demoDoctors: Doctor[] = [
  {
    id: "d1",
    name: "Dr. Ananya Rao",
    specialty: "Cardiology",
    location: "Bengaluru",
    hospital: "Apollo Heart Institute",
    experience: 14,
    rating: 4.8,
    fee: 800,
    languages: ["English", "Hindi", "Kannada"],
    about: "Interventional cardiologist focused on preventive heart care and lipid management for young adults.",
    slots: ["09:30", "11:00", "14:30", "17:00"],
  },
  {
    id: "d2",
    name: "Dr. Rohan Mehta",
    specialty: "Endocrinology",
    location: "Mumbai",
    hospital: "Lilavati Medical Centre",
    experience: 11,
    rating: 4.7,
    fee: 750,
    languages: ["English", "Hindi", "Marathi"],
    about: "Diabetologist working on early metabolic screening and lifestyle-first reversal programmes.",
    slots: ["10:00", "12:30", "15:00"],
  },
  {
    id: "d3",
    name: "Dr. Kavya Nair",
    specialty: "General Medicine",
    location: "Kochi",
    hospital: "Amrita Institute",
    experience: 8,
    rating: 4.6,
    fee: 500,
    languages: ["English", "Malayalam"],
    about: "Primary care physician handling routine check-ups, student health and vaccination guidance.",
    slots: ["09:00", "10:30", "16:00", "18:30"],
  },
  {
    id: "d4",
    name: "Dr. Imran Qureshi",
    specialty: "Nutrition & Dietetics",
    location: "Delhi",
    hospital: "Max Wellness Clinic",
    experience: 9,
    rating: 4.9,
    fee: 600,
    languages: ["English", "Hindi", "Urdu"],
    about: "Clinical nutritionist designing sustainable diet plans for students and shift workers.",
    slots: ["11:30", "13:00", "17:30"],
  },
  {
    id: "d5",
    name: "Dr. Meera Iyer",
    specialty: "Psychiatry",
    location: "Chennai",
    hospital: "Kauvery Mind Care",
    experience: 12,
    rating: 4.8,
    fee: 900,
    languages: ["English", "Tamil"],
    about: "Focuses on student stress, sleep disorders and anxiety management with therapy-first care.",
    slots: ["10:00", "14:00", "19:00"],
  },
  {
    id: "d6",
    name: "Dr. Arjun Sethi",
    specialty: "Pulmonology",
    location: "Bengaluru",
    hospital: "Fortis Respiratory Centre",
    experience: 16,
    rating: 4.5,
    fee: 850,
    languages: ["English", "Hindi", "Punjabi"],
    about: "Treats asthma, allergy-driven breathing issues and long-term respiratory follow-ups.",
    slots: ["09:15", "12:00", "16:45"],
  },
];

const inDays = (n: number) => new Date(Date.now() + n * day).toISOString().slice(0, 10);

export const demoAppointments: Appointment[] = [
  {
    id: "a1",
    doctorId: "d1",
    doctorName: "Dr. Ananya Rao",
    specialty: "Cardiology",
    date: inDays(4),
    time: "11:00",
    reason: "Follow-up on elevated cholesterol and heart risk screening",
    status: "upcoming",
    mode: "In-person",
  },
  {
    id: "a2",
    doctorId: "d4",
    doctorName: "Dr. Imran Qureshi",
    specialty: "Nutrition & Dietetics",
    date: inDays(12),
    time: "13:00",
    reason: "Diet plan review for hostel meals",
    status: "upcoming",
    mode: "Video",
  },
  {
    id: "a3",
    doctorId: "d3",
    doctorName: "Dr. Kavya Nair",
    specialty: "General Medicine",
    date: inDays(-21),
    time: "10:30",
    reason: "Annual health check-up and blood panel",
    status: "completed",
    mode: "In-person",
  },
  {
    id: "a4",
    doctorId: "d6",
    doctorName: "Dr. Arjun Sethi",
    specialty: "Pulmonology",
    date: inDays(-48),
    time: "16:45",
    reason: "Seasonal asthma inhaler review",
    status: "completed",
    mode: "Video",
  },
];

export const demoNotifications: Notification[] = [
  { id: "n1", type: "reminder", title: "Log today's vitals", body: "You haven't recorded your blood pressure today.", createdAt: iso(0), read: false },
  { id: "n2", type: "hydration", title: "Hydration check", body: "You're 0.6 L below your daily water goal.", createdAt: iso(0), read: false },
  { id: "n3", type: "appointment", title: "Upcoming appointment", body: "Dr. Ananya Rao, Cardiology — in 4 days at 11:00.", createdAt: iso(1), read: false },
  { id: "n4", type: "wellness", title: "Weekly wellness check-in", body: "Your average sleep this week was 7.1 hours. Nice consistency.", createdAt: iso(2), read: true },
  { id: "n5", type: "reminder", title: "Risk re-assessment due", body: "It's been 30 days since your last heart risk assessment.", createdAt: iso(3), read: true },
];

export const demoChat: ChatMessage[] = [
  {
    id: "c1",
    role: "assistant",
    content:
      "Hi Salini, I'm **Jeeva Assistant** — your health education companion. I can explain vitals, lifestyle habits and what your risk scores mean.\n\nI can't diagnose conditions or prescribe treatment; for that, please see a doctor.",
    createdAt: iso(0),
  },
];
