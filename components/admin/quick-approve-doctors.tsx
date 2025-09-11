"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, getDocs, doc, updateDoc } from "firebase/firestore"
import { db } from "@/lib/firebase"
import { CheckCircle, Users, Loader2 } from "lucide-react"

export function QuickApproveDoctors() {
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const approveAllPendingDoctors = async () => {
    setLoading(true)
    setMessage(null)

    try {
      const doctorsRef = collection(db, "users")
      const q = query(doctorsRef, where("role", "==", "doctor"), where("isApproved", "==", false))

      const querySnapshot = await getDocs(q)
      const pendingDoctors = querySnapshot.docs

      if (pendingDoctors.length === 0) {
        setMessage({ type: "success", text: "No pending doctors to approve" })
        return
      }

      const approvalPromises = pendingDoctors.map(async (doctorDoc) => {
        await updateDoc(doc(db, "users", doctorDoc.id), {
          isApproved: true,
          updatedAt: new Date(),
        })
      })

      await Promise.all(approvalPromises)

      setMessage({
        type: "success",
        text: `Successfully approved ${pendingDoctors.length} doctor(s)`,
      })
    } catch (error) {
      console.error("Error approving doctors:", error)
      setMessage({ type: "error", text: "Failed to approve doctors" })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Users className="mr-2 h-5 w-5" />
          Quick Actions
        </CardTitle>
        <CardDescription>Administrative tools for managing the platform</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {message && (
          <Alert variant={message.type === "error" ? "destructive" : "default"}>
            <AlertDescription>{message.text}</AlertDescription>
          </Alert>
        )}

        <Button onClick={approveAllPendingDoctors} disabled={loading} className="w-full">
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          <CheckCircle className="mr-2 h-4 w-4" />
          Approve All Pending Doctors
        </Button>

        <p className="text-sm text-muted-foreground">
          This will approve all doctors who are currently pending approval, allowing them to access their dashboards and
          manage appointments.
        </p>
      </CardContent>
    </Card>
  )
}
