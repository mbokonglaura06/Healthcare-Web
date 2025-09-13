"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PatientDashboard } from "@/components/dashboard/patient-dashboard"
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"
import { useAuth } from "@/lib/auth-context"

function DashboardContent() {
  const { userProfile } = useAuth()

  if (!userProfile) {
    return <div className="p-6">Loading...</div>
  }

  switch (userProfile.role) {
    case "admin":
      return <AdminDashboard />
    case "doctor":
      return <DoctorDashboard />
    case "patient":
    default:
      return <PatientDashboard />
  }
}

export default function DashboardPage() {
  return (
    <DashboardLayout allowedRoles={["patient", "doctor", "admin"]}>
      <DashboardContent />
    </DashboardLayout>
  )
}
