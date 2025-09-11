"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Video, VideoOff, Mic, MicOff, Clock, User } from "lucide-react"

interface WaitingRoomProps {
  appointmentId: string
  doctorName: string
  appointmentTime: string
  onJoinCall: () => void
  onLeaveWaitingRoom: () => void
}

export function WaitingRoom({
  appointmentId,
  doctorName,
  appointmentTime,
  onJoinCall,
  onLeaveWaitingRoom,
}: WaitingRoomProps) {
  const { userProfile } = useAuth()
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [deviceError, setDeviceError] = useState("")
  const [waitingTime, setWaitingTime] = useState(0)
  const [doctorStatus, setDoctorStatus] = useState<"offline" | "busy" | "available">("offline")

  const videoRef = useRef<HTMLVideoElement>(null)
  const waitingStartTime = useRef<Date>(new Date())

  useEffect(() => {
    // Initialize media devices
    const initializeDevices = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        })

        setLocalStream(stream)
        if (videoRef.current) {
          videoRef.current.srcObject = stream
        }
      } catch (error) {
        console.error("Error accessing media devices:", error)
        setDeviceError("Unable to access camera or microphone. Please check your permissions.")
      }
    }

    initializeDevices()

    // Simulate doctor status updates
    const statusTimer = setInterval(() => {
      const statuses: ("offline" | "busy" | "available")[] = ["offline", "busy", "available"]
      setDoctorStatus(statuses[Math.floor(Math.random() * statuses.length)])
    }, 5000)

    // Waiting time timer
    const waitingTimer = setInterval(() => {
      setWaitingTime(Math.floor((Date.now() - waitingStartTime.current.getTime()) / 1000))
    }, 1000)

    return () => {
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      clearInterval(statusTimer)
      clearInterval(waitingTimer)
    }
  }, [])

  const toggleVideo = () => {
    if (localStream) {
      const videoTrack = localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        setIsVideoEnabled(videoTrack.enabled)
      }
    }
  }

  const toggleAudio = () => {
    if (localStream) {
      const audioTrack = localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        setIsAudioEnabled(audioTrack.enabled)
      }
    }
  }

  const formatWaitingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins}:${secs.toString().padStart(2, "0")}`
  }

  const getDoctorStatusColor = () => {
    switch (doctorStatus) {
      case "available":
        return "bg-green-500"
      case "busy":
        return "bg-yellow-500"
      case "offline":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  const getDoctorStatusText = () => {
    switch (doctorStatus) {
      case "available":
        return "Available"
      case "busy":
        return "In another call"
      case "offline":
        return "Offline"
      default:
        return "Unknown"
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-3xl font-bold text-foreground">Waiting Room</h1>
          <p className="text-muted-foreground mt-2">Preparing for your teleconsultation with Dr. {doctorName}</p>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="ml-2 text-sm font-medium">Waiting Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{formatWaitingTime(waitingTime)}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <User className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="ml-2 text-sm font-medium">Doctor Status</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <div className={`w-3 h-3 rounded-full ${getDoctorStatusColor()}`}></div>
                <span className="text-sm font-medium">{getDoctorStatusText()}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <Clock className="h-4 w-4 text-muted-foreground" />
              <CardTitle className="ml-2 text-sm font-medium">Appointment</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm font-medium">{appointmentTime}</div>
            </CardContent>
          </Card>
        </div>

        {/* Device Error Alert */}
        {deviceError && (
          <Alert variant="destructive">
            <AlertDescription>{deviceError}</AlertDescription>
          </Alert>
        )}

        {/* Video Preview and Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Video Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Camera Preview</CardTitle>
              <CardDescription>Check your camera and audio before joining</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-black rounded-lg overflow-hidden aspect-video">
                <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
                {!isVideoEnabled && (
                  <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                    <VideoOff className="h-12 w-12 text-white" />
                  </div>
                )}

                {/* Controls Overlay */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2">
                  <Button
                    variant={isVideoEnabled ? "default" : "destructive"}
                    size="sm"
                    onClick={toggleVideo}
                    className="rounded-full"
                  >
                    {isVideoEnabled ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
                  </Button>
                  <Button
                    variant={isAudioEnabled ? "default" : "destructive"}
                    size="sm"
                    onClick={toggleAudio}
                    className="rounded-full"
                  >
                    {isAudioEnabled ? <Mic className="h-4 w-4" /> : <MicOff className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Instructions and Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Before You Join</CardTitle>
              <CardDescription>Please review these important points</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Ensure good lighting</p>
                    <p className="text-xs text-muted-foreground">Position yourself facing a light source</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Check your internet connection</p>
                    <p className="text-xs text-muted-foreground">Stable connection ensures better call quality</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Find a quiet space</p>
                    <p className="text-xs text-muted-foreground">Minimize background noise for clear communication</p>
                  </div>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-2 h-2 bg-primary rounded-full mt-2"></div>
                  <div>
                    <p className="text-sm font-medium">Have your medical information ready</p>
                    <p className="text-xs text-muted-foreground">Previous reports, medications, symptoms list</p>
                  </div>
                </div>
              </div>

              <div className="pt-4 space-y-3">
                <Button
                  onClick={onJoinCall}
                  disabled={!localStream || doctorStatus !== "available"}
                  className="w-full"
                  size="lg"
                >
                  {doctorStatus === "available" ? "Join Consultation" : "Waiting for Doctor..."}
                </Button>

                <Button variant="outline" onClick={onLeaveWaitingRoom} className="w-full bg-transparent">
                  Leave Waiting Room
                </Button>
              </div>

              {doctorStatus !== "available" && (
                <Alert>
                  <AlertDescription>
                    Dr. {doctorName} is currently {doctorStatus === "busy" ? "in another consultation" : "offline"}.
                    Please wait, you'll be notified when they're available.
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
