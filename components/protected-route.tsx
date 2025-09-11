"use client"

import type React from "react"

import { useAuth } from "@/lib/auth-context"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { Loader2 } from "lucide-react"

interface ProtectedRouteProps {
  children: React.ReactNode
  allowedRoles?: ("patient" | "doctor" | "admin")[]
  redirectTo?: string
}

export function ProtectedRoute({
  children,
  allowedRoles = ["patient", "doctor", "admin"],
  redirectTo = "/login",
}: ProtectedRouteProps) {
  const { user, userProfile, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push(redirectTo)
        return
      }

      if (userProfile && !allowedRoles.includes(userProfile.role)) {
        router.push("/unauthorized")
        return
      }

      // Check if doctor is approved
      if (userProfile?.role === "doctor" && !userProfile.isApproved) {
        router.push("/pending-approval")
        return
      }
    }
  }, [user, userProfile, loading, router, allowedRoles, redirectTo])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  if (!user || !userProfile) {
    return null
  }

  if (!allowedRoles.includes(userProfile.role)) {
    return null
  }

  if (userProfile.role === "doctor" && !userProfile.isApproved) {
    return null
  }

  return <>{children}</>
}
