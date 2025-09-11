"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, query, where, orderBy, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment } from "@/lib/types"
import { Calendar, Clock, Video, MapPin, Search, Filter, CheckCircle, XCircle, RotateCcw } from "lucide-react"

export function AppointmentList() {
  const { userProfile } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [filteredAppointments, setFilteredAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [typeFilter, setTypeFilter] = useState("all")

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userProfile) return

      try {
        const appointmentsRef = collection(db, "appointments")
        let q

        if (userProfile.role === "patient") {
          q = query(appointmentsRef, where("patientId", "==", userProfile.uid), orderBy("date", "desc"))
        } else if (userProfile.role === "doctor") {
          q = query(appointmentsRef, where("doctorId", "==", userProfile.uid), orderBy("date", "desc"))
        } else {
          // Admin can see all appointments
          q = query(appointmentsRef, orderBy("date", "desc"))
        }

        const querySnapshot = await getDocs(q)
        const appointmentsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Appointment[]

        setAppointments(appointmentsList)
        setFilteredAppointments(appointmentsList)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [userProfile])

  useEffect(() => {
    let filtered = appointments

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (apt) =>
          apt.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.doctorName.toLowerCase().includes(searchTerm.toLowerCase()) ||
          apt.reason.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Status filter
    if (statusFilter !== "all") {
      filtered = filtered.filter((apt) => apt.status === statusFilter)
    }

    // Type filter
    if (typeFilter !== "all") {
      filtered = filtered.filter((apt) => apt.type === typeFilter)
    }

    setFilteredAppointments(filtered)
  }, [appointments, searchTerm, statusFilter, typeFilter])

  const handleStatusUpdate = async (appointmentId: string, newStatus: string) => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId)
      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Update local state
      setAppointments((prev) =>
        prev.map((apt) =>
          apt.id === appointmentId ? { ...apt, status: newStatus as any, updatedAt: new Date() } : apt,
        ),
      )
    } catch (error) {
      console.error("Error updating appointment:", error)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "completed":
        return "default"
      case "scheduled":
        return "secondary"
      case "cancelled":
        return "destructive"
      case "no-show":
        return "outline"
      default:
        return "outline"
    }
  }

  if (!userProfile) return null

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">
          {userProfile.role === "patient"
            ? "My Appointments"
            : userProfile.role === "doctor"
              ? "Patient Appointments"
              : "All Appointments"}
        </h1>
        <p className="text-muted-foreground mt-2">
          {userProfile.role === "patient"
            ? "View and manage your scheduled appointments"
            : "Manage your patient appointments and schedule"}
        </p>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="mr-2 h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Search</label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search appointments..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Status</label>
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="scheduled">Scheduled</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                  <SelectItem value="no-show">No Show</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <Select value={typeFilter} onValueChange={setTypeFilter}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="in-person">In-Person</SelectItem>
                  <SelectItem value="teleconsultation">Teleconsultation</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Appointments List */}
      <Card>
        <CardHeader>
          <CardTitle>Appointments ({filteredAppointments.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading appointments...</div>
          ) : filteredAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments found</p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {appointment.type === "teleconsultation" ? (
                        <Video className="h-8 w-8 text-primary" />
                      ) : (
                        <MapPin className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">
                        {userProfile.role === "patient" ? `Dr. ${appointment.doctorName}` : appointment.patientName}
                      </h4>
                      <p className="text-sm text-muted-foreground">
                        {userProfile.role === "patient" ? appointment.doctorSpecialty : appointment.reason}
                      </p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {appointment.date.toLocaleDateString()} at {appointment.time}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <Badge variant={getStatusBadgeVariant(appointment.status)}>{appointment.status}</Badge>

                    {userProfile.role === "doctor" && appointment.status === "scheduled" && (
                      <div className="flex space-x-2">
                        <Button size="sm" onClick={() => handleStatusUpdate(appointment.id, "completed")}>
                          <CheckCircle className="mr-1 h-4 w-4" />
                          Complete
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusUpdate(appointment.id, "cancelled")}
                        >
                          <XCircle className="mr-1 h-4 w-4" />
                          Cancel
                        </Button>
                      </div>
                    )}

                    {userProfile.role === "patient" && appointment.status === "scheduled" && (
                      <Button size="sm" variant="outline">
                        <RotateCcw className="mr-1 h-4 w-4" />
                        Reschedule
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
