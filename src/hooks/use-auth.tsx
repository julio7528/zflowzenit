'use client'

import { useState, useEffect, createContext, useContext } from 'react'
import { supabase } from '@/lib/supabase'
import type { User, Session } from '@supabase/supabase-js'

interface AuthContextType {
  user: User | null
  session: Session | null
  loading: boolean
  signOut: () => Promise<void>
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signOut: async () => {},
})

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check current session with error handling
    const getSession = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession()
        
        if (error) {
          console.error('Error getting session:', error)
          // If there's an error with the session (like invalid refresh token), 
          // we should clear the session to allow user to log in again
          if (error.message.includes('Invalid Refresh Token') || error.message.includes('Refresh Token Not Found')) {
            console.warn('Invalid refresh token detected, signing out user')
            await supabase.auth.signOut()
            setUser(null)
            setSession(null)
            setLoading(false)
            return
          }
        }
        
        setUser(session?.user ?? null)
        setSession(session)
        setLoading(false)
      } catch (error) {
        console.error('Unexpected error getting session:', error)
        setUser(null)
        setSession(null)
        setLoading(false)
      }
    }

    getSession()

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, newSession) => {
        // Handle specific events related to session invalidation
        if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESH_FAILED' || event === 'SIGNED_IN') {
          if (event === 'TOKEN_REFRESH_FAILED') {
            // If token refresh failed, clear any stored session data and redirect to login
            console.warn('Token refresh failed, redirecting to login')
            setUser(null)
            setSession(null)
          } else {
            setUser(newSession?.user ?? null)
            setSession(newSession)
          }
        } else {
          setUser(newSession?.user ?? null)
          setSession(newSession)
        }
        setLoading(false)
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      setUser(null)
      setSession(null)
    }
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}