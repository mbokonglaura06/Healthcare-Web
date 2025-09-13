"use client"

import type React from "react"

import { createContext, useContext, useEffect, useState } from "react"
import {
  type User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from "firebase/auth"
import { doc, getDoc, setDoc } from "firebase/firestore"
import { auth, db } from "./firebase"

export type UserRole = "patient" | "doctor" | "admin"

export interface UserProfile {
  uid: string
  email: string
  role: UserRole
  firstName: string
  lastName: string
  phone?: string
  specialty?: string // For doctors
  isApproved?: boolean // For doctors
  createdAt: Date
}

interface AuthContextType {
  user: User | null
  userProfile: UserProfile | null
  loading: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, userData: Partial<UserProfile>) => Promise<void>
  logout: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user)

      if (user) {
        // Fetch user profile from Firestore
        const userDoc = await getDoc(doc(db, "users", user.uid))
        if (userDoc.exists()) {
          setUserProfile(userDoc.data() as UserProfile)
        }
      } else {
        setUserProfile(null)
      }

      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signIn = async (email: string, password: string) => {
    await signInWithEmailAndPassword(auth, email, password)
  }

  const signUp = async (email: string, password: string, userData: Partial<UserProfile>) => {
    const { user } = await createUserWithEmailAndPassword(auth, email, password)

    const userProfile: UserProfile = {
      uid: user.uid,
      email: user.email!,
      role: userData.role || "patient",
      firstName: userData.firstName || "",
      lastName: userData.lastName || "",
      phone: userData.phone,
      ...(userData.role === "doctor" && { specialty: userData.specialty }),
      isApproved: userData.role === "patient" || userData.role === "admin" ? true : false, // Patients and admins auto-approved
      createdAt: new Date(),
    }

    await setDoc(doc(db, "users", user.uid), userProfile)
    setUserProfile(userProfile)
  }

  const logout = async () => {
    await signOut(auth)
  }

  const value = {
    user,
    userProfile,
    loading,
    signIn,
    signUp,
    logout,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
