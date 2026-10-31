export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      appointments: {
        Row: {
          appointment_date: string
          created_at: string
          doctor_id: string
          id: string
          mode: string
          reason: string
          status: string
          time_slot: string
          updated_at: string
          user_id: string
        }
        Insert: {
          appointment_date: string
          created_at?: string
          doctor_id: string
          id?: string
          mode?: string
          reason: string
          status?: string
          time_slot: string
          updated_at?: string
          user_id: string
        }
        Update: {
          appointment_date?: string
          created_at?: string
          doctor_id?: string
          id?: string
          mode?: string
          reason?: string
          status?: string
          time_slot?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "appointments_doctor_id_fkey"
            columns: ["doctor_id"]
            isOneToOne: false
            referencedRelation: "doctors"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "appointments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      doctors: {
        Row: {
          about: string
          availability_schedule: Json
          avatar_url: string | null
          consultation_fee: number
          created_at: string
          experience_years: number
          hospital: string
          id: string
          languages: string[]
          location: string
          name: string
          qualification: string
          rating: number
          specialty: string
          updated_at: string
        }
        Insert: {
          about?: string
          availability_schedule?: Json
          avatar_url?: string | null
          consultation_fee?: number
          created_at?: string
          experience_years?: number
          hospital?: string
          id?: string
          languages?: string[]
          location: string
          name: string
          qualification: string
          rating?: number
          specialty: string
          updated_at?: string
        }
        Update: {
          about?: string
          availability_schedule?: Json
          avatar_url?: string | null
          consultation_fee?: number
          created_at?: string
          experience_years?: number
          hospital?: string
          id?: string
          languages?: string[]
          location?: string
          name?: string
          qualification?: string
          rating?: number
          specialty?: string
          updated_at?: string
        }
        Relationships: []
      }
      health_metrics: {
        Row: {
          created_at: string
          entry_id: string
          id: string
          metric_type: string
          notes: string
          recorded_at: string
          steps: number
          unit: string
          user_id: string
          value: number
        }
        Insert: {
          created_at?: string
          entry_id?: string
          id?: string
          metric_type: string
          notes?: string
          recorded_at?: string
          steps?: number
          unit: string
          user_id: string
          value: number
        }
        Update: {
          created_at?: string
          entry_id?: string
          id?: string
          metric_type?: string
          notes?: string
          recorded_at?: string
          steps?: number
          unit?: string
          user_id?: string
          value?: number
        }
        Relationships: [
          {
            foreignKeyName: "health_metrics_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      health_reports: {
        Row: {
          created_at: string
          id: string
          report_data: Json
          summary: string
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          report_data?: Json
          summary?: string
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          report_data?: Json
          summary?: string
          title?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_reports_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      profiles: {
        Row: {
          activity_level: string
          age: number
          alcohol_consumption: string
          allergies: string
          blood_group: string
          blood_pressure: Json
          cholesterol: number
          created_at: string
          email: string
          emergency_contact: string
          fasting_glucose: number
          full_name: string
          gender: string
          hba1c: number
          height: number
          medical_history: string
          preferences: Json
          resting_heart_rate: number
          smoking_status: boolean
          updated_at: string
          user_id: string
          waist_cm: number
          weight: number
        }
        Insert: {
          activity_level?: string
          age?: number
          alcohol_consumption?: string
          allergies?: string
          blood_group?: string
          blood_pressure?: Json
          cholesterol?: number
          created_at?: string
          email?: string
          emergency_contact?: string
          fasting_glucose?: number
          full_name?: string
          gender?: string
          hba1c?: number
          height?: number
          medical_history?: string
          preferences?: Json
          resting_heart_rate?: number
          smoking_status?: boolean
          updated_at?: string
          user_id: string
          waist_cm?: number
          weight?: number
        }
        Update: {
          activity_level?: string
          age?: number
          alcohol_consumption?: string
          allergies?: string
          blood_group?: string
          blood_pressure?: Json
          cholesterol?: number
          created_at?: string
          email?: string
          emergency_contact?: string
          fasting_glucose?: number
          full_name?: string
          gender?: string
          hba1c?: number
          height?: number
          medical_history?: string
          preferences?: Json
          resting_heart_rate?: number
          smoking_status?: boolean
          updated_at?: string
          user_id?: string
          waist_cm?: number
          weight?: number
        }
        Relationships: []
      }
      risk_assessments: {
        Row: {
          assessed_at: string
          assessment_type: string
          consult_advisory: string
          contributing_factors: Json
          id: string
          input_parameters: Json
          model: string
          recommendations: string[]
          risk_score: number
          risk_tier: string
          user_id: string
        }
        Insert: {
          assessed_at?: string
          assessment_type: string
          consult_advisory?: string
          contributing_factors?: Json
          id?: string
          input_parameters?: Json
          model?: string
          recommendations?: string[]
          risk_score: number
          risk_tier: string
          user_id: string
        }
        Update: {
          assessed_at?: string
          assessment_type?: string
          consult_advisory?: string
          contributing_factors?: Json
          id?: string
          input_parameters?: Json
          model?: string
          recommendations?: string[]
          risk_score?: number
          risk_tier?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "risk_assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
