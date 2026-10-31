import { supabase } from '@/integrations/supabase/client';
import type { Database, Json } from '@/integrations/supabase/types';
import type { Doctor, HealthProfile, VitalsLog, StoredRisk } from './types';

type Row<T extends keyof Database['public']['Tables']> = Database['public']['Tables'][T]['Row'];
export const jsonValue = (value: unknown): Json => JSON.parse(JSON.stringify(value));
export const emptyProfile: HealthProfile = { name: '', email: '', age: 0, gender: 'other', heightCm: 0, weightKg: 0, systolic: 0, diastolic: 0, restingHeartRate: 0, cholesterol: 0, fastingGlucose: 0, hba1c: 0, waistCm: 0, activityLevel: 'low', smoker: false, alcohol: 'never', medicalHistory: '', allergies: '', bloodGroup: '', emergencyContact: '' };
export function profileFromRow(p: Row<'profiles'>): HealthProfile {
  const bp = p.blood_pressure as { systolic?: number; diastolic?: number };
  return { name: p.full_name, email: p.email, age: p.age, gender: p.gender as HealthProfile['gender'], heightCm: p.height, weightKg: p.weight, systolic: bp.systolic ?? 0, diastolic: bp.diastolic ?? 0, restingHeartRate: p.resting_heart_rate, cholesterol: p.cholesterol, fastingGlucose: p.fasting_glucose, hba1c: p.hba1c, waistCm: p.waist_cm, activityLevel: p.activity_level as HealthProfile['activityLevel'], smoker: p.smoking_status, alcohol: p.alcohol_consumption as HealthProfile['alcohol'], medicalHistory: p.medical_history, allergies: p.allergies, bloodGroup: p.blood_group, emergencyContact: p.emergency_contact };
}
export function profileToRow(p: HealthProfile) {
  return { full_name: p.name, email: p.email, age: p.age, gender: p.gender, height: p.heightCm, weight: p.weightKg, blood_pressure: jsonValue({ systolic: p.systolic, diastolic: p.diastolic }), resting_heart_rate: p.restingHeartRate, cholesterol: p.cholesterol, fasting_glucose: p.fastingGlucose, hba1c: p.hba1c, waist_cm: p.waistCm, activity_level: p.activityLevel, smoking_status: p.smoker, alcohol_consumption: p.alcohol, medical_history: p.medicalHistory, allergies: p.allergies, blood_group: p.bloodGroup, emergency_contact: p.emergencyContact };
}
export const metricFields = [ ['weightKg','weight','kg'], ['systolic','blood_pressure_systolic','mmHg'], ['diastolic','blood_pressure_diastolic','mmHg'], ['glucose','blood_glucose','mg/dL'], ['heartRate','heart_rate','bpm'], ['waterLitres','water_intake','L'], ['sleepHours','sleep_hours','h'], ['activityMinutes','activity_minutes','min'] ] as const;
export function metricsToRows(v: VitalsLog, userId: string) {
  return metricFields.map(([key, type, unit]) => ({ user_id: userId, entry_id: v.id, metric_type: type, value: v[key], unit, recorded_at: v.date, steps: v.steps }));
}
export function metricsFromRows(rows: Row<'health_metrics'>[]): VitalsLog[] {
  const entries = new Map<string, VitalsLog>();
  for (const row of rows) {
    const entry = entries.get(row.entry_id) ?? { id: row.entry_id, date: row.recorded_at, weightKg: 0, systolic: 0, diastolic: 0, glucose: 0, heartRate: 0, waterLitres: 0, sleepHours: 0, activityMinutes: 0, steps: row.steps };
    const field = metricFields.find(([, type]) => type === row.metric_type)?.[0];
    if (field) entry[field] = row.value;
    entries.set(row.entry_id, entry);
  }
  return [...entries.values()].sort((a,b) => a.date.localeCompare(b.date));
}
export function doctorFromRow(d: Row<'doctors'>): Doctor {
  return { id: d.id, name: d.name, specialty: d.specialty, location: d.location, hospital: d.hospital, experience: d.experience_years, rating: d.rating, fee: d.consultation_fee, languages: d.languages, about: d.about, slots: Array.isArray(d.availability_schedule) ? d.availability_schedule.filter((s): s is string => typeof s === 'string') : [] };
}
export async function listDoctors() {
  const { data, error } = await supabase.from('doctors').select('*').order('name');
  if (error) throw error;
  return (data ?? []).map(doctorFromRow);
}
export async function loadHealthData(userId: string) {
  const [profile, assessments, appointments, notifications, reports] = await Promise.all([
    supabase.from('profiles').select('*').eq('user_id', userId).single(),
    supabase.from('risk_assessments').select('*').eq('user_id',userId).order('assessed_at',{ascending:false}),
    supabase.from('appointments').select('*, doctors(name,specialty)').eq('user_id',userId).order('created_at',{ascending:false}),
    supabase.from('notifications').select('*').eq('user_id',userId).order('created_at',{ascending:false}),
    supabase.from('health_reports').select('*').eq('user_id',userId).order('created_at',{ascending:false}),
  ]);
  for (const result of [profile,assessments,appointments,notifications,reports]) if(result.error) throw result.error;
  if (!profile.data) throw new Error('Your health profile could not be loaded.');
  const metricRows: Row<'health_metrics'>[] = [];
  for (let offset = 0; ; offset += 1000) {
    const {data,error} = await supabase.from('health_metrics').select('*').eq('user_id',userId).order('recorded_at').order('id').range(offset,offset+999);
    if(error) throw error;
    metricRows.push(...(data ?? []));
    if((data?.length ?? 0) < 1000) break;
  }
  const risks: StoredRisk = {};
  for (const r of assessments.data ?? []) {
    const type = r.assessment_type as keyof StoredRisk;
    if (!risks[type]) risks[type] = { score: r.risk_score, tier: r.risk_tier as 'Low'|'Moderate'|'High', factors: r.contributing_factors as unknown as NonNullable<StoredRisk['heart']>['factors'], recommendations: r.recommendations, consultAdvisory: r.consult_advisory, model: r.model, generatedAt: r.assessed_at };
  }
  return { profile: profileFromRow(profile.data), preferences: profile.data.preferences, vitals: metricsFromRows(metricRows), risks,
    appointments: (appointments.data ?? []).map(a => ({id:a.id,doctorId:a.doctor_id,doctorName:a.doctors?.name ?? '',specialty:a.doctors?.specialty ?? '',date:a.appointment_date,time:a.time_slot,reason:a.reason,status:a.status as 'upcoming'|'completed'|'cancelled',mode:a.mode as 'In-person'|'Video'})),
    notifications: (notifications.data ?? []).map(n => ({id:n.id,title:n.title,body:n.message,type:n.type as 'reminder'|'hydration'|'appointment'|'wellness',read:n.is_read,createdAt:n.created_at})),
    reports: reports.data ?? [] };
}