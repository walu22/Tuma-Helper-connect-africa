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
      achievements: {
        Row: {
          category: string
          created_at: string
          description: string
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          points_reward: number | null
          rarity: string | null
          requirements: Json | null
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          points_reward?: number | null
          rarity?: string | null
          requirements?: Json | null
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          points_reward?: number | null
          rarity?: string | null
          requirements?: Json | null
        }
        Relationships: []
      }
      admin_analytics: {
        Row: {
          created_at: string
          date: string
          id: string
          metric_metadata: Json | null
          metric_name: string
          metric_value: number
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metric_metadata?: Json | null
          metric_name: string
          metric_value: number
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metric_metadata?: Json | null
          metric_name?: string
          metric_value?: number
        }
        Relationships: []
      }
      ai_recommendations: {
        Row: {
          created_at: string
          id: string
          interaction_type: string | null
          reasoning: Json | null
          recommendation_score: number
          service_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type?: string | null
          reasoning?: Json | null
          recommendation_score: number
          service_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string | null
          reasoning?: Json | null
          recommendation_score?: number
          service_id?: string
          user_id?: string
        }
        Relationships: []
      }
      api_integrations: {
        Row: {
          api_key_hash: string
          created_at: string | null
          id: string
          integration_name: string
          is_active: boolean | null
          last_used: string | null
          partner_company: string
          permissions: Json
          rate_limit: number | null
          webhook_url: string | null
        }
        Insert: {
          api_key_hash: string
          created_at?: string | null
          id?: string
          integration_name: string
          is_active?: boolean | null
          last_used?: string | null
          partner_company: string
          permissions: Json
          rate_limit?: number | null
          webhook_url?: string | null
        }
        Update: {
          api_key_hash?: string
          created_at?: string | null
          id?: string
          integration_name?: string
          is_active?: boolean | null
          last_used?: string | null
          partner_company?: string
          permissions?: Json
          rate_limit?: number | null
          webhook_url?: string | null
        }
        Relationships: []
      }
      blockchain_transactions: {
        Row: {
          amount: number
          block_number: number | null
          booking_id: string | null
          confirmed_at: string | null
          created_at: string
          currency: string
          from_address: string
          gas_fee: number | null
          id: string
          network: string
          status: string | null
          to_address: string
          transaction_hash: string
        }
        Insert: {
          amount: number
          block_number?: number | null
          booking_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency: string
          from_address: string
          gas_fee?: number | null
          id?: string
          network: string
          status?: string | null
          to_address: string
          transaction_hash: string
        }
        Update: {
          amount?: number
          block_number?: number | null
          booking_id?: string | null
          confirmed_at?: string | null
          created_at?: string
          currency?: string
          from_address?: string
          gas_fee?: number | null
          id?: string
          network?: string
          status?: string | null
          to_address?: string
          transaction_hash?: string
        }
        Relationships: []
      }
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
          city_id: string | null
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
          city_id?: string | null
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
          city_id?: string | null
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
            foreignKeyName: "bookings_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
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
      cities: {
        Row: {
          country: string
          created_at: string | null
          currency: string | null
          id: string
          is_active: boolean | null
          language_codes: string[] | null
          latitude: number | null
          longitude: number | null
          name: string
          region: string | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          country?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          language_codes?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name: string
          region?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          country?: string
          created_at?: string | null
          currency?: string | null
          id?: string
          is_active?: boolean | null
          language_codes?: string[] | null
          latitude?: number | null
          longitude?: number | null
          name?: string
          region?: string | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      community_members: {
        Row: {
          community_id: string
          id: string
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          community_id: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          community_id?: string
          id?: string
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      community_posts: {
        Row: {
          author_id: string
          comments_count: number | null
          community_id: string
          content: string
          created_at: string
          id: string
          likes_count: number | null
          post_type: string | null
          title: string
          updated_at: string
        }
        Insert: {
          author_id: string
          comments_count?: number | null
          community_id: string
          content: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_type?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          author_id?: string
          comments_count?: number | null
          community_id?: string
          content?: string
          created_at?: string
          id?: string
          likes_count?: number | null
          post_type?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      corporate_accounts: {
        Row: {
          billing_address: Json | null
          company_name: string
          company_registration: string | null
          created_at: string | null
          credit_limit: number | null
          employee_count: number | null
          id: string
          industry: string | null
          is_active: boolean | null
          payment_terms: string | null
          primary_contact_id: string | null
          updated_at: string | null
        }
        Insert: {
          billing_address?: Json | null
          company_name: string
          company_registration?: string | null
          created_at?: string | null
          credit_limit?: number | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          payment_terms?: string | null
          primary_contact_id?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_address?: Json | null
          company_name?: string
          company_registration?: string | null
          created_at?: string | null
          credit_limit?: number | null
          employee_count?: number | null
          id?: string
          industry?: string | null
          is_active?: boolean | null
          payment_terms?: string | null
          primary_contact_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "corporate_accounts_primary_contact_id_fkey"
            columns: ["primary_contact_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      crypto_wallets: {
        Row: {
          blockchain_network: string
          created_at: string
          id: string
          is_verified: boolean | null
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Insert: {
          blockchain_network: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          user_id: string
          wallet_address: string
          wallet_type: string
        }
        Update: {
          blockchain_network?: string
          created_at?: string
          id?: string
          is_verified?: boolean | null
          user_id?: string
          wallet_address?: string
          wallet_type?: string
        }
        Relationships: []
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
      enterprise_packages: {
        Row: {
          auto_renewal: boolean | null
          contract_duration: number | null
          corporate_account_id: string | null
          created_at: string | null
          discount_rate: number | null
          id: string
          is_active: boolean | null
          monthly_credit: number | null
          package_name: string
          service_types: string[]
          terms_conditions: Json | null
        }
        Insert: {
          auto_renewal?: boolean | null
          contract_duration?: number | null
          corporate_account_id?: string | null
          created_at?: string | null
          discount_rate?: number | null
          id?: string
          is_active?: boolean | null
          monthly_credit?: number | null
          package_name: string
          service_types: string[]
          terms_conditions?: Json | null
        }
        Update: {
          auto_renewal?: boolean | null
          contract_duration?: number | null
          corporate_account_id?: string | null
          created_at?: string | null
          discount_rate?: number | null
          id?: string
          is_active?: boolean | null
          monthly_credit?: number | null
          package_name?: string
          service_types?: string[]
          terms_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "enterprise_packages_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          created_at: string
          error_message: string
          error_type: string
          id: string
          page_url: string | null
          stack_trace: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          error_message: string
          error_type: string
          id?: string
          page_url?: string | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string
          error_type?: string
          id?: string
          page_url?: string | null
          stack_trace?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      financial_reports: {
        Row: {
          created_at: string
          data: Json
          generated_by: string
          id: string
          period_end: string
          period_start: string
          report_type: string
        }
        Insert: {
          created_at?: string
          data: Json
          generated_by: string
          id?: string
          period_end: string
          period_start: string
          report_type: string
        }
        Update: {
          created_at?: string
          data?: Json
          generated_by?: string
          id?: string
          period_end?: string
          period_start?: string
          report_type?: string
        }
        Relationships: []
      }
      franchises: {
        Row: {
          city_id: string | null
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          franchise_fee: number | null
          franchise_name: string
          franchisee_id: string | null
          id: string
          is_active: boolean | null
          marketing_fee_rate: number | null
          performance_metrics: Json | null
          royalty_rate: number | null
          territory_bounds: Json | null
        }
        Insert: {
          city_id?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          franchise_fee?: number | null
          franchise_name: string
          franchisee_id?: string | null
          id?: string
          is_active?: boolean | null
          marketing_fee_rate?: number | null
          performance_metrics?: Json | null
          royalty_rate?: number | null
          territory_bounds?: Json | null
        }
        Update: {
          city_id?: string | null
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          franchise_fee?: number | null
          franchise_name?: string
          franchisee_id?: string | null
          id?: string
          is_active?: boolean | null
          marketing_fee_rate?: number | null
          performance_metrics?: Json | null
          royalty_rate?: number | null
          territory_bounds?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "franchises_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "franchises_franchisee_id_fkey"
            columns: ["franchisee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["user_id"]
          },
        ]
      }
      iot_devices: {
        Row: {
          capabilities: Json | null
          created_at: string
          device_model: string | null
          device_name: string
          device_token: string | null
          device_type: string
          id: string
          last_seen: string | null
          manufacturer: string | null
          status: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          capabilities?: Json | null
          created_at?: string
          device_model?: string | null
          device_name: string
          device_token?: string | null
          device_type: string
          id?: string
          last_seen?: string | null
          manufacturer?: string | null
          status?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          capabilities?: Json | null
          created_at?: string
          device_model?: string | null
          device_name?: string
          device_token?: string | null
          device_type?: string
          id?: string
          last_seen?: string | null
          manufacturer?: string | null
          status?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      leaderboard_entries: {
        Row: {
          created_at: string
          id: string
          leaderboard_id: string
          metadata: Json | null
          period_end: string
          period_start: string
          rank: number | null
          score: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          leaderboard_id: string
          metadata?: Json | null
          period_end: string
          period_start: string
          rank?: number | null
          score: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          leaderboard_id?: string
          metadata?: Json | null
          period_end?: string
          period_start?: string
          rank?: number | null
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      leaderboards: {
        Row: {
          category: string
          city_id: string | null
          created_at: string
          id: string
          name: string
          period: string | null
          updated_at: string
        }
        Insert: {
          category: string
          city_id?: string | null
          created_at?: string
          id?: string
          name: string
          period?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          city_id?: string | null
          created_at?: string
          id?: string
          name?: string
          period?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      local_partnerships: {
        Row: {
          city_id: string | null
          contact_info: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          partner_name: string
          partner_type: string
          partnership_terms: Json | null
          revenue_share: number | null
        }
        Insert: {
          city_id?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          partner_name: string
          partner_type: string
          partnership_terms?: Json | null
          revenue_share?: number | null
        }
        Update: {
          city_id?: string | null
          contact_info?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          partner_name?: string
          partner_type?: string
          partnership_terms?: Json | null
          revenue_share?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "local_partnerships_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      local_payment_methods: {
        Row: {
          city_id: string | null
          configuration: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          method_name: string
          method_type: string
          provider: string | null
        }
        Insert: {
          city_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          method_name: string
          method_type: string
          provider?: string | null
        }
        Update: {
          city_id?: string | null
          configuration?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          method_name?: string
          method_type?: string
          provider?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "local_payment_methods_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
          },
        ]
      }
      loyalty_program: {
        Row: {
          created_at: string
          id: string
          points_balance: number | null
          tier: string | null
          total_earned_points: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          points_balance?: number | null
          tier?: string | null
          total_earned_points?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          points_balance?: number | null
          tier?: string | null
          total_earned_points?: number | null
          updated_at?: string
          user_id?: string
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
      performance_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          timestamp: string
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          timestamp?: string
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          timestamp?: string
        }
        Relationships: []
      }
      post_interactions: {
        Row: {
          created_at: string
          id: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          interaction_type: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          interaction_type?: string
          post_id?: string
          user_id?: string
        }
        Relationships: []
      }
      pricing_suggestions: {
        Row: {
          confidence_score: number
          created_at: string
          factors: Json
          id: string
          is_applied: boolean | null
          service_id: string
          suggested_price: number
        }
        Insert: {
          confidence_score: number
          created_at?: string
          factors: Json
          id?: string
          is_applied?: boolean | null
          service_id: string
          suggested_price: number
        }
        Update: {
          confidence_score?: number
          created_at?: string
          factors?: Json
          id?: string
          is_applied?: boolean | null
          service_id?: string
          suggested_price?: number
        }
        Relationships: []
      }
      profiles: {
        Row: {
          account_type: string | null
          address: string | null
          avatar_url: string | null
          city: string | null
          corporate_account_id: string | null
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
          account_type?: string | null
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          corporate_account_id?: string | null
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
          account_type?: string | null
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          corporate_account_id?: string | null
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
        Relationships: [
          {
            foreignKeyName: "profiles_corporate_account_id_fkey"
            columns: ["corporate_account_id"]
            isOneToOne: false
            referencedRelation: "corporate_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      promotional_campaigns: {
        Row: {
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id: string
          is_active: boolean | null
          max_usage: number | null
          name: string
          start_date: string
          target_audience: Json | null
          usage_count: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          end_date: string
          id?: string
          is_active?: boolean | null
          max_usage?: number | null
          name: string
          start_date: string
          target_audience?: Json | null
          usage_count?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          end_date?: string
          id?: string
          is_active?: boolean | null
          max_usage?: number | null
          name?: string
          start_date?: string
          target_audience?: Json | null
          usage_count?: number | null
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
      provider_community: {
        Row: {
          category: string | null
          created_at: string
          created_by: string
          description: string | null
          id: string
          member_count: number | null
          name: string
          privacy_level: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          member_count?: number | null
          name: string
          privacy_level?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          member_count?: number | null
          name?: string
          privacy_level?: string | null
          updated_at?: string
        }
        Relationships: []
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
          service_cities: string[] | null
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
          service_cities?: string[] | null
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
          service_cities?: string[] | null
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
      regional_campaigns: {
        Row: {
          budget_amount: number | null
          campaign_name: string
          campaign_type: string
          city_id: string | null
          created_at: string | null
          end_date: string | null
          id: string
          is_active: boolean | null
          metrics: Json | null
          start_date: string | null
          target_audience: Json | null
        }
        Insert: {
          budget_amount?: number | null
          campaign_name: string
          campaign_type: string
          city_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          metrics?: Json | null
          start_date?: string | null
          target_audience?: Json | null
        }
        Update: {
          budget_amount?: number | null
          campaign_name?: string
          campaign_type?: string
          city_id?: string | null
          created_at?: string | null
          end_date?: string | null
          id?: string
          is_active?: boolean | null
          metrics?: Json | null
          start_date?: string | null
          target_audience?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "regional_campaigns_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
            referencedColumns: ["id"]
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
      service_packages: {
        Row: {
          created_at: string
          description: string
          discount_percentage: number | null
          id: string
          is_active: boolean | null
          name: string
          package_price: number
          provider_id: string
          service_ids: string[]
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          package_price: number
          provider_id: string
          service_ids: string[]
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          discount_percentage?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          package_price?: number
          provider_id?: string
          service_ids?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category_id: string
          city_id: string | null
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
          city_id?: string | null
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
          city_id?: string | null
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
            foreignKeyName: "services_city_id_fkey"
            columns: ["city_id"]
            isOneToOne: false
            referencedRelation: "cities"
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
      smart_recommendations: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_clicked: boolean | null
          is_shown: boolean | null
          recommendation_type: string
          score: number
          user_id: string
        }
        Insert: {
          content: Json
          created_at?: string
          id?: string
          is_clicked?: boolean | null
          is_shown?: boolean | null
          recommendation_type: string
          score: number
          user_id: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_clicked?: boolean | null
          is_shown?: boolean | null
          recommendation_type?: string
          score?: number
          user_id?: string
        }
        Relationships: []
      }
      smart_service_requests: {
        Row: {
          automated: boolean | null
          created_at: string
          device_data: Json | null
          device_id: string
          id: string
          priority: string | null
          service_type: string
          status: string | null
        }
        Insert: {
          automated?: boolean | null
          created_at?: string
          device_data?: Json | null
          device_id: string
          id?: string
          priority?: string | null
          service_type: string
          status?: string | null
        }
        Update: {
          automated?: boolean | null
          created_at?: string
          device_data?: Json | null
          device_id?: string
          id?: string
          priority?: string | null
          service_type?: string
          status?: string | null
        }
        Relationships: []
      }
      support_tickets: {
        Row: {
          assigned_admin_id: string | null
          created_at: string
          customer_id: string
          description: string
          id: string
          priority: string
          resolution: string | null
          status: string
          subject: string
          updated_at: string
        }
        Insert: {
          assigned_admin_id?: string | null
          created_at?: string
          customer_id: string
          description: string
          id?: string
          priority?: string
          resolution?: string | null
          status?: string
          subject: string
          updated_at?: string
        }
        Update: {
          assigned_admin_id?: string | null
          created_at?: string
          customer_id?: string
          description?: string
          id?: string
          priority?: string
          resolution?: string | null
          status?: string
          subject?: string
          updated_at?: string
        }
        Relationships: []
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
      user_achievements: {
        Row: {
          achievement_id: string
          earned_at: string
          id: string
          progress: Json | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          earned_at?: string
          id?: string
          progress?: Json | null
          user_id?: string
        }
        Relationships: []
      }
      user_behavior_tracking: {
        Row: {
          action_type: string
          created_at: string
          id: string
          metadata: Json | null
          session_id: string | null
          target_id: string | null
          target_type: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          session_id?: string | null
          target_id?: string | null
          target_type?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          id: string
          preference_type: string
          preference_value: Json
          updated_at: string
          user_id: string
          weight: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          preference_type: string
          preference_value?: Json
          updated_at?: string
          user_id: string
          weight?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          preference_type?: string
          preference_value?: Json
          updated_at?: string
          user_id?: string
          weight?: number | null
        }
        Relationships: []
      }
      white_label_configs: {
        Row: {
          billing_model: string | null
          branding: Json
          client_name: string
          created_at: string | null
          custom_terms: Json | null
          domain: string | null
          features_enabled: Json | null
          id: string
          is_active: boolean | null
          revenue_share_rate: number | null
        }
        Insert: {
          billing_model?: string | null
          branding: Json
          client_name: string
          created_at?: string | null
          custom_terms?: Json | null
          domain?: string | null
          features_enabled?: Json | null
          id?: string
          is_active?: boolean | null
          revenue_share_rate?: number | null
        }
        Update: {
          billing_model?: string | null
          branding?: Json
          client_name?: string
          created_at?: string | null
          custom_terms?: Json | null
          domain?: string | null
          features_enabled?: Json | null
          id?: string
          is_active?: boolean | null
          revenue_share_rate?: number | null
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
