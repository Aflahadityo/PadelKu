export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          actor_id: string | null
          actor_role: string | null
          created_at: string
          id: string
          metadata: Json
          new_data: Json | null
          old_data: Json | null
          record_id: string | null
          table_name: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_role?: string | null
          created_at?: string
          id?: string
          metadata?: Json
          new_data?: Json | null
          old_data?: Json | null
          record_id?: string | null
          table_name?: string
        }
        Relationships: []
      }
      booking_items: {
        Row: {
          booking_id: string
          booking_slot_id: string
          court_id: string
          created_at: string
          ends_at: string
          id: string
          is_active: boolean
          price_rupiah: number
          starts_at: string
        }
        Insert: {
          booking_id: string
          booking_slot_id: string
          court_id: string
          created_at?: string
          ends_at: string
          id?: string
          is_active?: boolean
          price_rupiah: number
          starts_at: string
        }
        Update: {
          booking_id?: string
          booking_slot_id?: string
          court_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          is_active?: boolean
          price_rupiah?: number
          starts_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_items_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_booking_slot_id_fkey"
            columns: ["booking_slot_id"]
            isOneToOne: false
            referencedRelation: "booking_slots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_items_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
        ]
      }
      booking_slots: {
        Row: {
          blocked_reason: string | null
          court_id: string
          created_at: string
          ends_at: string
          id: string
          lock_booking_id: string | null
          lock_expires_at: string | null
          locked_at: string | null
          locked_by: string | null
          price_rupiah: number
          starts_at: string
          status: Database["public"]["Enums"]["booking_slot_status"]
          updated_at: string
        }
        Insert: {
          blocked_reason?: string | null
          court_id: string
          created_at?: string
          ends_at: string
          id?: string
          lock_booking_id?: string | null
          lock_expires_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          price_rupiah: number
          starts_at: string
          status?: Database["public"]["Enums"]["booking_slot_status"]
          updated_at?: string
        }
        Update: {
          blocked_reason?: string | null
          court_id?: string
          created_at?: string
          ends_at?: string
          id?: string
          lock_booking_id?: string | null
          lock_expires_at?: string | null
          locked_at?: string | null
          locked_by?: string | null
          price_rupiah?: number
          starts_at?: string
          status?: Database["public"]["Enums"]["booking_slot_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "booking_slots_court_id_fkey"
            columns: ["court_id"]
            isOneToOne: false
            referencedRelation: "courts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_slots_lock_booking_id_fkey"
            columns: ["lock_booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "booking_slots_locked_by_fkey"
            columns: ["locked_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          booking_code: string
          cancellation_reason: string | null
          cancelled_at: string | null
          completed_at: string | null
          confirmed_at: string | null
          created_at: string
          id: string
          idempotency_key: string | null
          initial_payment_expires_at: string
          payment_mode: Database["public"]["Enums"]["booking_payment_mode"]
          payment_expires_at: string | null
          status: Database["public"]["Enums"]["booking_status"]
          total_price_rupiah: number
          updated_at: string
          user_id: string
          venue_id: string
        }
        Insert: {
          booking_code?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          initial_payment_expires_at?: string | null
          payment_mode?: Database["public"]["Enums"]["booking_payment_mode"]
          payment_expires_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price_rupiah: number
          updated_at?: string
          user_id: string
          venue_id: string
        }
        Update: {
          booking_code?: string
          cancellation_reason?: string | null
          cancelled_at?: string | null
          completed_at?: string | null
          confirmed_at?: string | null
          created_at?: string
          id?: string
          idempotency_key?: string | null
          initial_payment_expires_at?: string | null
          payment_mode?: Database["public"]["Enums"]["booking_payment_mode"]
          payment_expires_at?: string | null
          status?: Database["public"]["Enums"]["booking_status"]
          total_price_rupiah?: number
          updated_at?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      courts: {
        Row: {
          court_number: number
          created_at: string
          id: string
          indoor: boolean
          is_active: boolean
          name: string
          price_per_hour_rupiah: number
          surface_type: string
          updated_at: string
          venue_id: string
        }
        Insert: {
          court_number: number
          created_at?: string
          id?: string
          indoor?: boolean
          is_active?: boolean
          name: string
          price_per_hour_rupiah: number
          surface_type?: string
          updated_at?: string
          venue_id: string
        }
        Update: {
          court_number?: number
          created_at?: string
          id?: string
          indoor?: boolean
          is_active?: boolean
          name?: string
          price_per_hour_rupiah?: number
          surface_type?: string
          updated_at?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "courts_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          data: Json
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          message?: string
          read_at?: string | null
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
            referencedColumns: ["id"]
          },
        ]
      }
      payment_disputes: {
        Row: {
          booking_id: string
          id: string
          opened_at: string
          opened_by: string
          payment_id: string
          reason: string
          resolution: string | null
          resolved_at: string | null
          resolved_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          booking_id: string
          id?: string
          opened_at?: string
          opened_by: string
          payment_id: string
          reason: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          booking_id?: string
          id?: string
          opened_at?: string
          opened_by?: string
          payment_id?: string
          reason?: string
          resolution?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_disputes_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_opened_by_fkey"
            columns: ["opened_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_payment_booking_fkey"
            columns: ["payment_id", "booking_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id", "booking_id"]
          },
          {
            foreignKeyName: "payment_disputes_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: true
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_disputes_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_events: {
        Row: {
          actor_id: string | null
          actor_role: string
          booking_id: string
          booking_status: Database["public"]["Enums"]["booking_status"]
          created_at: string
          event_type: string
          from_status: Database["public"]["Enums"]["payment_status"] | null
          id: string
          idempotency_key: string
          metadata: Json
          payment_id: string
          reason: string | null
          request_payload: Json
          to_status: Database["public"]["Enums"]["payment_status"]
        }
        Insert: {
          actor_id?: string | null
          actor_role: string
          booking_id: string
          booking_status: Database["public"]["Enums"]["booking_status"]
          created_at?: string
          event_type: string
          from_status?: Database["public"]["Enums"]["payment_status"] | null
          id?: string
          idempotency_key: string
          metadata?: Json
          payment_id: string
          reason?: string | null
          request_payload: Json
          to_status: Database["public"]["Enums"]["payment_status"]
        }
        Update: {
          actor_id?: string | null
          actor_role?: string
          booking_id?: string
          booking_status?: Database["public"]["Enums"]["booking_status"]
          created_at?: string
          event_type?: string
          from_status?: Database["public"]["Enums"]["payment_status"] | null
          id?: string
          idempotency_key?: string
          metadata?: Json
          payment_id?: string
          reason?: string | null
          request_payload?: Json
          to_status?: Database["public"]["Enums"]["payment_status"]
        }
        Relationships: [
          {
            foreignKeyName: "payment_events_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_events_payment_booking_fkey"
            columns: ["payment_id", "booking_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id", "booking_id"]
          },
          {
            foreignKeyName: "payment_events_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount_rupiah: number
          booking_id: string
          commission_bps: number
          commission_rupiah: number
          created_at: string
          expires_at: string
          external_transaction_id: string
          failure_code: string | null
          failure_reason: string | null
          id: string
          idempotency_key: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at: string | null
          provider: string
          provider_payload: Json
          refunded_at: string | null
          status: Database["public"]["Enums"]["payment_status"]
          terminal_at: string | null
          updated_at: string
          venue_net_rupiah: number
        }
        Insert: {
          amount_rupiah: number
          booking_id: string
          commission_bps?: number
          commission_rupiah?: number
          created_at?: string
          expires_at?: string
          external_transaction_id: string
          failure_code?: string | null
          failure_reason?: string | null
          id?: string
          idempotency_key?: string
          method: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          provider: string
          provider_payload?: Json
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          terminal_at?: string | null
          updated_at?: string
          venue_net_rupiah: number
        }
        Update: {
          amount_rupiah?: number
          booking_id?: string
          commission_bps?: number
          commission_rupiah?: number
          created_at?: string
          expires_at?: string
          external_transaction_id?: string
          failure_code?: string | null
          failure_reason?: string | null
          id?: string
          idempotency_key?: string
          method?: Database["public"]["Enums"]["payment_method"]
          paid_at?: string | null
          provider?: string
          provider_payload?: Json
          refunded_at?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          terminal_at?: string | null
          updated_at?: string
          venue_net_rupiah?: number
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          phone: string | null
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      reviews: {
        Row: {
          booking_id: string
          comment: string | null
          created_at: string
          id: string
          rating: number
          updated_at: string
          user_id: string
          venue_id: string
        }
        Insert: {
          booking_id: string
          comment?: string | null
          created_at?: string
          id?: string
          rating: number
          updated_at?: string
          user_id: string
          venue_id: string
        }
        Update: {
          booking_id?: string
          comment?: string | null
          created_at?: string
          id?: string
          rating?: number
          updated_at?: string
          user_id?: string
          venue_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      venues: {
        Row: {
          address: string
          city: string
          closing_time: string
          created_at: string
          description: string | null
          email: string | null
          facilities: string[]
          id: string
          image_urls: string[]
          latitude: number | null
          longitude: number | null
          name: string
          opening_time: string
          owner_id: string
          phone: string | null
          province: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          status: Database["public"]["Enums"]["venue_status"]
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          address: string
          city: string
          closing_time?: string
          created_at?: string
          description?: string | null
          email?: string | null
          facilities?: string[]
          id?: string
          image_urls?: string[]
          latitude?: number | null
          longitude?: number | null
          name: string
          opening_time?: string
          owner_id: string
          phone?: string | null
          province: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          status?: Database["public"]["Enums"]["venue_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          address?: string
          city?: string
          closing_time?: string
          created_at?: string
          description?: string | null
          email?: string | null
          facilities?: string[]
          id?: string
          image_urls?: string[]
          latitude?: number | null
          longitude?: number | null
          name?: string
          opening_time?: string
          owner_id?: string
          phone?: string | null
          province?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          status?: Database["public"]["Enums"]["venue_status"]
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "venues_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "venues_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      cancel_booking: {
        Args: { p_actor_id?: string; p_booking_id: string; p_reason: string }
        Returns: Database["public"]["Enums"]["booking_status"]
      }
      complete_finished_bookings: {
        Args: { p_limit?: number }
        Returns: number
      }
      create_booking: {
        Args: {
          p_idempotency_key?: string
          p_slot_ids: string[]
          p_user_id: string
        }
        Returns: {
          booking_code: string
          booking_id: string
          payment_expires_at: string
          total_price_rupiah: number
        }[]
      }
      create_pay_at_venue_booking: {
        Args: {
          p_idempotency_key: string
          p_slot_ids: string[]
          p_user_id: string
        }
        Returns: {
          booking_code: string
          booking_id: string
          booking_status: Database["public"]["Enums"]["booking_status"]
          payment_expires_at: string | null
          payment_mode: Database["public"]["Enums"]["booking_payment_mode"]
          total_price_rupiah: number
        }[]
      }
      create_sandbox_payment: {
        Args: {
          p_booking_id: string
          p_idempotency_key: string
          p_method: Database["public"]["Enums"]["payment_method"]
          p_user_id: string
        }
        Returns: {
          amount_rupiah: number
          commission_rupiah: number
          expires_at: string
          payment_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
          qr_payload: string
          venue_net_rupiah: number
          virtual_account: string
        }[]
      }
      expire_booking: {
        Args: { p_booking_id: string }
        Returns: Database["public"]["Enums"]["booking_status"]
      }
      expire_pending_bookings: { Args: { p_limit?: number }; Returns: number }
      get_owner_financial_aggregates: {
        Args: { p_from?: string; p_to?: string }
        Returns: {
          gross_settled_rupiah: number
          platform_fee_rupiah: number
          refunded_count: number
          refunded_rupiah: number
          settled_count: number
          venue_net_rupiah: number
        }[]
      }
      get_venue_availability: {
        Args: { p_ends_at: string; p_starts_at: string; p_venue_id: string }
        Returns: {
          court_id: string
          ends_at: string
          id: string
          price_rupiah: number
          starts_at: string
          status: Database["public"]["Enums"]["booking_slot_status"]
        }[]
      }
      run_backend_maintenance: {
        Args: { p_limit?: number }
        Returns: {
          completed_bookings: number
          expired_bookings: number
        }[]
      }
      transition_sandbox_payment: {
        Args: {
          p_actor_id: string
          p_actor_role: string
          p_command: string
          p_idempotency_key: string
          p_payment_id: string
          p_reason?: string
        }
        Returns: {
          booking_status: Database["public"]["Enums"]["booking_status"]
          payment_id: string
          payment_status: Database["public"]["Enums"]["payment_status"]
        }[]
      }
    }
    Enums: {
      booking_payment_mode: "ONLINE" | "PAY_AT_VENUE"
      booking_slot_status: "AVAILABLE" | "LOCKED" | "BOOKED" | "BLOCKED"
      booking_status:
        | "PENDING_PAYMENT"
        | "CONFIRMED"
        | "COMPLETED"
        | "CANCELLED"
      payment_method: "VA" | "EWALLET" | "QRIS"
      payment_status: "PENDING" | "SETTLED" | "FAILED" | "EXPIRED" | "REFUNDED"
      user_role: "PLAYER" | "VENUE_OWNER" | "ADMIN"
      venue_status: "DRAFT" | "PENDING" | "APPROVED" | "REJECTED" | "SUSPENDED"
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
      booking_payment_mode: ["ONLINE", "PAY_AT_VENUE"],
      booking_slot_status: ["AVAILABLE", "LOCKED", "BOOKED", "BLOCKED"],
      booking_status: [
        "PENDING_PAYMENT",
        "CONFIRMED",
        "COMPLETED",
        "CANCELLED",
      ],
      payment_method: ["VA", "EWALLET", "QRIS"],
      payment_status: ["PENDING", "SETTLED", "FAILED", "EXPIRED", "REFUNDED"],
      user_role: ["PLAYER", "VENUE_OWNER", "ADMIN"],
      venue_status: ["DRAFT", "PENDING", "APPROVED", "REJECTED", "SUSPENDED"],
    },
  },
} as const
