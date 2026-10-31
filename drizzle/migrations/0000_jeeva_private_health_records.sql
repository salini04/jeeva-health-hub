CREATE TABLE public.profiles (
 user_id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
 full_name text NOT NULL DEFAULT '', email text NOT NULL DEFAULT '', age integer NOT NULL DEFAULT 0, gender text NOT NULL DEFAULT 'other' CHECK (gender IN ('male','female','other')),
 height numeric NOT NULL DEFAULT 0, weight numeric NOT NULL DEFAULT 0, blood_pressure jsonb NOT NULL DEFAULT '{"systolic":0,"diastolic":0}',
 activity_level text NOT NULL DEFAULT 'low', smoking_status boolean NOT NULL DEFAULT false, alcohol_consumption text NOT NULL DEFAULT 'never', medical_history text NOT NULL DEFAULT '', allergies text NOT NULL DEFAULT '',
 resting_heart_rate numeric NOT NULL DEFAULT 0, cholesterol numeric NOT NULL DEFAULT 0, fasting_glucose numeric NOT NULL DEFAULT 0, hba1c numeric NOT NULL DEFAULT 0, waist_cm numeric NOT NULL DEFAULT 0, blood_group text NOT NULL DEFAULT '', emergency_contact text NOT NULL DEFAULT '', preferences jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.profiles TO authenticated;
GRANT ALL ON public.profiles TO service_role;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_profiles ON public.profiles FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE TABLE public.health_metrics (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
 metric_type text NOT NULL CHECK (metric_type IN ('weight','blood_pressure_systolic','blood_pressure_diastolic','blood_glucose','heart_rate','water_intake','sleep_hours','activity_minutes')), value numeric NOT NULL, unit text NOT NULL, recorded_at timestamptz NOT NULL DEFAULT now(), notes text NOT NULL DEFAULT '', entry_id uuid NOT NULL DEFAULT gen_random_uuid(), steps integer NOT NULL DEFAULT 0, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_metrics TO authenticated;
GRANT ALL ON public.health_metrics TO service_role;
ALTER TABLE public.health_metrics ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_metrics ON public.health_metrics FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX metrics_user_recorded ON public.health_metrics(user_id, recorded_at);
CREATE TABLE public.risk_assessments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
 assessment_type text NOT NULL CHECK (assessment_type IN ('heart','diabetes')), risk_score numeric NOT NULL CHECK (risk_score BETWEEN 0 AND 100), risk_tier text NOT NULL CHECK (risk_tier IN ('Low','Moderate','High')), input_parameters jsonb NOT NULL DEFAULT '{}', contributing_factors jsonb NOT NULL DEFAULT '[]', recommendations text[] NOT NULL DEFAULT '{}', consult_advisory text NOT NULL DEFAULT '', model text NOT NULL DEFAULT '', assessed_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.risk_assessments TO authenticated;
GRANT ALL ON public.risk_assessments TO service_role;
ALTER TABLE public.risk_assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_assessments ON public.risk_assessments FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX assessments_user_date ON public.risk_assessments(user_id, assessed_at);
CREATE TABLE public.doctors (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), name text NOT NULL, specialty text NOT NULL, qualification text NOT NULL, experience_years integer NOT NULL DEFAULT 0, location text NOT NULL, rating numeric NOT NULL DEFAULT 0, avatar_url text, consultation_fee numeric NOT NULL DEFAULT 0, availability_schedule jsonb NOT NULL DEFAULT '[]', hospital text NOT NULL DEFAULT '', languages text[] NOT NULL DEFAULT '{}', about text NOT NULL DEFAULT '', created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.doctors TO anon, authenticated;
GRANT ALL ON public.doctors TO service_role;
ALTER TABLE public.doctors ENABLE ROW LEVEL SECURITY;
CREATE POLICY public_doctor_directory ON public.doctors FOR SELECT TO anon, authenticated USING (true);
CREATE TABLE public.appointments (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE, doctor_id uuid NOT NULL REFERENCES public.doctors(id), appointment_date date NOT NULL, time_slot text NOT NULL, reason text NOT NULL, status text NOT NULL DEFAULT 'upcoming' CHECK (status IN ('upcoming','completed','cancelled')), mode text NOT NULL DEFAULT 'In-person' CHECK (mode IN ('In-person','Video')), created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.appointments TO authenticated;
GRANT ALL ON public.appointments TO service_role;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_appointments ON public.appointments FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX appointments_user ON public.appointments(user_id);
CREATE TABLE public.notifications (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE, title text NOT NULL, message text NOT NULL, type text NOT NULL DEFAULT 'reminder' CHECK (type IN ('reminder','hydration','appointment','wellness')), is_read boolean NOT NULL DEFAULT false, created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.notifications TO authenticated;
GRANT ALL ON public.notifications TO service_role;
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_notifications ON public.notifications FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX notifications_user ON public.notifications(user_id);
CREATE TABLE public.health_reports (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE, title text NOT NULL, summary text NOT NULL DEFAULT '', report_data jsonb NOT NULL DEFAULT '{}', created_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.health_reports TO authenticated;
GRANT ALL ON public.health_reports TO service_role;
ALTER TABLE public.health_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY own_reports ON public.health_reports FOR ALL TO authenticated USING ((SELECT auth.uid()) = user_id) WITH CHECK ((SELECT auth.uid()) = user_id);
CREATE INDEX reports_user ON public.health_reports(user_id);
CREATE FUNCTION public.jeeva_updated_at() RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$ BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;
CREATE TRIGGER profile_updated BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.jeeva_updated_at();
CREATE TRIGGER appointment_updated BEFORE UPDATE ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.jeeva_updated_at();
CREATE TRIGGER doctor_updated BEFORE UPDATE ON public.doctors FOR EACH ROW EXECUTE FUNCTION public.jeeva_updated_at();
CREATE FUNCTION public.jeeva_new_user() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 INSERT INTO public.profiles(user_id, full_name, email) VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'full_name',''), COALESCE(NEW.email,''));
 INSERT INTO public.notifications(user_id,title,message,type) VALUES (NEW.id,'Welcome to Jeeva','Your account is ready. Add your health profile and first vitals reading.','wellness');
 RETURN NEW;
END; $$;
CREATE TRIGGER jeeva_create_profile AFTER INSERT ON auth.users FOR EACH ROW EXECUTE FUNCTION public.jeeva_new_user();
CREATE FUNCTION public.jeeva_booking_notification() RETURNS trigger LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$ BEGIN
 INSERT INTO public.notifications(user_id,title,message,type) VALUES (NEW.user_id,'Appointment booked','Your appointment is scheduled for ' || NEW.appointment_date || ' at ' || NEW.time_slot || '.','appointment'); RETURN NEW;
END; $$;
CREATE TRIGGER jeeva_booked AFTER INSERT ON public.appointments FOR EACH ROW EXECUTE FUNCTION public.jeeva_booking_notification();
REVOKE ALL ON FUNCTION public.jeeva_new_user(), public.jeeva_booking_notification() FROM PUBLIC, anon, authenticated;