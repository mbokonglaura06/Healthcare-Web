"use client"

import { useAuth } from "@/lib/auth-context"
import { PatientAppointments } from "./patient-appointments"
import { AppointmentList } from "./appointment-list"

export function UnifiedAppointments() {
  const { userProfile } = useAuth()

  if (!userProfile) {
    return <div>Loading...</div>
  }

  if (userProfile.role === "patient") {
    return <PatientAppointments />
  }

  // AppointmentList already handles doctor and admin roles appropriately
  return <AppointmentList />
}
