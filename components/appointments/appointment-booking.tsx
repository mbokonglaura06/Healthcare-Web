"use client"

import { useState, useEffect } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Calendar } from "@/components/ui/calendar"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { collection, query, where, getDocs, addDoc, Timestamp } from "firebase/firestore"
import { db } from "@/lib/firebase"
import type { Doctor } from "@/lib/types"
import { CalendarIcon, Clock, Video, MapPin, Loader2 } from "lucide-react"

export function AppointmentBooking() {
  const { userProfile } = useAuth()
  const [doctors, setDoctors] = useState<Doctor[]>([])
  const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState("")
  const [appointmentType, setAppointmentType] = useState<"in-person" | "teleconsultation">("in-person")
  const [reason, setReason] = useState("")
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const doctorsRef = collection(db, "users")
        const q = query(doctorsRef, where("role", "==", "doctor"), where("isApproved", "==", true))

        const querySnapshot = await getDocs(q)
        const doctorsList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          availability: doc.data().availability || [],
          rating: doc.data().rating || 4.5,
          reviewCount: doc.data().reviewCount || 0,
        })) as Doctor[]

        setDoctors(doctorsList)
      } catch (error) {
        console.error("Error fetching doctors:", error)
      }
    }

    fetchDoctors()
  }, [])

  const getAvailableTimeSlots = () => {
    if (!selectedDoctor || !selectedDate) return []

    // This is a simplified version - in a real app, you'd check actual availability
    const timeSlots = [
      "09:00",
      "09:30",
      "10:00",
      "10:30",
      "11:00",
      "11:30",
      "14:00",
      "14:30",
      "15:00",
      "15:30",
      "16:00",
      "16:30",
    ]

    return timeSlots
  }

  const handleBookAppointment = async () => {
    if (!userProfile || !selectedDoctor || !selectedDate || !selectedTime || !reason.trim()) {
      setError("Please fill in all required fields")
      return
    }

    setLoading(true)
    setError("")

    try {
      console.log("[v0] Booking appointment with data:", {
        patientId: userProfile.uid,
        doctorId: selectedDoctor.id,
        patientName: `${userProfile.firstName} ${userProfile.lastName}`,
        doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        date: selectedDate,
        time: selectedTime,
        type: appointmentType,
        reason: reason.trim(),
      })

      const appointmentData = {
        patientId: userProfile.uid,
        doctorId: selectedDoctor.id,
        patientName: `${userProfile.firstName} ${userProfile.lastName}`,
        doctorName: `${selectedDoctor.firstName} ${selectedDoctor.lastName}`,
        doctorSpecialty: selectedDoctor.specialty,
        date: Timestamp.fromDate(selectedDate),
        time: selectedTime,
        duration: 30,
        type: appointmentType,
        status: "scheduled",
        reason: reason.trim(),
        createdAt: Timestamp.fromDate(new Date()),
        updatedAt: Timestamp.fromDate(new Date()),
      }

      const docRef = await addDoc(collection(db, "appointments"), appointmentData)
      console.log("[v0] Appointment created successfully with ID:", docRef.id)

      setSuccess(true)

      // Reset form
      setSelectedDoctor(null)
      setSelectedDate(undefined)
      setSelectedTime("")
      setReason("")
    } catch (error) {
      console.error("[v0] Error booking appointment:", error)
      setError("Failed to book appointment. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <Card className="max-w-2xl mx-auto">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
            <CalendarIcon className="h-6 w-6 text-primary" />
          </div>
          <CardTitle className="text-2xl text-primary">Appointment Booked!</CardTitle>
          <CardDescription>Your appointment has been successfully scheduled</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-muted-foreground mb-6">
            You will receive a confirmation email shortly. The doctor will review your request and confirm the
            appointment.
          </p>
          <Button onClick={() => setSuccess(false)}>Book Another Appointment</Button>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Book an Appointment</h1>
        <p className="text-muted-foreground mt-2">Schedule a consultation with our healthcare professionals</p>
      </div>

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Doctor Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Select a Doctor</CardTitle>
            <CardDescription>Choose from our available healthcare professionals</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {doctors.map((doctor) => (
              <div
                key={doctor.id}
                className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                  selectedDoctor?.id === doctor.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-primary/50"
                }`}
                onClick={() => setSelectedDoctor(doctor)}
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-semibold text-foreground">
                      Dr. {doctor.firstName} {doctor.lastName}
                    </h4>
                    <p className="text-sm text-muted-foreground">{doctor.specialty}</p>
                    <div className="flex items-center mt-2">
                      <Badge variant="secondary" className="text-xs">
                        ⭐ {doctor.rating} ({doctor.reviewCount} reviews)
                      </Badge>
                    </div>
                  </div>
                </div>
                {doctor.bio && <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{doctor.bio}</p>}
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Appointment Details */}
        <Card>
          <CardHeader>
            <CardTitle>Appointment Details</CardTitle>
            <CardDescription>Select your preferred date, time, and type</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Appointment Type */}
            <div className="space-y-2">
              <Label>Appointment Type</Label>
              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant={appointmentType === "in-person" ? "default" : "outline"}
                  onClick={() => setAppointmentType("in-person")}
                  className="justify-start"
                >
                  <MapPin className="mr-2 h-4 w-4" />
                  In-Person
                </Button>
                <Button
                  variant={appointmentType === "teleconsultation" ? "default" : "outline"}
                  onClick={() => setAppointmentType("teleconsultation")}
                  className="justify-start"
                >
                  <Video className="mr-2 h-4 w-4" />
                  Video Call
                </Button>
              </div>
            </div>

            {/* Date Selection */}
            <div className="space-y-2">
              <Label>Select Date</Label>
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                disabled={(date) => date < new Date() || date.getDay() === 0} // Disable past dates and Sundays
                className="rounded-md border"
              />
            </div>

            {/* Time Selection */}
            {selectedDate && (
              <div className="space-y-2">
                <Label>Available Times</Label>
                <div className="grid grid-cols-3 gap-2">
                  {getAvailableTimeSlots().map((time) => (
                    <Button
                      key={time}
                      variant={selectedTime === time ? "default" : "outline"}
                      size="sm"
                      onClick={() => setSelectedTime(time)}
                    >
                      <Clock className="mr-1 h-3 w-3" />
                      {time}
                    </Button>
                  ))}
                </div>
              </div>
            )}

            {/* Reason for Visit */}
            <div className="space-y-2">
              <Label htmlFor="reason">Reason for Visit</Label>
              <Textarea
                id="reason"
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="Please describe your symptoms or reason for the appointment..."
                rows={3}
              />
            </div>

            {/* Book Button */}
            <Button
              onClick={handleBookAppointment}
              disabled={!selectedDoctor || !selectedDate || !selectedTime || !reason.trim() || loading}
              className="w-full"
            >
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Book Appointment
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
