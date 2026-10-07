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
      admin_logs: {
        Row: {
          action: string
          admin_id: string | null
          created_at: string
          details: Json | null
          id: number
          target_id: string | null
          target_type: string | null
        }
        Insert: {
          action: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: never
          target_id?: string | null
          target_type?: string | null
        }
        Update: {
          action?: string
          admin_id?: string | null
          created_at?: string
          details?: Json | null
          id?: never
          target_id?: string | null
          target_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "admin_logs_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      blocks: {
        Row: {
          content: Json
          created_at: string
          id: string
          is_active: boolean
          position: number
          profile_id: string
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          profile_id: string
          title?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          content?: Json
          created_at?: string
          id?: string
          is_active?: boolean
          position?: number
          profile_id?: string
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "blocks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      leads: {
        Row: {
          created_at: string
          email: string | null
          id: string
          name: string
          note: string | null
          phone: string | null
          profile_id: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          id?: string
          name: string
          note?: string | null
          phone?: string | null
          profile_id: string
        }
        Update: {
          created_at?: string
          email?: string | null
          id?: string
          name?: string
          note?: string | null
          phone?: string | null
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "leads_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      link_clicks: {
        Row: {
          created_at: string
          id: number
          link_id: string
          profile_id: string
        }
        Insert: {
          created_at?: string
          id?: never
          link_id: string
          profile_id: string
        }
        Update: {
          created_at?: string
          id?: never
          link_id?: string
          profile_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "link_clicks_link_id_fkey"
            columns: ["link_id"]
            isOneToOne: false
            referencedRelation: "links"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "link_clicks_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          platform: string
          position: number
          profile_id: string
          title: string | null
          url: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          position?: number
          profile_id: string
          title?: string | null
          url: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          platform?: string
          position?: number
          profile_id?: string
          title?: string | null
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "links_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      nfc_cards: {
        Row: {
          activated_at: string | null
          batch_id: string | null
          card_type: string
          code: string
          created_at: string
          id: string
          note: string | null
          profile_id: string | null
          status: string
        }
        Insert: {
          activated_at?: string | null
          batch_id?: string | null
          card_type?: string
          code: string
          created_at?: string
          id?: string
          note?: string | null
          profile_id?: string | null
          status?: string
        }
        Update: {
          activated_at?: string | null
          batch_id?: string | null
          card_type?: string
          code?: string
          created_at?: string
          id?: string
          note?: string | null
          profile_id?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "nfc_cards_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      page_views: {
        Row: {
          card_id: string | null
          city: string | null
          country: string | null
          created_at: string
          device: string | null
          id: number
          profile_id: string
          source: string
          user_agent: string | null
        }
        Insert: {
          card_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: never
          profile_id: string
          source?: string
          user_agent?: string | null
        }
        Update: {
          card_id?: string | null
          city?: string | null
          country?: string | null
          created_at?: string
          device?: string | null
          id?: never
          profile_id?: string
          source?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "page_views_card_id_fkey"
            columns: ["card_id"]
            isOneToOne: false
            referencedRelation: "nfc_cards"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "page_views_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          address: string | null
          avatar_url: string | null
          bank_info: Json | null
          bio: string | null
          cover_url: string | null
          created_at: string
          email_public: string | null
          full_name: string | null
          id: string
          is_public: boolean
          job_title: string | null
          organization: string | null
          phone: string | null
          role: string
          status: string
          theme: Json
          updated_at: string
          username: string | null
          visibility: Json
        }
        Insert: {
          address?: string | null
          avatar_url?: string | null
          bank_info?: Json | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          email_public?: string | null
          full_name?: string | null
          id: string
          is_public?: boolean
          job_title?: string | null
          organization?: string | null
          phone?: string | null
          role?: string
          status?: string
          theme?: Json
          updated_at?: string
          username?: string | null
          visibility?: Json
        }
        Update: {
          address?: string | null
          avatar_url?: string | null
          bank_info?: Json | null
          bio?: string | null
          cover_url?: string | null
          created_at?: string
          email_public?: string | null
          full_name?: string | null
          id?: string
          is_public?: boolean
          job_title?: string | null
          organization?: string | null
          phone?: string | null
          role?: string
          status?: string
          theme?: Json
          updated_at?: string
          username?: string | null
          visibility?: Json
        }
        Relationships: []
      }
      reports: {
        Row: {
          created_at: string
          id: string
          profile_id: string
          reason: string
          reporter_email: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_id: string
          reason: string
          reporter_email?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_id?: string
          reason?: string
          reporter_email?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "reports_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reports_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      reserved_usernames: {
        Row: {
          created_at: string
          username: string
        }
        Insert: {
          created_at?: string
          username: string
        }
        Update: {
          created_at?: string
          username?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      social_platforms: {
        Row: {
          icon: string | null
          is_active: boolean
          key: string
          name: string
          position: number
          url_prefix: string | null
        }
        Insert: {
          icon?: string | null
          is_active?: boolean
          key: string
          name: string
          position?: number
          url_prefix?: string | null
        }
        Update: {
          icon?: string | null
          is_active?: boolean
          key?: string
          name?: string
          position?: number
          url_prefix?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      activate_card: { Args: { p_code: string }; Returns: Json }
      admin_generate_cards: {
        Args: { p_batch_id?: string; p_card_type?: string; p_count: number }
        Returns: {
          activated_at: string | null
          batch_id: string | null
          card_type: string
          code: string
          created_at: string
          id: string
          note: string | null
          profile_id: string | null
          status: string
        }[]
        SetofOptions: {
          from: "*"
          to: "nfc_cards"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      admin_get_overview: { Args: never; Returns: Json }
      admin_get_timeseries: { Args: { p_days?: number }; Returns: Json }
      generate_card_code: { Args: { p_len?: number }; Returns: string }
      get_my_stats: { Args: { p_days?: number }; Returns: Json }
      is_admin: { Args: never; Returns: boolean }
      is_username_available: { Args: { p_username: string }; Returns: boolean }
      log_link_click: { Args: { p_link_id: string }; Returns: undefined }
      log_profile_view: {
        Args: {
          p_device?: string
          p_source?: string
          p_user_agent?: string
          p_username: string
        }
        Returns: undefined
      }
      resolve_card: {
        Args: {
          p_code: string
          p_device?: string
          p_source?: string
          p_user_agent?: string
        }
        Returns: Json
      }
      set_my_card_status: {
        Args: { p_card_id: string; p_status: string }
        Returns: undefined
      }
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
