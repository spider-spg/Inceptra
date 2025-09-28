"use client"

import React, { createContext, useContext, useState, useEffect } from 'react'
import { auth } from '@/lib/firebase'
import MockAuthService, { MockUser } from '@/lib/mock-auth'

// Check if Firebase is enabled
const isFirebaseEnabled = process.env.NEXT_PUBLIC_ENABLE_FIREBASE === 'true'

// Import Firebase auth only if enabled
let onAuthStateChanged: any = null
let FirebaseAuthService: any = null

if (isFirebaseEnabled && auth) {
  try {
    const firebaseAuth = require('firebase/auth')
    onAuthStateChanged = firebaseAuth.onAuthStateChanged
    FirebaseAuthService = require('@/lib/auth').default
  } catch (error) {
    console.error('Failed to load Firebase auth:', error)
  }
}

export type UserRole = 'entrepreneur' | 'mentor' | 'admin'

export interface User {
  id: string
  email: string
  name: string
  role: UserRole
}

interface AuthContextType {
  user: User | null
  firebaseUser: any | null // Can be FirebaseUser or MockUser
  login: (email: string, password: string) => Promise<{ success: boolean, error?: string }>
  signUp: (email: string, password: string, name: string, role: UserRole) => Promise<{ success: boolean, error?: string }>
  loginWithGoogle: (role: UserRole) => Promise<{ success: boolean, error?: string }>
  logout: () => Promise<void>
  resetPassword: (email: string) => Promise<{ success: boolean, error?: string }>
  isLoading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [firebaseUser, setFirebaseUser] = useState<any | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    let unsubscribe: (() => void) | undefined

    if (isFirebaseEnabled && auth && onAuthStateChanged && FirebaseAuthService) {
      // Use Firebase authentication
      unsubscribe = onAuthStateChanged(auth, async (firebaseUser: any) => {
        setFirebaseUser(firebaseUser)
        
        if (firebaseUser) {
          // Get user profile from Firestore
          const userProfile = await FirebaseAuthService.getUserProfile(firebaseUser.uid)
          
          if (userProfile) {
            const user: User = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              name: userProfile.displayName || firebaseUser.displayName || 'User',
              role: userProfile.role
            }
            setUser(user)
            // Store user in localStorage for quick access
            localStorage.setItem('unfair-advantage-user', JSON.stringify(user))
          } else {
            // User exists in Firebase Auth but not in Firestore
            // This shouldn't happen in normal flow, but handle gracefully
            console.warn('User authenticated but no profile found')
            setUser(null)
            localStorage.removeItem('unfair-advantage-user')
          }
        } else {
          setUser(null)
          localStorage.removeItem('unfair-advantage-user')
        }
        
        setIsLoading(false)
      })
    } else {
      // Use mock authentication
      console.log('Using mock authentication service')
      unsubscribe = MockAuthService.onAuthStateChanged(async (mockUser: MockUser | null) => {
        setFirebaseUser(mockUser)
        
        if (mockUser) {
          const user: User = {
            id: mockUser.uid,
            email: mockUser.email,
            name: mockUser.displayName,
            role: mockUser.role
          }
          setUser(user)
          localStorage.setItem('unfair-advantage-user', JSON.stringify(user))
        } else {
          setUser(null)
          localStorage.removeItem('unfair-advantage-user')
        }
        
        setIsLoading(false)
      })
    }

    return () => {
      if (unsubscribe) {
        unsubscribe()
      }
    }
  }, [])

  const login = async (email: string, password: string): Promise<{ success: boolean, error?: string }> => {
    if (isFirebaseEnabled && FirebaseAuthService) {
      const { user: firebaseUser, error } = await FirebaseAuthService.signIn(email, password)
      
      if (firebaseUser && !error) {
        return { success: true }
      } else {
        return { success: false, error: error || 'Login failed' }
      }
    } else {
      // Use mock authentication
      const { user: mockUser, error } = await MockAuthService.signIn(email, password)
      
      if (mockUser && !error) {
        return { success: true }
      } else {
        return { success: false, error: error || 'Login failed' }
      }
    }
  }

  const signUp = async (email: string, password: string, name: string, role: UserRole): Promise<{ success: boolean, error?: string }> => {
    if (isFirebaseEnabled && FirebaseAuthService) {
      const { user: firebaseUser, error } = await FirebaseAuthService.signUp(email, password, name, role)
      
      if (firebaseUser && !error) {
        return { success: true }
      } else {
        return { success: false, error: error || 'Sign up failed' }
      }
    } else {
      // Use mock authentication
      const { user: mockUser, error } = await MockAuthService.signUp(email, password, name, role)
      
      if (mockUser && !error) {
        return { success: true }
      } else {
        return { success: false, error: error || 'Sign up failed' }
      }
    }
  }

  const loginWithGoogle = async (role: UserRole): Promise<{ success: boolean, error?: string }> => {
    if (isFirebaseEnabled && FirebaseAuthService) {
      const { user: firebaseUser, error } = await FirebaseAuthService.signInWithGoogle(role)
      
      if (firebaseUser && !error) {
        return { success: true }
      } else {
        return { success: false, error: error || 'Google sign in failed' }
      }
    } else {
      // Use mock authentication
      const { user: mockUser, error } = await MockAuthService.signInWithGoogle(role)
      
      if (mockUser && !error) {
        return { success: true }
      } else {
        return { success: false, error: error || 'Google sign in failed' }
      }
    }
  }

  const logout = async (): Promise<void> => {
    if (isFirebaseEnabled && FirebaseAuthService) {
      await FirebaseAuthService.signOut()
    } else {
      await MockAuthService.signOut()
    }
    // The onAuthStateChanged listener will handle clearing the user state
  }

  const resetPassword = async (email: string): Promise<{ success: boolean, error?: string }> => {
    if (isFirebaseEnabled && FirebaseAuthService) {
      const { error } = await FirebaseAuthService.resetPassword(email)
      
      if (!error) {
        return { success: true }
      } else {
        return { success: false, error: error || 'Password reset failed' }
      }
    } else {
      // Use mock authentication
      const { error } = await MockAuthService.resetPassword(email)
      
      if (!error) {
        return { success: true }
      } else {
        return { success: false, error: error || 'Password reset failed' }
      }
    }
  }

  return (
    <AuthContext.Provider value={{ 
      user, 
      firebaseUser, 
      login, 
      signUp, 
      loginWithGoogle, 
      logout, 
      resetPassword, 
      isLoading 
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}