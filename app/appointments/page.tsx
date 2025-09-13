import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { PatientAppointments } from "@/components/appointments/patient-appointments"

export default function AppointmentsPage() {
  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="p-6">
        <PatientAppointments />
      </div>
    </DashboardLayout>
  )
}
