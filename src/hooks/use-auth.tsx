'use client'

import { useState, useEffect, createContext, useContext, useRef, useCallback } from 'react'
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
  
  // Use refs to track if we've already initialized and to prevent duplicate updates
  const isInitialized = useRef(false)
  const currentUserId = useRef<string | null>(null)

  useEffect(() => {
    // Prevent double initialization in React Strict Mode
    if (isInitialized.current) return
    isInitialized.current = true

    // Initialize auth state
    const initializeAuth = async () => {
      try {
        // Get the session first (faster, from cookies/localStorage)
        const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession()
        
        if (sessionError) {
          console.error('Error getting session:', sessionError)
        }
        
        if (currentSession?.user) {
          // Session exists, update state
          currentUserId.current = currentSession.user.id
          setUser(currentSession.user)
          setSession(currentSession)
        } else {
          // No session
          currentUserId.current = null
          setUser(null)
          setSession(null)
        }
      } catch (error) {
        console.error('Unexpected error initializing auth:', error)
        setUser(null)
        setSession(null)
      } finally {
        setLoading(false)
      }
    }

    initializeAuth()

    // Listen to auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, newSession) => {
        console.log('Auth state changed:', event)
        
        // IMPORTANT: Ignore TOKEN_REFRESHED events - they happen automatically
        // and don't require us to update the React state (session is already updated internally)
        if (event === 'TOKEN_REFRESHED') {
          // Just update the session reference silently, no state update needed
          // The token is already refreshed in the Supabase client
          return
        }
        
        if (event === 'SIGNED_OUT') {
          // User signed out - clear everything
          currentUserId.current = null
          setUser(null)
          setSession(null)
          setLoading(false)
        } else if (event === 'SIGNED_IN') {
          // User signed in - only update if user ID is different
          const newUserId = newSession?.user?.id ?? null
          if (newUserId !== currentUserId.current) {
            currentUserId.current = newUserId
            setUser(newSession?.user ?? null)
            setSession(newSession)
          }
          setLoading(false)
        } else if (event === 'INITIAL_SESSION') {
          // Initial session from storage - only update if user ID is different
          const newUserId = newSession?.user?.id ?? null
          if (newUserId !== currentUserId.current) {
            currentUserId.current = newUserId
            setUser(newSession?.user ?? null)
            setSession(newSession)
          }
          setLoading(false)
        } else if (event === 'USER_UPDATED') {
          // User was updated - always update
          setUser(newSession?.user ?? null)
          setSession(newSession)
        } else if (event === 'PASSWORD_RECOVERY') {
          // Password recovery - update session
          setUser(newSession?.user ?? null)
          setSession(newSession)
        }
        // Ignore other events like MFA_CHALLENGE_VERIFIED
      }
    )

    return () => subscription.unsubscribe()
  }, [])

  const signOut = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) {
        console.error('Error signing out:', error)
      }
      currentUserId.current = null
      setUser(null)
      setSession(null)
    } catch (error) {
      console.error('Unexpected error during sign out:', error)
      currentUserId.current = null
      setUser(null)
      setSession(null)
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, session, loading, signOut }}>
      {children}
    </AuthContext.Provider>
  )
}