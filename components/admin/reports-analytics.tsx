"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { collection, getDocs } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Appointment, UserProfile } from "@/lib/auth-context"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts"
import { TrendingUp, Users, Calendar, Video, Download, FileText } from "lucide-react"

interface ReportData {
  appointmentsByMonth: { month: string; appointments: number; teleconsultations: number }[]
  appointmentsBySpecialty: { specialty: string; count: number }[]
  userGrowth: { month: string; patients: number; doctors: number }[]
  appointmentStatus: { status: string; count: number; color: string }[]
}

export function ReportsAnalytics() {
  const { userProfile } = useAuth()
  const [reportData, setReportData] = useState<ReportData>({
    appointmentsByMonth: [],
    appointmentsBySpecialty: [],
    userGrowth: [],
    appointmentStatus: [],
  })
  const [dateRange, setDateRange] = useState("last-6-months")
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchReportData = async () => {
      if (!userProfile || userProfile.role !== "admin") return

      try {
        // Fetch appointments
        const appointmentsSnapshot = await getDocs(collection(db, "appointments"))
        const appointments = appointmentsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate(),
          createdAt: doc.data().createdAt.toDate(),
        })) as Appointment[]

        // Fetch users
        const usersSnapshot = await getDocs(collection(db, "users"))
        const users = usersSnapshot.docs.map((doc) => ({
          uid: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate() || new Date(),
        })) as UserProfile[]

        // Process data for charts
        const monthlyData = processMonthlyAppointments(appointments)
        const specialtyData = processSpecialtyData(appointments, users)
        const growthData = processUserGrowth(users)
        const statusData = processAppointmentStatus(appointments)

        setReportData({
          appointmentsByMonth: monthlyData,
          appointmentsBySpecialty: specialtyData,
          userGrowth: growthData,
          appointmentStatus: statusData,
        })
      } catch (error) {
        console.error("Error fetching report data:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchReportData()
  }, [userProfile, dateRange])

  const processMonthlyAppointments = (appointments: Appointment[]) => {
    const monthlyStats: { [key: string]: { appointments: number; teleconsultations: number } } = {}

    appointments.forEach((apt) => {
      const monthKey = apt.date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
      if (!monthlyStats[monthKey]) {
        monthlyStats[monthKey] = { appointments: 0, teleconsultations: 0 }
      }
      monthlyStats[monthKey].appointments++
      if (apt.type === "teleconsultation") {
        monthlyStats[monthKey].teleconsultations++
      }
    })

    return Object.entries(monthlyStats)
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .slice(-6) // Last 6 months
  }

  const processSpecialtyData = (appointments: Appointment[], users: UserProfile[]) => {
    const specialtyStats: { [key: string]: number } = {}

    appointments.forEach((apt) => {
      if (apt.doctorSpecialty) {
        specialtyStats[apt.doctorSpecialty] = (specialtyStats[apt.doctorSpecialty] || 0) + 1
      }
    })

    return Object.entries(specialtyStats)
      .map(([specialty, count]) => ({ specialty, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 8) // Top 8 specialties
  }

  const processUserGrowth = (users: UserProfile[]) => {
    const monthlyGrowth: { [key: string]: { patients: number; doctors: number } } = {}

    users.forEach((user) => {
      const monthKey = user.createdAt.toLocaleDateString("en-US", { year: "numeric", month: "short" })
      if (!monthlyGrowth[monthKey]) {
        monthlyGrowth[monthKey] = { patients: 0, doctors: 0 }
      }
      if (user.role === "patient") {
        monthlyGrowth[monthKey].patients++
      } else if (user.role === "doctor") {
        monthlyGrowth[monthKey].doctors++
      }
    })

    return Object.entries(monthlyGrowth)
      .map(([month, data]) => ({
        month,
        ...data,
      }))
      .slice(-6) // Last 6 months
  }

  const processAppointmentStatus = (appointments: Appointment[]) => {
    const statusStats: { [key: string]: number } = {}

    appointments.forEach((apt) => {
      statusStats[apt.status] = (statusStats[apt.status] || 0) + 1
    })

    const colors = {
      scheduled: "#10b981",
      completed: "#059669",
      cancelled: "#ef4444",
      "no-show": "#f59e0b",
    }

    return Object.entries(statusStats).map(([status, count]) => ({
      status,
      count,
      color: colors[status as keyof typeof colors] || "#6b7280",
    }))
  }

  const exportReport = (type: "pdf" | "csv") => {
    // In a real implementation, this would generate and download the report
    console.log(`Exporting ${type} report...`)
    alert(`${type.toUpperCase()} report export functionality would be implemented here`)
  }

  if (!userProfile || userProfile.role !== "admin") {
    return <div>Access denied. Admin privileges required.</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Reports & Analytics</h1>
          <p className="text-muted-foreground mt-2">System performance and usage analytics</p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last-30-days">Last 30 Days</SelectItem>
              <SelectItem value="last-3-months">Last 3 Months</SelectItem>
              <SelectItem value="last-6-months">Last 6 Months</SelectItem>
              <SelectItem value="last-year">Last Year</SelectItem>
            </SelectContent>
          </Select>
          <Button onClick={() => exportReport("pdf")}>
            <Download className="mr-2 h-4 w-4" />
            Export PDF
          </Button>
          <Button variant="outline" onClick={() => exportReport("csv")}>
            <FileText className="mr-2 h-4 w-4" />
            Export CSV
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">
              {reportData.appointmentsByMonth.reduce((sum, month) => sum + month.appointments, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+12% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Teleconsultations</CardTitle>
            <Video className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-secondary">
              {reportData.appointmentsByMonth.reduce((sum, month) => sum + month.teleconsultations, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+25% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">User Growth</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-accent">
              {reportData.userGrowth.reduce((sum, month) => sum + month.patients + month.doctors, 0)}
            </div>
            <p className="text-xs text-muted-foreground">+8% from last period</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completion Rate</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">94.2%</div>
            <p className="text-xs text-muted-foreground">+2.1% from last period</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Monthly Appointments */}
        <Card>
          <CardHeader>
            <CardTitle>Monthly Appointments</CardTitle>
            <CardDescription>Appointment trends over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.appointmentsByMonth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="appointments" fill="#10b981" name="Total Appointments" />
                <Bar dataKey="teleconsultations" fill="#059669" name="Teleconsultations" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Appointment Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
            <CardDescription>Distribution of appointment statuses</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={reportData.appointmentStatus}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="count"
                  label={({ status, count }) => `${status}: ${count}`}
                >
                  {reportData.appointmentStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* User Growth */}
        <Card>
          <CardHeader>
            <CardTitle>User Growth</CardTitle>
            <CardDescription>New user registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={reportData.userGrowth}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Line type="monotone" dataKey="patients" stroke="#10b981" name="Patients" />
                <Line type="monotone" dataKey="doctors" stroke="#059669" name="Doctors" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Top Specialties */}
        <Card>
          <CardHeader>
            <CardTitle>Popular Specialties</CardTitle>
            <CardDescription>Most requested medical specialties</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={reportData.appointmentsBySpecialty} layout="horizontal">
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis type="number" />
                <YAxis dataKey="specialty" type="category" width={100} />
                <Tooltip />
                <Bar dataKey="count" fill="#10b981" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
