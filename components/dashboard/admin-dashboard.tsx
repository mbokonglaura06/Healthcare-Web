"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { QuickApproveDoctors } from "@/components/admin/quick-approve-doctors"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment, UserProfile } from "@/lib/auth-context"
import { Users, Calendar, AlertTriangle, TrendingUp, Clock, CheckCircle, XCircle } from "lucide-react"

interface AdminStats {
  totalUsers: number
  totalPatients: number
  totalDoctors: number
  pendingDoctors: number
  totalAppointments: number
  todayAppointments: number
  teleconsultations: number
  systemAlerts: number
}

export function AdminDashboard() {
  const { userProfile } = useAuth()
  const [stats, setStats] = useState<AdminStats>({
    totalUsers: 0,
    totalPatients: 0,
    totalDoctors: 0,
    pendingDoctors: 0,
    totalAppointments: 0,
    todayAppointments: 0,
    teleconsultations: 0,
    systemAlerts: 0,
  })
  const [recentActivity, setRecentActivity] = useState<any[]>([])
  const [pendingApprovals, setPendingApprovals] = useState<UserProfile[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAdminData = async () => {
      if (!userProfile || userProfile.role !== "admin") return

      try {
        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"))
        const users = usersSnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })) as UserProfile[]

        const patients = users.filter((user) => user.role === "patient")
        const doctors = users.filter((user) => user.role === "doctor")
        const pendingDocs = doctors.filter((doc) => !doc.isApproved)

        // Fetch appointments
        const appointmentsSnapshot = await getDocs(collection(db, "appointments"))
        const appointments = appointmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
          updatedAt: doc.data().updatedAt.toDate(),
        })) as Appointment[]

        const today = new Date()
        today.setHours(0, 0, 0, 0)
        const tomorrow = new Date(today)
        tomorrow.setDate(tomorrow.getDate() + 1)

        const todayAppts = appointments.filter((apt) => apt.date >= today && apt.date < tomorrow)

        const teleconsults = appointments.filter((apt) => apt.type === "teleconsultation")

        setStats({
          totalUsers: users.length,
          totalPatients: patients.length,
          totalDoctors: doctors.length,
          pendingDoctors: pendingDocs.length,
          totalAppointments: appointments.length,
          todayAppointments: todayAppts.length,
          teleconsultations: teleconsults.length,
          systemAlerts:
            pendingDocs.length + (todayAppts.filter((apt) => apt.status === "scheduled").length > 10 ? 1 : 0),
        })

        setPendingApprovals(pendingDocs.slice(0, 5))

        // Generate recent activity (simplified)
        const recentActivities = [
          { type: "user_registration", message: "New patient registered", time: "2 minutes ago", icon: Users },
          { type: "appointment_booked", message: "Teleconsultation scheduled", time: "5 minutes ago", icon: Calendar },
          { type: "doctor_approved", message: "Dr. Smith approved", time: "1 hour ago", icon: CheckCircle },
          { type: "system_alert", message: "High appointment volume", time: "2 hours ago", icon: AlertTriangle },
        ]
        setRecentActivity(recentActivities)
      } catch (error) {
        console.error("Error fetching admin data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAdminData()
  }, [userProfile])

  if (!userProfile || userProfile.role !== "admin") {
    return <div>Access denied. Admin privileges required.</div>
  }

  return (
    <div className="p-6 space-y-6">
      {/* Welcome Header */}
      <div>
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-2">System overview and management controls</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              {stats.totalPatients} patients, {stats.totalDoctors} doctors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Today's Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">{stats.todayAppointments}</div>
            <p className="text-xs text-muted-foreground">{stats.teleconsultations} teleconsultations total</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Approvals</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">{stats.pendingDoctors}</div>
            <p className="text-xs text-muted-foreground">Doctor applications awaiting review</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Alerts</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{stats.systemAlerts}</div>
            <p className="text-xs text-muted-foreground">Require immediate attention</p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <QuickApproveDoctors />

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <Users className="h-6 w-6 text-primary" />
            <CardTitle className="ml-3">User Management</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Manage patients, doctors, and user accounts</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <TrendingUp className="h-6 w-6 text-primary" />
            <CardTitle className="ml-3">Analytics & Reports</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>View system analytics and generate reports</CardDescription>
          </CardContent>
        </Card>

        <Card className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader className="flex flex-row items-center space-y-0 pb-2">
            <AlertTriangle className="h-6 w-6 text-primary" />
            <CardTitle className="ml-3">System Monitoring</CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>Monitor system health and performance</CardDescription>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Doctor Approvals */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle className="flex items-center">
                <Clock className="mr-2 h-5 w-5 text-secondary" />
                Pending Doctor Approvals
              </CardTitle>
              <CardDescription>New doctor applications requiring review</CardDescription>
            </div>
            <Button variant="outline" size="sm">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-center py-8 text-muted-foreground">Loading approvals...</div>
            ) : pendingApprovals.length === 0 ? (
              <div className="text-center py-8">
                <CheckCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">No pending approvals</p>
              </div>
            ) : (
              <div className="space-y-4">
                {pendingApprovals.map((doctor) => (
                  <div
                    key={doctor.uid}
                    className="flex items-center justify-between p-4 border border-border rounded-lg bg-secondary/5"
                  >
                    <div>
                      <h4 className="font-semibold text-foreground">
                        Dr. {doctor.firstName} {doctor.lastName}
                      </h4>
                      <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                      <p className="text-xs text-muted-foreground">{doctor.email}</p>
                    </div>
                    <div className="flex space-x-2">
                      <Button size="sm">
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Approve
                      </Button>
                      <Button size="sm" variant="outline">
                        <XCircle className="mr-2 h-4 w-4" />
                        Reject
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>Recent System Activity</CardTitle>
            <CardDescription>Latest events and system changes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivity.map((activity, index) => {
                const Icon = activity.icon
                return (
                  <div key={index} className="flex items-center space-x-4">
                    <div className="flex-shrink-0">
                      <Icon className="h-5 w-5 text-primary" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground">{activity.message}</p>
                      <p className="text-xs text-muted-foreground">{activity.time}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* System Health Overview */}
      <Card>
        <CardHeader>
          <CardTitle>System Health Overview</CardTitle>
          <CardDescription>Current system status and performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">99.9%</div>
              <p className="text-sm text-muted-foreground">Uptime</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">245ms</div>
              <p className="text-sm text-muted-foreground">Avg Response</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">1,247</div>
              <p className="text-sm text-muted-foreground">Active Sessions</p>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">15.2GB</div>
              <p className="text-sm text-muted-foreground">Storage Used</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
