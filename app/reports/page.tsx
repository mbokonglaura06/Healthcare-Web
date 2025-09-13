import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { ReportsAnalytics } from "@/components/admin/reports-analytics"

export default function ReportsPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="p-6">
        <ReportsAnalytics />
      </div>
    </DashboardLayout>
  )
}
