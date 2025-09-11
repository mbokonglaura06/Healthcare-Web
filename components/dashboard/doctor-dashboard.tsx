"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, Users, Clock, Video, FileText, CheckCircle, XCircle, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, limit, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment } from "@/lib/types"

export function DoctorDashboard() {
  const { userProfile } = useAuth()
  const [todayAppointments, setTodayAppointments] = useState<Appointment[]>([])
  const [pendingAppointments, setPendingAppointments] = useState<Appointment[]>([])
  const [stats, setStats] = useState({
    todayTotal: 0,
    weeklyTotal: 0,
    pendingCount: 0,
    completedToday: 0,
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchDoctorData = async () => {
      if (!userProfile) return

      try {
        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        // Fetch today's appointments
        const todayQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", userProfile.uid),
          where("date", ">=", today),
          where("date", "<", tomorrow),
          orderBy("date", "asc"),
        )

        const todaySnapshot = await getDocs(todayQuery)
        const todayAppts = todaySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Appointment[]

        // Fetch pending appointments
        const pendingQuery = query(
          collection(db, "appointments"),
          where("doctorId", "==", userProfile.uid),
          where("status", "==", "scheduled"),
          where("date", ">=", today),
          orderBy("date", "asc"),
          limit(5),
        )

        const pendingSnapshot = await getDocs(pendingQuery)
        const pendingAppts = pendingSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Appointment[]

        setTodayAppointments(todayAppts)
        setPendingAppointments(pendingAppts)

        // Calculate stats
        const completedToday = todayAppts.filter((apt) => apt.status === "completed").length
        setStats({
          todayTotal: todayAppts.length,
          weeklyTotal: 0, // Would need additional query for weekly data
          pendingCount: pendingAppts.length,
          completedToday,
        })
      } catch (error) {
        console.error("Error fetching doctor data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchDoctorData()
  }, [userProfile])

  const handleAppointmentAction = async (appointmentId: string, action: "accept" | "reject" | "complete") => {
    try {
      const appointmentRef = doc(db, "appointments", appointmentId)
      let newStatus: string

      switch (action) {
        case "accept":
          newStatus = "scheduled"
          break
        case "reject":
          newStatus = "cancelled"
          break
        case "complete":
          newStatus = "completed"
          break
        default:
          return
      }

      await updateDoc(appointmentRef, {
        status: newStatus,
        updatedAt: new Date(),
      })

      // Refresh data
      window.location.reload()
    } catch (error) {
      console.error("Error updating appointment:", error)
    }
  }

  if (!userProfile) return null

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Good morning, Dr. {userProfile.lastName}!</h1>
        <p className="text-muted-foreground mt-2">Here's your practice overview for today</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.todayTotal}</div>
            <p className="text-xs text-muted-foreground">{stats.completedToday} completed</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Requests</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.pendingCount}</div>
            <p className="text-xs text-muted-foreground">Awaiting your response</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Week</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.weeklyTotal}</div>
            <p className="text-xs text-muted-foreground">Total appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teleconsultations</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {todayAppointments.filter((apt) => apt.type === "teleconsultation").length}
            </div>
            <p className="text-xs text-muted-foreground">Video calls today</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/appointments">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle className="ml-3">Manage Appointments</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>View and manage your appointment schedule</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/patients">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Users className="h-6 w-6 text-primary" />
              <CardTitle className="ml-3">Patient Records</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Access patient medical histories and records</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/profile">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="ml-3">Update Availability</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Manage your schedule and availability</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Today's Schedule */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Today's Schedule</CardTitle>
            <CardDescription>Your appointments for today</CardDescription>
          </div>
          <Link href="/appointments">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading schedule...</div>
          ) : todayAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No appointments scheduled for today</p>
            </div>
          ) : (
            <div className="space-y-4">
              {todayAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      {appointment.type === "teleconsultation" ? (
                        <Video className="h-8 w-8 text-primary" />
                      ) : (
                        <Calendar className="h-8 w-8 text-primary" />
                      )}
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{appointment.patientName}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {appointment.time} ({appointment.duration} min)
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Badge
                      variant={
                        appointment.status === "completed"
                          ? "default"
                          : appointment.status === "scheduled"
                            ? "secondary"
                            : appointment.status === "cancelled"
                              ? "destructive"
                              : "outline"
                      }
                    >
                      {appointment.status}
                    </Badge>
                    {appointment.status === "scheduled" && (
                      <div className="flex space-x-2">
                        {appointment.type === "teleconsultation" && (
                          <Button size="sm">
                            <Video className="mr-2 h-4 w-4" />
                            Start Call
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAppointmentAction(appointment.id, "complete")}
                        >
                          <CheckCircle className="mr-2 h-4 w-4" />
                          Complete
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pending Appointment Requests */}
      {pendingAppointments.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <AlertCircle className="h-5 w-5 text-secondary mr-2" />
              Pending Appointment Requests
            </CardTitle>
            <CardDescription>New appointment requests awaiting your approval</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {pendingAppointments.map((appointment) => (
                <div
                  key={appointment.id}
                  className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/5"
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Users className="h-8 w-8 text-secondary" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-foreground">{appointment.patientName}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.reason}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {appointment.date.toLocaleDateString()} at {appointment.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button size="sm" onClick={() => handleAppointmentAction(appointment.id, "accept")}>
                      <CheckCircle className="mr-2 h-4 w-4" />
                      Accept
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAppointmentAction(appointment.id, "reject")}
                    >
                      <XCircle className="mr-2 h-4 w-4" />
                      Decline
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
