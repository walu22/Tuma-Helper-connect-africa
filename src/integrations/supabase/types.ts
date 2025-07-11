export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      booking_status_history: {
        Row: {
          booking_id: string
          change_reason: string | null
          changed_by: string | null
          created_at: string
          id: string
          new_status: Database["public"]["Enums"]["booking_status"]
          old_status: Database["public"]["Enums"]["booking_status"] | null
        }
        Insert: {
          booking_id: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: Database["public"]["Enums"]["booking_status"]
          old_status?: Database["public"]["Enums"]["booking_status"] | null
        }
        Update: {
          booking_id?: string
          change_reason?: string | null
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: Database["public"]["Enums"]["booking_status"]
          old_status?: Database["public"]["Enums"]["booking_status"] | null
        }
        Relationships: [
          {
            foreignKeyName: "booking_status_history_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_status_history_changed_by_fkey"
            columns: ["changed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_date: string
          booking_time: string
          created_at: string
          customer_address: string
          customer_id: string
          customer_name: string
          customer_notes: string | null
          customer_phone: string | null
          duration_hours: number | null
          id: string
          provider_id: string
          provider_notes: string | null
          service_id: string
          status: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          booking_date: string
          booking_time: string
          created_at?: string
          customer_address: string
          customer_id: string
          customer_name: string
          customer_notes?: string | null
          customer_phone?: string | null
          duration_hours?: number | null
          id?: string
          provider_id: string
          provider_notes?: string | null
          service_id: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          booking_date?: string
          booking_time?: string
          created_at?: string
          customer_address?: string
          customer_id?: string
          customer_name?: string
          customer_notes?: string | null
          customer_phone?: string | null
          duration_hours?: number | null
          id?: string
          provider_id?: string
          provider_notes?: string | null
          service_id?: string
          status?: Database["public"]["Enums"]["booking_status"] | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "bookings_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "fk_bookings_provider"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      customer_favorites: {
        Row: {
          created_at: string
          customer_id: string
          id: string
          provider_id: string
        }
        Insert: {
          created_at?: string
          customer_id: string
          id?: string
          provider_id: string
        }
        Update: {
          created_at?: string
          customer_id?: string
          id?: string
          provider_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          attachment_url: string | null
          booking_id: string
          created_at: string
          id: string
          is_read: boolean
          message_text: string
          message_type: string
          receiver_id: string
          sender_id: string
          updated_at: string
        }
        Insert: {
          attachment_url?: string | null
          booking_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_text: string
          message_type?: string
          receiver_id: string
          sender_id: string
          updated_at?: string
        }
        Update: {
          attachment_url?: string | null
          booking_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message_text?: string
          message_type?: string
          receiver_id?: string
          sender_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          city: string | null
          country: string | null
          created_at: string
          date_of_birth: string | null
          display_name: string | null
          email: string | null
          full_name: string | null
          id: string
          is_verified: boolean | null
          kyc_status: string | null
          phone: string | null
          role: Database["public"]["Enums"]["user_role"] | null
          updated_at: string
          user_id: string
          user_type: string | null
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          kyc_status?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id: string
          user_type?: string | null
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          date_of_birth?: string | null
          display_name?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          is_verified?: boolean | null
          kyc_status?: string | null
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
          updated_at?: string
          user_id?: string
          user_type?: string | null
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          provider_id: string
          start_time: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          provider_id: string
          start_time: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          provider_id?: string
          start_time?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      provider_disputes: {
        Row: {
          admin_notes: string | null
          booking_id: string
          created_at: string
          description: string
          dispute_type: string
          evidence_urls: string[] | null
          id: string
          initiated_by: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          booking_id: string
          created_at?: string
          description: string
          dispute_type: string
          evidence_urls?: string[] | null
          id?: string
          initiated_by: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          booking_id?: string
          created_at?: string
          description?: string
          dispute_type?: string
          evidence_urls?: string[] | null
          id?: string
          initiated_by?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_disputes_initiated_by_fkey"
            columns: ["initiated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "provider_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      provider_earnings: {
        Row: {
          booking_id: string
          created_at: string
          gross_amount: number
          id: string
          net_amount: number
          payment_status: string | null
          payout_date: string | null
          platform_fee: number
          provider_id: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          created_at?: string
          gross_amount: number
          id?: string
          net_amount: number
          payment_status?: string | null
          payout_date?: string | null
          platform_fee?: number
          provider_id: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          created_at?: string
          gross_amount?: number
          id?: string
          net_amount?: number
          payment_status?: string | null
          payout_date?: string | null
          platform_fee?: number
          provider_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_earnings_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_earnings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      provider_profiles: {
        Row: {
          bank_account_number: string | null
          bank_name: string | null
          bio: string | null
          business_license_url: string | null
          business_name: string | null
          business_registration_number: string | null
          created_at: string
          hourly_rate: number | null
          id: string
          id_document_url: string | null
          insurance_certificate_url: string | null
          is_available: boolean | null
          portfolio_urls: string[] | null
          rating: number | null
          service_areas: string[] | null
          tax_number: string | null
          total_jobs_completed: number | null
          updated_at: string
          user_id: string
          years_of_experience: number | null
        }
        Insert: {
          bank_account_number?: string | null
          bank_name?: string | null
          bio?: string | null
          business_license_url?: string | null
          business_name?: string | null
          business_registration_number?: string | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          id_document_url?: string | null
          insurance_certificate_url?: string | null
          is_available?: boolean | null
          portfolio_urls?: string[] | null
          rating?: number | null
          service_areas?: string[] | null
          tax_number?: string | null
          total_jobs_completed?: number | null
          updated_at?: string
          user_id: string
          years_of_experience?: number | null
        }
        Update: {
          bank_account_number?: string | null
          bank_name?: string | null
          bio?: string | null
          business_license_url?: string | null
          business_name?: string | null
          business_registration_number?: string | null
          created_at?: string
          hourly_rate?: number | null
          id?: string
          id_document_url?: string | null
          insurance_certificate_url?: string | null
          is_available?: boolean | null
          portfolio_urls?: string[] | null
          rating?: number | null
          service_areas?: string[] | null
          tax_number?: string | null
          total_jobs_completed?: number | null
          updated_at?: string
          user_id?: string
          years_of_experience?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_profiles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      provider_reviews: {
        Row: {
          admin_response: string | null
          booking_id: string
          created_at: string
          customer_id: string
          dimensions: Json | null
          helpful_count: number | null
          id: string
          is_verified: boolean | null
          provider_id: string
          rating: number
          response_date: string | null
          response_text: string | null
          review_photos: string[] | null
          review_text: string | null
          updated_at: string
        }
        Insert: {
          admin_response?: string | null
          booking_id: string
          created_at?: string
          customer_id: string
          dimensions?: Json | null
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          provider_id: string
          rating: number
          response_date?: string | null
          response_text?: string | null
          review_photos?: string[] | null
          review_text?: string | null
          updated_at?: string
        }
        Update: {
          admin_response?: string | null
          booking_id?: string
          created_at?: string
          customer_id?: string
          dimensions?: Json | null
          helpful_count?: number | null
          id?: string
          is_verified?: boolean | null
          provider_id?: string
          rating?: number
          response_date?: string | null
          response_text?: string | null
          review_photos?: string[] | null
          review_text?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_reviews_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
          {
            foreignKeyName: "provider_reviews_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      provider_skills: {
        Row: {
          certification_url: string | null
          created_at: string
          id: string
          proficiency_level: string
          provider_id: string
          skill_category: string
          skill_name: string
          updated_at: string
          verified_by_admin: boolean | null
        }
        Insert: {
          certification_url?: string | null
          created_at?: string
          id?: string
          proficiency_level: string
          provider_id: string
          skill_category: string
          skill_name: string
          updated_at?: string
          verified_by_admin?: boolean | null
        }
        Update: {
          certification_url?: string | null
          created_at?: string
          id?: string
          proficiency_level?: string
          provider_id?: string
          skill_category?: string
          skill_name?: string
          updated_at?: string
          verified_by_admin?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "provider_skills_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      provider_training_progress: {
        Row: {
          completed_at: string | null
          created_at: string
          id: string
          module_id: string
          progress_percentage: number | null
          provider_id: string
          score: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id: string
          progress_percentage?: number | null
          provider_id: string
          score?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          id?: string
          module_id?: string
          progress_percentage?: number | null
          provider_id?: string
          score?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_training_progress_module_id_fkey"
            columns: ["module_id"]
            isOneToOne: false
            referencedRelation: "training_modules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "provider_training_progress_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      search_history: {
        Row: {
          clicked_service_id: string | null
          created_at: string
          id: string
          results_count: number | null
          search_filters: Json | null
          search_query: string
          user_id: string
        }
        Insert: {
          clicked_service_id?: string | null
          created_at?: string
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query: string
          user_id: string
        }
        Update: {
          clicked_service_id?: string | null
          created_at?: string
          id?: string
          results_count?: number | null
          search_filters?: Json | null
          search_query?: string
          user_id?: string
        }
        Relationships: []
      }
      service_categories: {
        Row: {
          created_at: string
          description: string | null
          icon: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          icon?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      service_images: {
        Row: {
          created_at: string
          id: string
          image_url: string
          is_primary: boolean | null
          service_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          image_url: string
          is_primary?: boolean | null
          service_id: string
        }
        Update: {
          created_at?: string
          id?: string
          image_url?: string
          is_primary?: boolean | null
          service_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_images_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category_id: string
          created_at: string
          description: string
          id: string
          is_available: boolean | null
          location: string
          price_from: number
          price_to: number | null
          price_unit: string | null
          provider_id: string
          rating: number | null
          title: string
          total_reviews: number | null
          updated_at: string
        }
        Insert: {
          category_id: string
          created_at?: string
          description: string
          id?: string
          is_available?: boolean | null
          location: string
          price_from: number
          price_to?: number | null
          price_unit?: string | null
          provider_id: string
          rating?: number | null
          title: string
          total_reviews?: number | null
          updated_at?: string
        }
        Update: {
          category_id?: string
          created_at?: string
          description?: string
          id?: string
          is_available?: boolean | null
          location?: string
          price_from?: number
          price_to?: number | null
          price_unit?: string | null
          provider_id?: string
          rating?: number | null
          title?: string
          total_reviews?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "services_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "service_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "services_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      training_modules: {
        Row: {
          category: string
          content_url: string | null
          created_at: string
          description: string
          difficulty_level: string
          duration_minutes: number | null
          id: string
          is_mandatory: boolean | null
          title: string
          updated_at: string
        }
        Insert: {
          category: string
          content_url?: string | null
          created_at?: string
          description: string
          difficulty_level: string
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          title: string
          updated_at?: string
        }
        Update: {
          category?: string
          content_url?: string | null
          created_at?: string
          description?: string
          difficulty_level?: string
          duration_minutes?: number | null
          id?: string
          is_mandatory?: boolean | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      booking_status:
        | "pending"
        | "confirmed"
        | "in_progress"
        | "completed"
        | "cancelled"
      user_role: "customer" | "provider" | "admin"
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
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
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
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
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      booking_status: [
        "pending",
        "confirmed",
        "in_progress",
        "completed",
        "cancelled",
      ],
      user_role: ["customer", "provider", "admin"],
    },
  },
} as const
