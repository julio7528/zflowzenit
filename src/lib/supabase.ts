import { createClient } from '@supabase/supabase-js'
import { type AuthError } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// Create a single supabase client for interacting with your database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    // Enable auto-refresh of the token before it expires
    autoRefreshToken: true,
    // Enable persistence of the session in local storage
    persistSession: true,
    // How often the library will check for token refresh (in milliseconds)
    detectSessionInUrl: true,
  }
})

// Add error handling for refresh token issues
supabase.auth.onAuthStateChange(async (event, session) => {
  if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
    // Store the session in case we need to recover from a refresh token failure
    if (session) {
      // Store additional session info if needed
      localStorage.setItem('supabase_session', JSON.stringify({
        expires_at: session.expires_at,
        refresh_token: session.refresh_token
      }))
    }
  } else if (event === 'SIGNED_OUT') {
    // Clear stored session info
    localStorage.removeItem('supabase_session')
  }
})

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