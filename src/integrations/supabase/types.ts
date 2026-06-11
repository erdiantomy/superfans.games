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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      credit_packages: {
        Row: {
          bonus_pct: number | null
          created_at: string | null
          credits: number
          id: string
          is_active: boolean | null
          name: string
          price_idr: number
          sort_order: number | null
        }
        Insert: {
          bonus_pct?: number | null
          created_at?: string | null
          credits: number
          id?: string
          is_active?: boolean | null
          name: string
          price_idr: number
          sort_order?: number | null
        }
        Update: {
          bonus_pct?: number | null
          created_at?: string | null
          credits?: number
          id?: string
          is_active?: boolean | null
          name?: string
          price_idr?: number
          sort_order?: number | null
        }
        Relationships: []
      }
      donations: {
        Row: {
          amount: number
          created_at: string
          currency: string
          donor_id: string | null
          donor_name: string
          id: string
          is_anonymous: boolean
          message: string
          payment_order_id: string | null
          player_id: string
          status: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string
          donor_id?: string | null
          donor_name?: string
          id?: string
          is_anonymous?: boolean
          message?: string
          payment_order_id?: string | null
          player_id: string
          status?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string
          donor_id?: string | null
          donor_name?: string
          id?: string
          is_anonymous?: boolean
          message?: string
          payment_order_id?: string | null
          player_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_donor_id_fkey"
            columns: ["donor_id"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "donations_payment_order_id_fkey"
            columns: ["payment_order_id"]
            isOneToOne: false
            referencedRelation: "payment_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "donations_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
        ]
      }
      matches: {
        Row: {
          created_at: string
          fans: number
          id: string
          player_a_avatar: string
          player_a_name: string
          player_a_sport: string
          player_a_tier: string
          player_a_win_rate: number
          player_b_avatar: string
          player_b_name: string
          player_b_sport: string
          player_b_tier: string
          player_b_win_rate: number
          pool: number
          score_a: number
          score_b: number
          starts_at: string | null
          status: Database["public"]["Enums"]["match_status"]
          support_a: number
          support_b: number
          title: string
          updated_at: string
          winner: string | null
        }
        Insert: {
          created_at?: string
          fans?: number
          id?: string
          player_a_avatar?: string
          player_a_name: string
          player_a_sport?: string
          player_a_tier?: string
          player_a_win_rate?: number
          player_b_avatar?: string
          player_b_name: string
          player_b_sport?: string
          player_b_tier?: string
          player_b_win_rate?: number
          pool?: number
          score_a?: number
          score_b?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          support_a?: number
          support_b?: number
          title: string
          updated_at?: string
          winner?: string | null
        }
        Update: {
          created_at?: string
          fans?: number
          id?: string
          player_a_avatar?: string
          player_a_name?: string
          player_a_sport?: string
          player_a_tier?: string
          player_a_win_rate?: number
          player_b_avatar?: string
          player_b_name?: string
          player_b_sport?: string
          player_b_tier?: string
          player_b_win_rate?: number
          pool?: number
          score_a?: number
          score_b?: number
          starts_at?: string | null
          status?: Database["public"]["Enums"]["match_status"]
          support_a?: number
          support_b?: number
          title?: string
          updated_at?: string
          winner?: string | null
        }
        Relationships: []
      }
      monthly_resets: {
        Row: {
          completed: boolean
          created_at: string
          id: string
          prize_first: number
          prize_second: number
          prize_third: number
          reset_date: string
          venue_id: string | null
          winner_first: string | null
          winner_second: string | null
          winner_third: string | null
        }
        Insert: {
          completed?: boolean
          created_at?: string
          id?: string
          prize_first?: number
          prize_second?: number
          prize_third?: number
          reset_date?: string
          venue_id?: string | null
          winner_first?: string | null
          winner_second?: string | null
          winner_third?: string | null
        }
        Update: {
          completed?: boolean
          created_at?: string
          id?: string
          prize_first?: number
          prize_second?: number
          prize_third?: number
          reset_date?: string
          venue_id?: string | null
          winner_first?: string | null
          winner_second?: string | null
          winner_third?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "monthly_resets_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_first_fkey"
            columns: ["winner_first"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_first_fkey"
            columns: ["winner_first"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_first_fkey"
            columns: ["winner_first"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_first_fkey"
            columns: ["winner_first"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_second_fkey"
            columns: ["winner_second"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_second_fkey"
            columns: ["winner_second"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_second_fkey"
            columns: ["winner_second"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_second_fkey"
            columns: ["winner_second"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_third_fkey"
            columns: ["winner_third"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_third_fkey"
            columns: ["winner_third"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_third_fkey"
            columns: ["winner_third"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "monthly_resets_winner_third_fkey"
            columns: ["winner_third"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
        ]
      }
      notification_preferences: {
        Row: {
          created_at: string
          division_promotion: boolean
          email_enabled: boolean
          id: string
          in_app_enabled: boolean
          join_request: boolean
          monthly_prize: boolean
          payment_completed: boolean
          score_approved: boolean
          session_approved: boolean
          session_rejected: boolean
          support_payout: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          division_promotion?: boolean
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          join_request?: boolean
          monthly_prize?: boolean
          payment_completed?: boolean
          score_approved?: boolean
          session_approved?: boolean
          session_rejected?: boolean
          support_payout?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          division_promotion?: boolean
          email_enabled?: boolean
          id?: string
          in_app_enabled?: boolean
          join_request?: boolean
          monthly_prize?: boolean
          payment_completed?: boolean
          score_approved?: boolean
          session_approved?: boolean
          session_rejected?: boolean
          support_payout?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string
          created_at: string
          data: Json
          id: string
          read: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          data?: Json
          id?: string
          read?: boolean
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: []
      }
      padel_players: {
        Row: {
          avatar: string
          created_at: string
          credits: number
          division: Database["public"]["Enums"]["division_tier"]
          email: string
          id: string
          lifetime_xp: number
          losses: number
          monthly_pts: number
          name: string
          streak: number
          updated_at: string
          user_id: string
          wins: number
        }
        Insert: {
          avatar?: string
          created_at?: string
          credits?: number
          division?: Database["public"]["Enums"]["division_tier"]
          email?: string
          id?: string
          lifetime_xp?: number
          losses?: number
          monthly_pts?: number
          name?: string
          streak?: number
          updated_at?: string
          user_id: string
          wins?: number
        }
        Update: {
          avatar?: string
          created_at?: string
          credits?: number
          division?: Database["public"]["Enums"]["division_tier"]
          email?: string
          id?: string
          lifetime_xp?: number
          losses?: number
          monthly_pts?: number
          name?: string
          streak?: number
          updated_at?: string
          user_id?: string
          wins?: number
        }
        Relationships: []
      }
      payment_orders: {
        Row: {
          created_at: string | null
          credits_amount: number
          expired_at: string | null
          id: string
          metadata: Json | null
          package_id: string | null
          paid_at: string | null
          payment_channel: string | null
          player_id: string
          price_idr: number
          status: string | null
          xendit_invoice_id: string | null
          xendit_invoice_url: string | null
        }
        Insert: {
          created_at?: string | null
          credits_amount: number
          expired_at?: string | null
          id?: string
          metadata?: Json | null
          package_id?: string | null
          paid_at?: string | null
          payment_channel?: string | null
          player_id: string
          price_idr: number
          status?: string | null
          xendit_invoice_id?: string | null
          xendit_invoice_url?: string | null
        }
        Update: {
          created_at?: string | null
          credits_amount?: number
          expired_at?: string | null
          id?: string
          metadata?: Json | null
          package_id?: string | null
          paid_at?: string | null
          payment_channel?: string | null
          player_id?: string
          price_idr?: number
          status?: string | null
          xendit_invoice_id?: string | null
          xendit_invoice_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_orders_package_id_fkey"
            columns: ["package_id"]
            isOneToOne: false
            referencedRelation: "credit_packages"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_orders_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
        ]
      }
      player_profiles: {
        Row: {
          avatar_url: string | null
          bio: string
          created_at: string
          display_name: string
          id: string
          is_public: boolean
          player_id: string
          slug: string
          social_links: Json
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name: string
          id?: string
          is_public?: boolean
          player_id: string
          slug: string
          social_links?: Json
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          bio?: string
          created_at?: string
          display_name?: string
          id?: string
          is_public?: boolean
          player_id?: string
          slug?: string
          social_links?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "player_profiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_profiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_profiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "player_profiles_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: true
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          display_name: string
          id: string
          points: number
          rank: number | null
          updated_at: string
          user_id: string
          username: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          points?: number
          rank?: number | null
          updated_at?: string
          user_id: string
          username?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          display_name?: string
          id?: string
          points?: number
          rank?: number | null
          updated_at?: string
          user_id?: string
          username?: string
        }
        Relationships: []
      }
      score_submissions: {
        Row: {
          admin_note: string | null
          court: number
          created_at: string
          id: string
          reported_by: string
          reviewed_at: string | null
          reviewed_by: string | null
          round: number
          score_a: string
          score_b: string
          session_id: string
          session_rank_losers: number
          session_rank_winners: number
          status: Database["public"]["Enums"]["score_status"]
          team_a_p1: string
          team_a_p2: string
          team_b_p1: string
          team_b_p2: string
          winner_team: string | null
          xp_credited: boolean
        }
        Insert: {
          admin_note?: string | null
          court: number
          created_at?: string
          id?: string
          reported_by: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          round: number
          score_a?: string
          score_b?: string
          session_id: string
          session_rank_losers?: number
          session_rank_winners?: number
          status?: Database["public"]["Enums"]["score_status"]
          team_a_p1: string
          team_a_p2: string
          team_b_p1: string
          team_b_p2: string
          winner_team?: string | null
          xp_credited?: boolean
        }
        Update: {
          admin_note?: string | null
          court?: number
          created_at?: string
          id?: string
          reported_by?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          round?: number
          score_a?: string
          score_b?: string
          session_id?: string
          session_rank_losers?: number
          session_rank_winners?: number
          status?: Database["public"]["Enums"]["score_status"]
          team_a_p1?: string
          team_a_p2?: string
          team_b_p1?: string
          team_b_p2?: string
          winner_team?: string | null
          xp_credited?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "score_submissions_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_reported_by_fkey"
            columns: ["reported_by"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "score_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p1_fkey"
            columns: ["team_a_p1"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p1_fkey"
            columns: ["team_a_p1"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p1_fkey"
            columns: ["team_a_p1"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p1_fkey"
            columns: ["team_a_p1"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p2_fkey"
            columns: ["team_a_p2"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p2_fkey"
            columns: ["team_a_p2"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p2_fkey"
            columns: ["team_a_p2"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p2_fkey"
            columns: ["team_a_p2"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p1_fkey"
            columns: ["team_b_p1"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p1_fkey"
            columns: ["team_b_p1"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p1_fkey"
            columns: ["team_b_p1"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p1_fkey"
            columns: ["team_b_p1"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p2_fkey"
            columns: ["team_b_p2"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p2_fkey"
            columns: ["team_b_p2"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p2_fkey"
            columns: ["team_b_p2"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p2_fkey"
            columns: ["team_b_p2"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
        ]
      }
      session_players: {
        Row: {
          created_at: string
          id: string
          joined_at: string | null
          player_id: string
          role: Database["public"]["Enums"]["player_role"]
          session_id: string
          status: Database["public"]["Enums"]["join_status"]
        }
        Insert: {
          created_at?: string
          id?: string
          joined_at?: string | null
          player_id: string
          role?: Database["public"]["Enums"]["player_role"]
          session_id: string
          status?: Database["public"]["Enums"]["join_status"]
        }
        Update: {
          created_at?: string
          id?: string
          joined_at?: string | null
          player_id?: string
          role?: Database["public"]["Enums"]["player_role"]
          session_id?: string
          status?: Database["public"]["Enums"]["join_status"]
        }
        Relationships: [
          {
            foreignKeyName: "session_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_players_player_id_fkey"
            columns: ["player_id"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "session_players_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      session_supports: {
        Row: {
          amount: number
          backed_id: string
          created_at: string
          id: string
          payout: number | null
          resolved: boolean
          session_id: string
          supporter_id: string
        }
        Insert: {
          amount: number
          backed_id: string
          created_at?: string
          id?: string
          payout?: number | null
          resolved?: boolean
          session_id: string
          supporter_id: string
        }
        Update: {
          amount?: number
          backed_id?: string
          created_at?: string
          id?: string
          payout?: number | null
          resolved?: boolean
          session_id?: string
          supporter_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_supports_backed_id_fkey"
            columns: ["backed_id"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_supports_backed_id_fkey"
            columns: ["backed_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_supports_backed_id_fkey"
            columns: ["backed_id"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_supports_backed_id_fkey"
            columns: ["backed_id"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "session_supports_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_supports_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_supports_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_supports_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_supports_supporter_id_fkey"
            columns: ["supporter_id"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
        ]
      }
      sessions: {
        Row: {
          admin_note: string | null
          approved_at: string | null
          approved_by: string | null
          code: string
          courts: number
          created_at: string
          current_round: number
          finished_at: string | null
          format: Database["public"]["Enums"]["session_format"]
          host_id: string
          id: string
          locked: boolean
          max_players: number
          name: string
          partner_type: Database["public"]["Enums"]["partner_type"]
          points_per_match: number
          scheduled_at: string | null
          started_at: string | null
          status: Database["public"]["Enums"]["session_status"]
          total_rounds: number
          updated_at: string
          venue_id: string | null
        }
        Insert: {
          admin_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code: string
          courts?: number
          created_at?: string
          current_round?: number
          finished_at?: string | null
          format?: Database["public"]["Enums"]["session_format"]
          host_id: string
          id?: string
          locked?: boolean
          max_players?: number
          name: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          points_per_match?: number
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          total_rounds?: number
          updated_at?: string
          venue_id?: string | null
        }
        Update: {
          admin_note?: string | null
          approved_at?: string | null
          approved_by?: string | null
          code?: string
          courts?: number
          created_at?: string
          current_round?: number
          finished_at?: string | null
          format?: Database["public"]["Enums"]["session_format"]
          host_id?: string
          id?: string
          locked?: boolean
          max_players?: number
          name?: string
          partner_type?: Database["public"]["Enums"]["partner_type"]
          points_per_match?: number
          scheduled_at?: string | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["session_status"]
          total_rounds?: number
          updated_at?: string
          venue_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sessions_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "sessions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      sf_follows: {
        Row: {
          created_at: string
          follower_id: string
          id: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          id?: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      sf_leagues: {
        Row: {
          badge_url: string | null
          country: string | null
          created_at: string
          external_ref: string | null
          id: string
          logo_url: string | null
          name: string
          priority: number
          season: string | null
          slug: string
          sport: string
        }
        Insert: {
          badge_url?: string | null
          country?: string | null
          created_at?: string
          external_ref?: string | null
          id?: string
          logo_url?: string | null
          name: string
          priority?: number
          season?: string | null
          slug: string
          sport?: string
        }
        Update: {
          badge_url?: string | null
          country?: string | null
          created_at?: string
          external_ref?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          priority?: number
          season?: string | null
          slug?: string
          sport?: string
        }
        Relationships: []
      }
      sf_matches: {
        Row: {
          away_badge: string | null
          away_score: number | null
          away_team_id: string | null
          away_team_name: string
          created_at: string
          external_ref: string | null
          home_badge: string | null
          home_score: number | null
          home_team_id: string | null
          home_team_name: string
          id: string
          kickoff_at: string | null
          league_id: string | null
          league_name: string | null
          round: string | null
          season: string | null
          status: Database["public"]["Enums"]["sf_match_status"]
          thumb_url: string | null
          updated_at: string
          venue: string | null
          winner: string | null
        }
        Insert: {
          away_badge?: string | null
          away_score?: number | null
          away_team_id?: string | null
          away_team_name: string
          created_at?: string
          external_ref?: string | null
          home_badge?: string | null
          home_score?: number | null
          home_team_id?: string | null
          home_team_name: string
          id?: string
          kickoff_at?: string | null
          league_id?: string | null
          league_name?: string | null
          round?: string | null
          season?: string | null
          status?: Database["public"]["Enums"]["sf_match_status"]
          thumb_url?: string | null
          updated_at?: string
          venue?: string | null
          winner?: string | null
        }
        Update: {
          away_badge?: string | null
          away_score?: number | null
          away_team_id?: string | null
          away_team_name?: string
          created_at?: string
          external_ref?: string | null
          home_badge?: string | null
          home_score?: number | null
          home_team_id?: string | null
          home_team_name?: string
          id?: string
          kickoff_at?: string | null
          league_id?: string | null
          league_name?: string | null
          round?: string | null
          season?: string | null
          status?: Database["public"]["Enums"]["sf_match_status"]
          thumb_url?: string | null
          updated_at?: string
          venue?: string | null
          winner?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sf_matches_away_team_id_fkey"
            columns: ["away_team_id"]
            isOneToOne: false
            referencedRelation: "sf_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sf_matches_home_team_id_fkey"
            columns: ["home_team_id"]
            isOneToOne: false
            referencedRelation: "sf_teams"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sf_matches_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "sf_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      sf_post_likes: {
        Row: {
          created_at: string
          id: string
          post_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          post_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          post_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sf_post_likes_post_id_fkey"
            columns: ["post_id"]
            isOneToOne: false
            referencedRelation: "sf_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      sf_posts: {
        Row: {
          author_id: string
          body: string
          created_at: string
          deleted_at: string | null
          id: string
          like_count: number
          match_id: string | null
          prediction_id: string | null
        }
        Insert: {
          author_id: string
          body: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          like_count?: number
          match_id?: string | null
          prediction_id?: string | null
        }
        Update: {
          author_id?: string
          body?: string
          created_at?: string
          deleted_at?: string | null
          id?: string
          like_count?: number
          match_id?: string | null
          prediction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sf_posts_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "sf_matches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sf_posts_prediction_id_fkey"
            columns: ["prediction_id"]
            isOneToOne: false
            referencedRelation: "sf_predictions"
            referencedColumns: ["id"]
          },
        ]
      }
      sf_predictions: {
        Row: {
          confidence: number
          created_at: string
          id: string
          match_id: string
          pick: string
          points_awarded: number | null
          resolved_at: string | null
          status: Database["public"]["Enums"]["sf_prediction_status"]
          user_id: string
        }
        Insert: {
          confidence?: number
          created_at?: string
          id?: string
          match_id: string
          pick: string
          points_awarded?: number | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["sf_prediction_status"]
          user_id: string
        }
        Update: {
          confidence?: number
          created_at?: string
          id?: string
          match_id?: string
          pick?: string
          points_awarded?: number | null
          resolved_at?: string | null
          status?: Database["public"]["Enums"]["sf_prediction_status"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "sf_predictions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "sf_matches"
            referencedColumns: ["id"]
          },
        ]
      }
      sf_reputation: {
        Row: {
          accuracy: number
          best_streak: number
          correct_predictions: number
          current_streak: number
          points: number
          tier: string
          total_predictions: number
          updated_at: string
          user_id: string
        }
        Insert: {
          accuracy?: number
          best_streak?: number
          correct_predictions?: number
          current_streak?: number
          points?: number
          tier?: string
          total_predictions?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          accuracy?: number
          best_streak?: number
          correct_predictions?: number
          current_streak?: number
          points?: number
          tier?: string
          total_predictions?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      sf_teams: {
        Row: {
          badge_url: string | null
          country: string | null
          created_at: string
          external_ref: string | null
          id: string
          league_id: string | null
          name: string
          short_name: string | null
          slug: string
          stadium: string | null
        }
        Insert: {
          badge_url?: string | null
          country?: string | null
          created_at?: string
          external_ref?: string | null
          id?: string
          league_id?: string | null
          name: string
          short_name?: string | null
          slug: string
          stadium?: string | null
        }
        Update: {
          badge_url?: string | null
          country?: string | null
          created_at?: string
          external_ref?: string | null
          id?: string
          league_id?: string | null
          name?: string
          short_name?: string | null
          slug?: string
          stadium?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sf_teams_league_id_fkey"
            columns: ["league_id"]
            isOneToOne: false
            referencedRelation: "sf_leagues"
            referencedColumns: ["id"]
          },
        ]
      }
      supports: {
        Row: {
          amount: number
          created_at: string
          id: string
          match_id: string
          player: string
          points_earned: number
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          id?: string
          match_id: string
          player: string
          points_earned?: number
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          id?: string
          match_id?: string
          player?: string
          points_earned?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "supports_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "matches"
            referencedColumns: ["id"]
          },
        ]
      }
      venue_registrations: {
        Row: {
          admin_password: string
          city: string | null
          contact_email: string
          contact_name: string
          contact_phone: string | null
          country: string | null
          courts_default: number | null
          created_at: string | null
          id: string
          logo_url: string | null
          monthly_prize: number | null
          name: string
          primary_color: string | null
          prize_split_1st: number | null
          prize_split_2nd: number | null
          prize_split_3rd: number | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          slug: string
          status: string | null
        }
        Insert: {
          admin_password: string
          city?: string | null
          contact_email: string
          contact_name: string
          contact_phone?: string | null
          country?: string | null
          courts_default?: number | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          monthly_prize?: number | null
          name: string
          primary_color?: string | null
          prize_split_1st?: number | null
          prize_split_2nd?: number | null
          prize_split_3rd?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug: string
          status?: string | null
        }
        Update: {
          admin_password?: string
          city?: string | null
          contact_email?: string
          contact_name?: string
          contact_phone?: string | null
          country?: string | null
          courts_default?: number | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          monthly_prize?: number | null
          name?: string
          primary_color?: string | null
          prize_split_1st?: number | null
          prize_split_2nd?: number | null
          prize_split_3rd?: number | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          slug?: string
          status?: string | null
        }
        Relationships: []
      }
      venues: {
        Row: {
          admin_password_hash: string | null
          approved_at: string | null
          approved_by: string | null
          city: string | null
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          country: string | null
          courts_default: number | null
          created_at: string | null
          id: string
          logo_url: string | null
          monthly_prize: number | null
          name: string
          platform_fee_pct: number | null
          primary_color: string | null
          prize_split_1st: number | null
          prize_split_2nd: number | null
          prize_split_3rd: number | null
          slug: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          admin_password_hash?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          courts_default?: number | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          monthly_prize?: number | null
          name: string
          platform_fee_pct?: number | null
          primary_color?: string | null
          prize_split_1st?: number | null
          prize_split_2nd?: number | null
          prize_split_3rd?: number | null
          slug: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          admin_password_hash?: string | null
          approved_at?: string | null
          approved_by?: string | null
          city?: string | null
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          country?: string | null
          courts_default?: number | null
          created_at?: string | null
          id?: string
          logo_url?: string | null
          monthly_prize?: number | null
          name?: string
          platform_fee_pct?: number | null
          primary_color?: string | null
          prize_split_1st?: number | null
          prize_split_2nd?: number | null
          prize_split_3rd?: number | null
          slug?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      wallet_transactions: {
        Row: {
          created_at: string
          description: string
          id: string
          idr_amount: number
          payment_order_id: string | null
          sp_amount: number
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string
          id?: string
          idr_amount?: number
          payment_order_id?: string | null
          sp_amount?: number
          type: Database["public"]["Enums"]["tx_type"]
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          idr_amount?: number
          payment_order_id?: string | null
          sp_amount?: number
          type?: Database["public"]["Enums"]["tx_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallet_transactions_payment_order_id_fkey"
            columns: ["payment_order_id"]
            isOneToOne: false
            referencedRelation: "payment_orders"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      leaderboard: {
        Row: {
          avatar_url: string | null
          points: number | null
          rank: number | null
          total_supports: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
      lifetime_leaderboard: {
        Row: {
          avatar: string | null
          division: Database["public"]["Enums"]["division_tier"] | null
          id: string | null
          lifetime_rank: number | null
          lifetime_xp: number | null
          losses: number | null
          monthly_pts: number | null
          name: string | null
          streak: number | null
          user_id: string | null
          wins: number | null
        }
        Relationships: []
      }
      monthly_leaderboard: {
        Row: {
          avatar: string | null
          division: Database["public"]["Enums"]["division_tier"] | null
          id: string | null
          lifetime_xp: number | null
          losses: number | null
          monthly_pts: number | null
          monthly_rank: number | null
          name: string | null
          streak: number | null
          user_id: string | null
          wins: number | null
        }
        Relationships: []
      }
      player_match_history: {
        Row: {
          court: number | null
          played_at: string | null
          round: number | null
          score_a: string | null
          score_b: string | null
          score_id: string | null
          session_code: string | null
          session_id: string | null
          session_name: string | null
          team_a_p1: string | null
          team_a_p2: string | null
          team_b_p1: string | null
          team_b_p2: string | null
          venue_id: string | null
          venue_name: string | null
          venue_slug: string | null
          winner_team: string | null
        }
        Relationships: [
          {
            foreignKeyName: "score_submissions_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "sessions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p1_fkey"
            columns: ["team_a_p1"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p1_fkey"
            columns: ["team_a_p1"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p1_fkey"
            columns: ["team_a_p1"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p1_fkey"
            columns: ["team_a_p1"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p2_fkey"
            columns: ["team_a_p2"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p2_fkey"
            columns: ["team_a_p2"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p2_fkey"
            columns: ["team_a_p2"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_a_p2_fkey"
            columns: ["team_a_p2"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p1_fkey"
            columns: ["team_b_p1"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p1_fkey"
            columns: ["team_b_p1"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p1_fkey"
            columns: ["team_b_p1"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p1_fkey"
            columns: ["team_b_p1"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p2_fkey"
            columns: ["team_b_p2"]
            isOneToOne: false
            referencedRelation: "lifetime_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p2_fkey"
            columns: ["team_b_p2"]
            isOneToOne: false
            referencedRelation: "monthly_leaderboard"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p2_fkey"
            columns: ["team_b_p2"]
            isOneToOne: false
            referencedRelation: "padel_players"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "score_submissions_team_b_p2_fkey"
            columns: ["team_b_p2"]
            isOneToOne: false
            referencedRelation: "player_profile_full"
            referencedColumns: ["player_id"]
          },
          {
            foreignKeyName: "sessions_venue_id_fkey"
            columns: ["venue_id"]
            isOneToOne: false
            referencedRelation: "venues"
            referencedColumns: ["id"]
          },
        ]
      }
      player_profile_full: {
        Row: {
          avatar: string | null
          avatar_url: string | null
          bio: string | null
          credits: number | null
          display_name: string | null
          division: Database["public"]["Enums"]["division_tier"] | null
          donation_count: number | null
          games_played: number | null
          is_public: boolean | null
          lifetime_xp: number | null
          losses: number | null
          monthly_pts: number | null
          name: string | null
          player_id: string | null
          profile_created_at: string | null
          profile_id: string | null
          slug: string | null
          social_links: Json | null
          streak: number | null
          supporter_count: number | null
          total_raised: number | null
          user_id: string | null
          win_rate: number | null
          wins: number | null
        }
        Relationships: []
      }
      sf_leaderboard: {
        Row: {
          accuracy: number | null
          avatar_url: string | null
          best_streak: number | null
          correct_predictions: number | null
          current_streak: number | null
          display_name: string | null
          points: number | null
          position: number | null
          tier: string | null
          total_predictions: number | null
          user_id: string | null
          username: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      check_slug_available: { Args: { p_slug: string }; Returns: boolean }
      create_notification: {
        Args: {
          p_body: string
          p_data?: Json
          p_title: string
          p_type: Database["public"]["Enums"]["notification_type"]
          p_user_id: string
        }
        Returns: undefined
      }
      credit_xp_for_score: {
        Args: { submission_id: string }
        Returns: undefined
      }
      resolve_slug: {
        Args: { p_slug: string }
        Returns: {
          entity_id: string
          entity_type: string
        }[]
      }
      resolve_support_payouts: {
        Args: { p_session_id: string; winner_player_id: string }
        Returns: undefined
      }
      sf_recompute_reputation: { Args: { p_user: string }; Returns: undefined }
      sf_resolve_match: { Args: { p_match: string }; Returns: undefined }
      sf_tier_for: { Args: { points: number }; Returns: string }
      upsert_padel_player: {
        Args: {
          p_avatar?: string
          p_email: string
          p_name: string
          p_user_id: string
        }
        Returns: {
          avatar: string
          created_at: string
          credits: number
          division: Database["public"]["Enums"]["division_tier"]
          email: string
          id: string
          lifetime_xp: number
          losses: number
          monthly_pts: number
          name: string
          streak: number
          updated_at: string
          user_id: string
          wins: number
        }
        SetofOptions: {
          from: "*"
          to: "padel_players"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      division_tier: "bronze" | "silver" | "gold" | "platinum" | "diamond"
      join_status: "pending" | "approved" | "declined"
      match_status: "live" | "upcoming" | "finished"
      notification_type:
        | "score_approved"
        | "support_payout"
        | "division_promotion"
        | "session_approved"
        | "session_rejected"
        | "monthly_prize"
        | "join_request_received"
        | "join_request_approved"
        | "join_request_declined"
        | "payment_completed"
      partner_type: "random" | "fixed"
      player_role: "host" | "player"
      score_status: "pending" | "approved" | "rejected"
      session_format: "americano" | "mexicano"
      session_status:
        | "pending_approval"
        | "active"
        | "live"
        | "finished"
        | "rejected"
      sf_match_status:
        | "scheduled"
        | "live"
        | "finished"
        | "postponed"
        | "cancelled"
      sf_prediction_status: "pending" | "correct" | "incorrect" | "void"
      tx_type: "support" | "reward" | "topup" | "redeem" | "bonus"
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
      division_tier: ["bronze", "silver", "gold", "platinum", "diamond"],
      join_status: ["pending", "approved", "declined"],
      match_status: ["live", "upcoming", "finished"],
      notification_type: [
        "score_approved",
        "support_payout",
        "division_promotion",
        "session_approved",
        "session_rejected",
        "monthly_prize",
        "join_request_received",
        "join_request_approved",
        "join_request_declined",
        "payment_completed",
      ],
      partner_type: ["random", "fixed"],
      player_role: ["host", "player"],
      score_status: ["pending", "approved", "rejected"],
      session_format: ["americano", "mexicano"],
      session_status: [
        "pending_approval",
        "active",
        "live",
        "finished",
        "rejected",
      ],
      sf_match_status: [
        "scheduled",
        "live",
        "finished",
        "postponed",
        "cancelled",
      ],
      sf_prediction_status: ["pending", "correct", "incorrect", "void"],
      tx_type: ["support", "reward", "topup", "redeem", "bonus"],
    },
  },
} as const
