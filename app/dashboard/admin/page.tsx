import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AdminDashboard } from "@/components/dashboard/admin-dashboard"

export default function AdminDashboardPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <AdminDashboard />
    </DashboardLayout>
  )
}
