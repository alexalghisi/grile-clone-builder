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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admitere_papers: {
        Row: {
          created_at: string
          description: string | null
          file_size_bytes: number | null
          id: string
          ocr_text: string | null
          page_count: number | null
          paper_type: string
          pdf_url: string | null
          session: string | null
          source_url: string | null
          storage_path: string | null
          subject_name: string
          subject_slug: string
          title: string
          university_name: string
          university_slug: string
          updated_at: string
          variant: string | null
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          file_size_bytes?: number | null
          id?: string
          ocr_text?: string | null
          page_count?: number | null
          paper_type?: string
          pdf_url?: string | null
          session?: string | null
          source_url?: string | null
          storage_path?: string | null
          subject_name: string
          subject_slug: string
          title: string
          university_name: string
          university_slug: string
          updated_at?: string
          variant?: string | null
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          file_size_bytes?: number | null
          id?: string
          ocr_text?: string | null
          page_count?: number | null
          paper_type?: string
          pdf_url?: string | null
          session?: string | null
          source_url?: string | null
          storage_path?: string | null
          subject_name?: string
          subject_slug?: string
          title?: string
          university_name?: string
          university_slug?: string
          updated_at?: string
          variant?: string | null
          year?: number
        }
        Relationships: []
      }
      articole: {
        Row: {
          content_md: string
          description: string
          id: string
          keywords: string
          materie: string
          published_at: string
          slug: string
          title: string
        }
        Insert: {
          content_md: string
          description: string
          id?: string
          keywords?: string
          materie: string
          published_at?: string
          slug: string
          title: string
        }
        Update: {
          content_md?: string
          description?: string
          id?: string
          keywords?: string
          materie?: string
          published_at?: string
          slug?: string
          title?: string
        }
        Relationships: []
      }
      attempts: {
        Row: {
          answers: Json | null
          created_at: string
          id: string
          mode: string
          score: number
          subject_id: string | null
          time_seconds: number
          total: number
          university_id: string | null
          user_id: string
        }
        Insert: {
          answers?: Json | null
          created_at?: string
          id?: string
          mode?: string
          score?: number
          subject_id?: string | null
          time_seconds?: number
          total?: number
          university_id?: string | null
          user_id: string
        }
        Update: {
          answers?: Json | null
          created_at?: string
          id?: string
          mode?: string
          score?: number
          subject_id?: string | null
          time_seconds?: number
          total?: number
          university_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "attempts_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "attempts_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      bac_papers: {
        Row: {
          created_at: string
          description: string | null
          id: string
          paper_type: string
          pdf_url: string | null
          profil: string | null
          session: string
          slug: string
          source_url: string | null
          storage_path: string | null
          subject_name: string
          subject_slug: string
          title: string
          updated_at: string
          variant: string | null
          year: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          paper_type?: string
          pdf_url?: string | null
          profil?: string | null
          session?: string
          slug: string
          source_url?: string | null
          storage_path?: string | null
          subject_name: string
          subject_slug: string
          title: string
          updated_at?: string
          variant?: string | null
          year: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          paper_type?: string
          pdf_url?: string | null
          profil?: string | null
          session?: string
          slug?: string
          source_url?: string | null
          storage_path?: string | null
          subject_name?: string
          subject_slug?: string
          title?: string
          updated_at?: string
          variant?: string | null
          year?: number
        }
        Relationships: []
      }
      content_job_state: {
        Row: {
          cron_secret: string
          grile_cursor: number
          id: string
          last_result: Json | null
          last_run_date: string | null
          locked_until: string | null
          paused_reason: string | null
          updated_at: string
        }
        Insert: {
          cron_secret?: string
          grile_cursor?: number
          id: string
          last_result?: Json | null
          last_run_date?: string | null
          locked_until?: string | null
          paused_reason?: string | null
          updated_at?: string
        }
        Update: {
          cron_secret?: string
          grile_cursor?: number
          id?: string
          last_result?: Json | null
          last_run_date?: string | null
          locked_until?: string | null
          paused_reason?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      email_leads: {
        Row: {
          created_at: string
          email: string
          id: string
          quiz_slug: string | null
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          quiz_slug?: string | null
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          quiz_slug?: string | null
          source?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      feedback: {
        Row: {
          category: string
          created_at: string
          email: string | null
          grila_id: string | null
          id: string
          message: string
          page_url: string | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          email?: string | null
          grila_id?: string | null
          id?: string
          message: string
          page_url?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          email?: string | null
          grila_id?: string | null
          id?: string
          message?: string
          page_url?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      grile: {
        Row: {
          created_at: string
          dificultate: string
          explicatie: string | null
          facultate: string
          id: string
          intrebare: string
          materie: string
          raspuns_corect: string
          referinta_programa: string | null
          sursa: string | null
          universitate: string
          variante: Json
        }
        Insert: {
          created_at?: string
          dificultate?: string
          explicatie?: string | null
          facultate: string
          id?: string
          intrebare: string
          materie: string
          raspuns_corect: string
          referinta_programa?: string | null
          sursa?: string | null
          universitate: string
          variante: Json
        }
        Update: {
          created_at?: string
          dificultate?: string
          explicatie?: string | null
          facultate?: string
          id?: string
          intrebare?: string
          materie?: string
          raspuns_corect?: string
          referinta_programa?: string | null
          sursa?: string | null
          universitate?: string
          variante?: Json
        }
        Relationships: []
      }
      health_checks: {
        Row: {
          consecutive_failures: number
          created_at: string
          enabled: boolean
          expected_status: number
          id: string
          label: string
          last_alert_at: string | null
          last_checked_at: string | null
          last_error: string | null
          last_response_ms: number | null
          last_status: number | null
          max_response_ms: number
          updated_at: string
          url: string
        }
        Insert: {
          consecutive_failures?: number
          created_at?: string
          enabled?: boolean
          expected_status?: number
          id?: string
          label: string
          last_alert_at?: string | null
          last_checked_at?: string | null
          last_error?: string | null
          last_response_ms?: number | null
          last_status?: number | null
          max_response_ms?: number
          updated_at?: string
          url: string
        }
        Update: {
          consecutive_failures?: number
          created_at?: string
          enabled?: boolean
          expected_status?: number
          id?: string
          label?: string
          last_alert_at?: string | null
          last_checked_at?: string | null
          last_error?: string | null
          last_response_ms?: number | null
          last_status?: number | null
          max_response_ms?: number
          updated_at?: string
          url?: string
        }
        Relationships: []
      }
      meditatii_leads: {
        Row: {
          budget: string | null
          contact: string
          contact_type: string
          created_at: string
          id: string
          level: string | null
          message: string | null
          page_url: string | null
          subject: string
        }
        Insert: {
          budget?: string | null
          contact: string
          contact_type?: string
          created_at?: string
          id?: string
          level?: string | null
          message?: string | null
          page_url?: string | null
          subject: string
        }
        Update: {
          budget?: string | null
          contact?: string
          contact_type?: string
          created_at?: string
          id?: string
          level?: string | null
          message?: string | null
          page_url?: string | null
          subject?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          consented_at: string
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          consented_at?: string
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          consented_at?: string
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          correct_index: number
          created_at: string
          difficulty: string | null
          explanation: string | null
          figure_url: string | null
          generation_key: string | null
          id: string
          options: Json
          problem_number: number | null
          question_text: string
          session: string | null
          solution_md: string | null
          subject_id: string
          year: number | null
        }
        Insert: {
          correct_index: number
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          figure_url?: string | null
          generation_key?: string | null
          id?: string
          options: Json
          problem_number?: number | null
          question_text: string
          session?: string | null
          solution_md?: string | null
          subject_id: string
          year?: number | null
        }
        Update: {
          correct_index?: number
          created_at?: string
          difficulty?: string | null
          explanation?: string | null
          figure_url?: string | null
          generation_key?: string | null
          id?: string
          options?: Json
          problem_number?: number | null
          question_text?: string
          session?: string | null
          solution_md?: string | null
          subject_id?: string
          year?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "questions_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_jobs: {
        Row: {
          error_message: string | null
          finished_at: string | null
          id: string
          log: Json | null
          pdfs_discovered: number
          pdfs_failed: number
          pdfs_imported: number
          source_id: string | null
          started_at: string
          status: string
          university_slug: string
        }
        Insert: {
          error_message?: string | null
          finished_at?: string | null
          id?: string
          log?: Json | null
          pdfs_discovered?: number
          pdfs_failed?: number
          pdfs_imported?: number
          source_id?: string | null
          started_at?: string
          status?: string
          university_slug: string
        }
        Update: {
          error_message?: string | null
          finished_at?: string | null
          id?: string
          log?: Json | null
          pdfs_discovered?: number
          pdfs_failed?: number
          pdfs_imported?: number
          source_id?: string | null
          started_at?: string
          status?: string
          university_slug?: string
        }
        Relationships: [
          {
            foreignKeyName: "scrape_jobs_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "scrape_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      scrape_sources: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          last_error: string | null
          last_run_at: string | null
          pdf_url_pattern: string | null
          pdfs_discovered: number
          pdfs_imported: number
          root_url: string
          status: string
          subject_hints: Json | null
          university_name: string
          university_slug: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_error?: string | null
          last_run_at?: string | null
          pdf_url_pattern?: string | null
          pdfs_discovered?: number
          pdfs_imported?: number
          root_url: string
          status?: string
          subject_hints?: Json | null
          university_name: string
          university_slug: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          last_error?: string | null
          last_run_at?: string | null
          pdf_url_pattern?: string | null
          pdfs_discovered?: number
          pdfs_imported?: number
          root_url?: string
          status?: string
          subject_hints?: Json | null
          university_name?: string
          university_slug?: string
          updated_at?: string
        }
        Relationships: []
      }
      simulation_purchases: {
        Row: {
          created_at: string | null
          environment: string
          id: string
          simulation_slug: string
          stripe_session_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          environment?: string
          id?: string
          simulation_slug: string
          stripe_session_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          environment?: string
          id?: string
          simulation_slug?: string
          stripe_session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      simulation_questions: {
        Row: {
          created_at: string
          id: string
          order_index: number
          question_id: string
          simulation_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          order_index?: number
          question_id: string
          simulation_id: string
        }
        Update: {
          created_at?: string
          id?: string
          order_index?: number
          question_id?: string
          simulation_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulation_questions_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulation_questions_simulation_id_fkey"
            columns: ["simulation_id"]
            isOneToOne: false
            referencedRelation: "simulations"
            referencedColumns: ["id"]
          },
        ]
      }
      simulations: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number
          id: string
          is_premium: boolean
          session: string | null
          slug: string
          subject_id: string | null
          title: string
          total_questions: number
          university_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_premium?: boolean
          session?: string | null
          slug: string
          subject_id?: string | null
          title: string
          total_questions?: number
          university_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number
          id?: string
          is_premium?: boolean
          session?: string | null
          slug?: string
          subject_id?: string | null
          title?: string
          total_questions?: number
          university_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "simulations_subject_id_fkey"
            columns: ["subject_id"]
            isOneToOne: false
            referencedRelation: "subjects"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "simulations_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      subjects: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          question_count: number
          slug: string
          university_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          question_count?: number
          slug: string
          university_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          question_count?: number
          slug?: string
          university_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subjects_university_id_fkey"
            columns: ["university_id"]
            isOneToOne: false
            referencedRelation: "universities"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          cancel_at_period_end: boolean | null
          created_at: string | null
          current_period_end: string | null
          current_period_start: string | null
          environment: string
          id: string
          price_id: string
          product_id: string
          status: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id: string
          product_id: string
          status?: string
          stripe_customer_id: string
          stripe_subscription_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          cancel_at_period_end?: boolean | null
          created_at?: string | null
          current_period_end?: string | null
          current_period_start?: string | null
          environment?: string
          id?: string
          price_id?: string
          product_id?: string
          status?: string
          stripe_customer_id?: string
          stripe_subscription_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      universities: {
        Row: {
          city: string
          created_at: string
          description: string | null
          id: string
          logo_url: string | null
          name: string
          short_name: string
          slug: string
        }
        Insert: {
          city: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name: string
          short_name: string
          slug: string
        }
        Update: {
          city?: string
          created_at?: string
          description?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          short_name?: string
          slug?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      grile_groups: {
        Args: never
        Returns: {
          facultate: string
          materie: string
          universitate: string
        }[]
      }
      has_active_subscription: {
        Args: { check_env?: string; user_uuid: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      save_daily_question_batch: {
        Args: {
          p_batch: number
          p_day: string
          p_rows: Json
          p_subject: string
        }
        Returns: number
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
    Enums: {
      app_role: ["admin", "user"],
    },
  },
} as const
