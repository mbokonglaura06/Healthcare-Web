import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { AppointmentBooking } from "@/components/appointments/appointment-booking"

export default function BookAppointmentPage() {
  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="p-6">
        <AppointmentBooking />
      </div>
    </DashboardLayout>
  )
}
