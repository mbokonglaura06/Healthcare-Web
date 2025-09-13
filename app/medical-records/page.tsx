"use client"

import { DashboardLayout } from "@/components/dashboard/dashboard-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, Download, Eye, Calendar, User } from "lucide-react"
import { useAuth } from "@/lib/auth-context"
import { useEffect, useState } from "react"

interface MedicalRecord {
  id: string
  type: "prescription" | "lab_result" | "diagnosis" | "report"
  title: string
  doctorName: string
  date: Date
  description: string
  fileUrl?: string
  status: "active" | "completed" | "pending"
}

export default function MedicalRecordsPage() {
  const { userProfile } = useAuth()
  const [records, setRecords] = useState<MedicalRecord[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchMedicalRecords = async () => {
      if (!userProfile) return

      try {
        // Mock data for demonstration - replace with actual Firebase query
        const mockRecords: MedicalRecord[] = [
          {
            id: "1",
            type: "prescription",
            title: "Blood Pressure Medication",
            doctorName: "Dr. Sarah Johnson",
            date: new Date("2024-01-15"),
            description: "Lisinopril 10mg - Take once daily",
            status: "active",
          },
          {
            id: "2",
            type: "lab_result",
            title: "Blood Test Results",
            doctorName: "Dr. Michael Chen",
            date: new Date("2024-01-10"),
            description: "Complete blood count and lipid panel",
            status: "completed",
          },
          {
            id: "3",
            type: "diagnosis",
            title: "Annual Physical Examination",
            doctorName: "Dr. Sarah Johnson",
            date: new Date("2024-01-05"),
            description: "Routine checkup - All vitals normal",
            status: "completed",
          },
        ]

        setRecords(mockRecords)
      } catch (error) {
        console.error("Error fetching medical records:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchMedicalRecords()
  }, [userProfile])

  const getRecordIcon = (type: string) => {
    switch (type) {
      case "prescription":
        return "💊"
      case "lab_result":
        return "🧪"
      case "diagnosis":
        return "🩺"
      case "report":
        return "📋"
      default:
        return "📄"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  return (
    <DashboardLayout allowedRoles={["patient"]}>
      <div className="p-6 space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Medical Records</h1>
          <p className="text-muted-foreground mt-2">View and manage your medical history</p>
        </div>

        {loading ? (
          <div className="text-center py-8 text-muted-foreground">Loading medical records...</div>
        ) : records.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground mb-4">No medical records found</p>
              <p className="text-sm text-muted-foreground">Your medical records will appear here after appointments</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {records.map((record) => (
              <Card key={record.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{getRecordIcon(record.type)}</span>
                      <div>
                        <CardTitle className="text-lg">{record.title}</CardTitle>
                        <CardDescription className="flex items-center space-x-4 mt-1">
                          <span className="flex items-center">
                            <User className="h-4 w-4 mr-1" />
                            {record.doctorName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="h-4 w-4 mr-1" />
                            {record.date.toLocaleDateString()}
                          </span>
                        </CardDescription>
                      </div>
                    </div>
                    <Badge className={getStatusColor(record.status)}>{record.status}</Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-foreground mb-4">{record.description}</p>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="mr-2 h-4 w-4" />
                      View Details
                    </Button>
                    {record.fileUrl && (
                      <Button variant="outline" size="sm">
                        <Download className="mr-2 h-4 w-4" />
                        Download
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  )
}
