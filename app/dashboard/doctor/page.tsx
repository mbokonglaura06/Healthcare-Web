import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { DoctorDashboard } from "@/components/dashboard/doctor-dashboard"

export default function DoctorDashboardPage() {
  return (
    <DashboardLayout allowedRoles={["doctor"]}>
      <DoctorDashboard />
    </DashboardLayout>
  )
}
