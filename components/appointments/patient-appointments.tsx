"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Clock, Video, MapPin, Plus } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment } from "@/lib/types"
import Link from "next/link"

export function PatientAppointments() {
  const { userProfile } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<"all" | "upcoming" | "completed" | "cancelled">("all")

  useEffect(() => {
    const fetchAppointments = async () => {
      if (!userProfile) return

      try {
        const appointmentsRef = collection(db, "appointments")
        const q = query(appointmentsRef, where("patientId", "==", userProfile.uid), orderBy("date", "desc"))

        const querySnapshot = await getDocs(q)
        const appointmentData = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Appointment[]

        setAppointments(appointmentData)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAppointments()
  }, [userProfile])

  const filteredAppointments = appointments.filter((appointment) => {
    if (filter === "all") return true
    if (filter === "upcoming") return appointment.status === "scheduled" && appointment.date > new Date()
    if (filter === "completed") return appointment.status === "completed"
    if (filter === "cancelled") return appointment.status === "cancelled"
    return true
  })

  const getStatusColor = (status: string) => {
    switch (status) {
      case "scheduled":
        return "bg-blue-100 text-blue-800"
      case "completed":
        return "bg-green-100 text-green-800"
      case "cancelled":
        return "bg-red-100 text-red-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <div className="space-y-6">
      {/* Header with Actions */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-foreground">My Appointments</h2>
          <p className="text-muted-foreground">Manage your healthcare appointments</p>
        </div>
        <Link href="/appointments/book">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Book New Appointment
          </Button>
        </Link>
      </div>

      {/* Filter Buttons */}
      <div className="flex space-x-2">
        <Button variant={filter === "all" ? "default" : "outline"} size="sm" onClick={() => setFilter("all")}>
          All
        </Button>
        <Button variant={filter === "upcoming" ? "default" : "outline"} size="sm" onClick={() => setFilter("upcoming")}>
          Upcoming
        </Button>
        <Button
          variant={filter === "completed" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("completed")}
        >
          Completed
        </Button>
        <Button
          variant={filter === "cancelled" ? "default" : "outline"}
          size="sm"
          onClick={() => setFilter("cancelled")}
        >
          Cancelled
        </Button>
      </div>

      {/* Appointments List */}
      {loading ? (
        <div className="text-center py-8 text-muted-foreground">Loading appointments...</div>
      ) : filteredAppointments.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="text-muted-foreground mb-4">No appointments found</p>
            <Link href="/appointments/book">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Book Your First Appointment
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredAppointments.map((appointment) => (
            <Card key={appointment.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {appointment.type === "teleconsultation" ? (
                        <Video className="h-8 w-8 text-primary" />
                      ) : (
                        <MapPin className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <CardTitle className="text-lg">Dr. {appointment.doctorName}</CardTitle>
                      <CardDescription>{appointment.doctorSpecialty}</CardDescription>
                    </div>
                  </div>
                  <Badge className={getStatusColor(appointment.status)}>{appointment.status}</Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    {appointment.date.toLocaleDateString()}
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    {appointment.time}
                  </div>
                </div>

                {appointment.reason && (
                  <p className="text-sm text-foreground mb-4">
                    <strong>Reason:</strong> {appointment.reason}
                  </p>
                )}

                <div className="flex space-x-2">
                  {appointment.status === "scheduled" && appointment.type === "teleconsultation" && (
                    <Link href="/teleconsultation">
                      <Button size="sm">
                        <Video className="mr-2 h-4 w-4" />
                        Join Call
                      </Button>
                    </Link>
                  )}
                  {appointment.status === "scheduled" && (
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                  )}
                  <Button variant="outline" size="sm">
                    View Details
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
