import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { UserManagement } from "@/components/admin/user-management"

export default function UsersPage() {
  return (
    <DashboardLayout allowedRoles={["admin"]}>
      <div className="p-6">
        <UserManagement />
      </div>
    </DashboardLayout>
  )
}
