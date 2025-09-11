"use client"

import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, Video, FileText, Clock, Plus } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { collection, query, where, orderBy, limit, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment } from "@/lib/types"

export function PatientDashboard() {
  const { userProfile } = useAuth()
  const [upcomingAppointments, setUpcomingAppointments] = useState<Appointment[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchUpcomingAppointments = async () => {
      if (!userProfile) return

      try {
        const appointmentsRef = collection(db, "appointments")
        const q = query(
          appointmentsRef,
          where("patientId", "==", userProfile.uid),
          where("status", "==", "scheduled"),
          orderBy("date", "asc"),
          limit(3),
        )

        const querySnapshot = await getDocs(q)
        const appointments = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Appointment[]

        setUpcomingAppointments(appointments)
      } catch (error) {
        console.error("Error fetching appointments:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchUpcomingAppointments()
  }, [userProfile])

  if (!userProfile) return null

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Welcome back, {userProfile.firstName}!</h1>
        <p className="text-muted-foreground mt-2">Here's an overview of your healthcare activities</p>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link href="/appointments/book">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle className="ml-3">Book Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Schedule a new appointment with a healthcare provider</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/teleconsultation">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Video className="h-6 w-6 text-primary" />
              <CardTitle className="ml-3">Teleconsultation</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>Connect with doctors via secure video calls</CardDescription>
            </CardContent>
          </Card>
        </Link>

        <Link href="/medical-records">
          <Card className="hover:shadow-md transition-shadow cursor-pointer">
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle className="ml-3">Medical Records</CardTitle>
            </CardHeader>
            <CardContent>
              <CardDescription>View your medical history and prescriptions</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Upcoming Appointments</CardTitle>
            <CardDescription>Your next scheduled appointments</CardDescription>
          </div>
          <Link href="/appointments">
            <Button variant="outline" size="sm">
              View All
            </Button>
          </Link>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8 text-muted-foreground">Loading appointments...</div>
          ) : upcomingAppointments.length === 0 ? (
            <div className="text-center py-8">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No upcoming appointments</p>
              <Link href="/appointments/book">
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Book Your First Appointment
                </Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
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
                      <h4 className="font-semibold text-foreground">Dr. {appointment.doctorName}</h4>
                      <p className="text-sm text-muted-foreground">{appointment.doctorSpecialty}</p>
                      <div className="flex items-center text-sm text-muted-foreground mt-1">
                        <Clock className="h-4 w-4 mr-1" />
                        {appointment.date.toLocaleDateString()} at {appointment.time}
                      </div>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    {appointment.type === "teleconsultation" && (
                      <Button size="sm">
                        <Video className="mr-2 h-4 w-4" />
                        Join Call
                      </Button>
                    )}
                    <Button variant="outline" size="sm">
                      Reschedule
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Health Summary */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>Your latest healthcare interactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-primary rounded-full"></div>
                <span className="text-sm text-foreground">Appointment completed with Dr. Smith</span>
                <span className="text-xs text-muted-foreground ml-auto">2 days ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-secondary rounded-full"></div>
                <span className="text-sm text-foreground">Prescription updated</span>
                <span className="text-xs text-muted-foreground ml-auto">1 week ago</span>
              </div>
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-accent rounded-full"></div>
                <span className="text-sm text-foreground">Lab results available</span>
                <span className="text-xs text-muted-foreground ml-auto">2 weeks ago</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Health Reminders</CardTitle>
            <CardDescription>Important health notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="p-3 bg-primary/10 rounded-lg">
                <p className="text-sm font-medium text-foreground">Annual Checkup Due</p>
                <p className="text-xs text-muted-foreground">Schedule your yearly physical examination</p>
              </div>
              <div className="p-3 bg-secondary/10 rounded-lg">
                <p className="text-sm font-medium text-foreground">Medication Refill</p>
                <p className="text-xs text-muted-foreground">Your prescription expires in 5 days</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
