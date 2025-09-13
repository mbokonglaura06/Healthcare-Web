export interface Appointment {
  id: string
  patientId: string
  doctorId: string
  patientName: string
  doctorName: string
  doctorSpecialty: string
  date: Date
  time: string
  duration: number // in minutes
  type: "in-person" | "teleconsultation"
  status: "scheduled" | "completed" | "cancelled" | "no-show"
  reason: string
  notes?: string
  createdAt: Date
  updatedAt: Date
}

export interface MedicalRecord {
  id: string
  patientId: string
  doctorId: string
  appointmentId: string
  date: Date
  diagnosis: string
  symptoms: string[]
  treatment: string
  prescription?: Prescription[]
  notes: string
  attachments?: string[]
  createdAt: Date
}

export interface Prescription {
  id: string
  medication: string
  dosage: string
  frequency: string
  duration: string
  instructions: string
}

export interface Doctor {
  id: string
  firstName: string
  lastName: string
  specialty: string
  email: string
  phone: string
  isApproved: boolean
  availability: TimeSlot[]
  rating: number
  reviewCount: number
  bio?: string
  education?: string[]
  experience?: number
}

export interface TimeSlot {
  dayOfWeek: number // 0-6 (Sunday-Saturday)
  startTime: string // "09:00"
  endTime: string // "17:00"
  isAvailable: boolean
}

export interface TeleconsultationSession {
  id: string
  appointmentId: string
  patientId: string
  doctorId: string
  status: "waiting" | "active" | "ended"
  startTime?: Date
  endTime?: Date
  duration?: number // in minutes
  recordingUrl?: string
  chatMessages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatMessage {
  id: string
  sessionId: string
  senderId: string
  senderName: string
  message: string
  timestamp: Date
  type: "text" | "file" | "system"
}

export interface CallQualityMetrics {
  sessionId: string
  audioQuality: number // 1-5 scale
  videoQuality: number // 1-5 scale
  connectionStability: number // 1-5 scale
  overallRating: number // 1-5 scale
  feedback?: string
  reportedAt: Date
}
