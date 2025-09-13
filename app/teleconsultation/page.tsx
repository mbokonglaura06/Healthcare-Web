import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { TeleconsultationHub } from "@/components/teleconsultation/teleconsultation-hub"

export default function TeleconsultationPage() {
  return (
    <DashboardLayout allowedRoles={["patient", "doctor"]}>
      <div className="p-6">
        <TeleconsultationHub />
      </div>
    </DashboardLayout>
  )
}
