import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          id: string
          user_id: string
          name: string
          color: string
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          name: string
          color: string
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          name?: string
          color?: string
          created_at?: string
        }
      }
      backlog_items: {
        Row: {
          id: string
          user_id: string
          activity: string
          details: string | null
          category: string
          status: string
          gravity: number
          urgency: number
          tendency: number
          score: number
          deadline: string | null
          start_date: string | null
          category_id: string | null
          pdca_analysis: any | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          activity: string
          details?: string | null
          category?: string
          status?: string
          gravity?: number
          urgency?: number
          tendency?: number
          score?: number
          deadline?: string | null
          start_date?: string | null
          category_id?: string | null
          pdca_analysis?: any | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          activity?: string
          details?: string | null
          category?: string
          status?: string
          gravity?: number
          urgency?: number
          tendency?: number
          score?: number
          deadline?: string | null
          start_date?: string | null
          category_id?: string | null
          pdca_analysis?: any | null
          created_at?: string
          updated_at?: string
        }
      }
      user_settings: {
        Row: {
          id: string
          user_id: string
          k_factor: number
          b_factor: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          k_factor?: number
          b_factor?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          k_factor?: number
          b_factor?: number
          created_at?: string
          updated_at?: string
        }
      }
    }
  }
}