import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { SystemSettings } from "@/components/admin/system-settings"

export default function SettingsPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="p-6">
        <SystemSettings />
      </div>
    </DashboardLayout>
  )
}
