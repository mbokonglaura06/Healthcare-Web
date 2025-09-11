"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { collection, query, where, orderBy, getDocs, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment } from "@/lib/types"
import { Video, Calendar, Clock, Play } from "lucide-react"
import { VideoCall } from "./video-call"
import { WaitingRoom } from "./waiting-room"

type ViewState = "hub" | "waiting" | "call"

export function TeleconsultationHub() {
  const { userProfile } = useAuth()
  const [appointments, setAppointments] = useState<Appointment[]>([])
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null)
  const [viewState, setViewState] = useState<ViewState>("hub")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchTeleconsultationAppointments = async () => {
      if (!userProfile) return

      try {
        const appointmentsRef = collection(db, "appointments")
        const today = new Date()
        today.setHours(0, 0, 0, 0)

        let q
        if (userProfile.role === "patient") {
          q = query(
            appointmentsRef,
            where("patientId", "==", userProfile.uid),
            where("type", "==", "teleconsultation"),
            where("date", ">=", Timestamp.fromDate(today)),
            orderBy("date", "asc"),
          )
        } else if (userProfile.role === "doctor") {
          q = query(
            appointmentsRef,
            where("doctorId", "==", userProfile.uid),
            where("type", "==", "teleconsultation"),
            where("date", ">=", Timestamp.fromDate(today)),
            orderBy("date", "asc"),
          )
        } else {
          return
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
      } catch (error) {
        console.error("Error fetching teleconsultation appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchTeleconsultationAppointments()
  }, [userProfile])

  const getAppointmentStatus = (appointment: Appointment) => {
    const now = new Date()
    const appointmentDateTime = new Date(appointment.date)
    const [hours, minutes] = appointment.time.split(":").map(Number)
    appointmentDateTime.setHours(hours, minutes, 0, 0)

    const timeDiff = appointmentDateTime.getTime() - now.getTime()
    const minutesDiff = Math.floor(timeDiff / (1000 * 60))

    if (minutesDiff < -30) {
      return { status: "past", label: "Completed", variant: "outline" as const }
    } else if (minutesDiff <= 15 && minutesDiff >= -15) {
      return { status: "active", label: "Join Now", variant: "default" as const }
    } else if (minutesDiff > 15) {
      return { status: "upcoming", label: "Upcoming", variant: "secondary" as const }
    } else {
      return { status: "past", label: "Missed", variant: "destructive" as const }
    }
  }

  const handleJoinCall = (appointment: Appointment) => {
    setSelectedAppointment(appointment)
    setViewState("waiting")
  }

  const handleStartCall = () => {
    setViewState("call")
  }

  const handleEndCall = () => {
    setViewState("hub")
    setSelectedAppointment(null)
  }

  const handleLeaveWaiting = () => {
    setViewState("hub")
    setSelectedAppointment(null)
  }

  if (viewState === "call" && selectedAppointment) {
    return (
      <VideoCall
        appointmentId={selectedAppointment.id}
        isDoctor={userProfile?.role === "doctor"}
        patientName={selectedAppointment.patientName}
        doctorName={selectedAppointment.doctorName}
        onCallEnd={handleEndCall}
      />
    )
  }

  if (viewState === "waiting" && selectedAppointment) {
    return (
      <WaitingRoom
        appointmentId={selectedAppointment.id}
        doctorName={selectedAppointment.doctorName}
        appointmentTime={`${selectedAppointment.date.toLocaleDateString()} at ${selectedAppointment.time}`}
        onJoinCall={handleStartCall}
        onLeaveWaitingRoom={handleLeaveWaiting}
      />
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Teleconsultation</h1>
        <p className="text-muted-foreground mt-2">
          {userProfile?.role === "doctor"
            ? "Manage your virtual consultations with patients"
            : "Connect with your healthcare providers via video calls"}
        </p>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Calls</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {
                appointments.filter((apt) => {
                  const today = new Date()
                  return apt.date.toDateString() === today.toDateString()
                }).length
              }
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Now</CardTitle>
            <Play className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {appointments.filter((apt) => getAppointmentStatus(apt).status === "active").length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{appointments.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Teleconsultations */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Video className="mr-2 h-5 w-5" />
            Scheduled Teleconsultations
          </CardTitle>
          <CardDescription>Your upcoming video consultations</CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading appointments...</div>
          ) : appointments.length === 0 ? (
            <div className="text-center py-8">
              <Video className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No teleconsultations scheduled</p>
              {userProfile?.role === "patient" && <Button>Schedule Teleconsultation</Button>}
            </div>
          ) : (
            <div className="space-y-4">
              {appointments.map((appointment) => {
                const status = getAppointmentStatus(appointment)

                return (
                  <div
                    key={appointment.id}
                    className="flex items-center justify-between p-4 border border-border rounded-lg"
                  >
                    <div className="flex items-center space-x-4">
                      <div className="flex-shrink-0">
                        <Video className="h-8 w-8 text-primary" />
                      </div>
                      <div>
                        <h4 className="font-semibold text-foreground">
                          {userProfile?.role === "patient" ? `Dr. ${appointment.doctorName}` : appointment.patientName}
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {userProfile?.role === "patient" ? appointment.doctorSpecialty : appointment.reason}
                        </p>
                        <div className="flex items-center text-sm text-muted-foreground mt-1">
                          <Clock className="h-4 w-4 mr-1" />
                          {appointment.date.toLocaleDateString()} at {appointment.time}
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <Badge variant={status.variant}>{status.label}</Badge>

                      {status.status === "active" && (
                        <Button onClick={() => handleJoinCall(appointment)}>
                          <Video className="mr-2 h-4 w-4" />
                          Join Call
                        </Button>
                      )}

                      {status.status === "upcoming" && (
                        <Button variant="outline" onClick={() => handleJoinCall(appointment)} disabled={true}>
                          <Clock className="mr-2 h-4 w-4" />
                          Wait
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>

      {/* System Requirements */}
      <Card>
        <CardHeader>
          <CardTitle>System Requirements</CardTitle>
          <CardDescription>Ensure optimal teleconsultation experience</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Recommended Browser</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Chrome 88+ (recommended)</li>
                <li>• Firefox 85+</li>
                <li>• Safari 14+</li>
                <li>• Edge 88+</li>
              </ul>
            </div>
            <div>
              <h4 className="font-medium mb-2">Hardware Requirements</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>• Camera and microphone</li>
                <li>• Stable internet (5+ Mbps)</li>
                <li>• Updated browser</li>
                <li>• Quiet environment</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
