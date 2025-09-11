"use client"

import { useState, useEffect, useRef } from "react"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { WebRTCService } from "@/lib/webrtc"
import { Video, VideoOff, Mic, MicOff, PhoneOff, Monitor, MessageSquare, Users } from "lucide-react"

interface ChatMessage {
  id: string
  sender: string
  message: string
  timestamp: Date
}

interface VideoCallProps {
  appointmentId: string
  isDoctor: boolean
  patientName?: string
  doctorName?: string
  onCallEnd: () => void
}

export function VideoCall({ appointmentId, isDoctor, patientName, doctorName, onCallEnd }: VideoCallProps) {
  const { userProfile } = useAuth()
  const [webrtcService, setWebrtcService] = useState<WebRTCService | null>(null)
  const [connectionState, setConnectionState] = useState<RTCPeerConnectionState>("new")
  const [isVideoEnabled, setIsVideoEnabled] = useState(true)
  const [isAudioEnabled, setIsAudioEnabled] = useState(true)
  const [isScreenSharing, setIsScreenSharing] = useState(false)
  const [showChat, setShowChat] = useState(false)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [callDuration, setCallDuration] = useState(0)

  const localVideoRef = useRef<HTMLVideoElement>(null)
  const remoteVideoRef = useRef<HTMLVideoElement>(null)
  const callStartTime = useRef<Date>(new Date())

  useEffect(() => {
    // Initialize WebRTC service
    const service = new WebRTCService(
      (remoteStream) => {
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = remoteStream
        }
      },
      (message) => {
        const chatMessage: ChatMessage = {
          id: Date.now().toString(),
          sender: isDoctor ? patientName || "Patient" : doctorName || "Doctor",
          message,
          timestamp: new Date(),
        }
        setChatMessages((prev) => [...prev, chatMessage])
      },
      (state) => {
        setConnectionState(state)
      },
    )

    setWebrtcService(service)

    // Initialize local stream
    const initializeCall = async () => {
      try {
        const localStream = await service.initializeLocalStream()
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = localStream
        }

        await service.createPeerConnection()

        // In a real implementation, you would use a signaling server
        // For demo purposes, we'll simulate the connection
        if (isDoctor) {
          // Doctor creates offer
          const offer = await service.createOffer()
          console.log("Created offer:", offer)
          // Send offer to patient via signaling server
        }
      } catch (error) {
        console.error("Error initializing call:", error)
      }
    }

    initializeCall()

    return () => {
      service.endCall()
    }
  }, [isDoctor, patientName, doctorName])

  // Call duration timer
  useEffect(() => {
    const timer = setInterval(() => {
      setCallDuration(Math.floor((Date.now() - callStartTime.current.getTime()) / 1000))
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  const toggleVideo = () => {
    if (webrtcService) {
      const enabled = webrtcService.toggleVideo()
      setIsVideoEnabled(enabled)
    }
  }

  const toggleAudio = () => {
    if (webrtcService) {
      const enabled = webrtcService.toggleAudio()
      setIsAudioEnabled(enabled)
    }
  }

  const startScreenShare = async () => {
    if (webrtcService) {
      try {
        await webrtcService.shareScreen()
        setIsScreenSharing(true)
      } catch (error) {
        console.error("Error starting screen share:", error)
      }
    }
  }

  const sendChatMessage = () => {
    if (webrtcService && newMessage.trim()) {
      webrtcService.sendChatMessage(newMessage)

      const chatMessage: ChatMessage = {
        id: Date.now().toString(),
        sender: userProfile?.firstName || "You",
        message: newMessage,
        timestamp: new Date(),
      }
      setChatMessages((prev) => [...prev, chatMessage])
      setNewMessage("")
    }
  }

  const endCall = () => {
    if (webrtcService) {
      webrtcService.endCall()
    }
    onCallEnd()
  }

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  const getConnectionStatusColor = () => {
    switch (connectionState) {
      case "connected":
        return "bg-green-500"
      case "connecting":
        return "bg-yellow-500"
      case "disconnected":
      case "failed":
        return "bg-red-500"
      default:
        return "bg-gray-500"
    }
  }

  return (
    <div className="h-screen bg-background flex flex-col">
      {/* Header */}
      <div className="bg-card border-b border-border p-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <div className={`w-3 h-3 rounded-full ${getConnectionStatusColor()}`}></div>
            <span className="text-sm font-medium">
              {connectionState === "connected" ? "Connected" : "Connecting..."}
            </span>
          </div>
          <Badge variant="secondary">{formatDuration(callDuration)}</Badge>
        </div>

        <div className="flex items-center space-x-2">
          <span className="text-sm text-muted-foreground">
            {isDoctor ? `with ${patientName}` : `with Dr. ${doctorName}`}
          </span>
          <Users className="h-4 w-4 text-muted-foreground" />
        </div>
      </div>

      {/* Video Area */}
      <div className="flex-1 flex">
        {/* Main Video Area */}
        <div className="flex-1 relative bg-black">
          {/* Remote Video */}
          <video ref={remoteVideoRef} autoPlay playsInline className="w-full h-full object-cover" />

          {/* Local Video (Picture-in-Picture) */}
          <div className="absolute top-4 right-4 w-48 h-36 bg-gray-900 rounded-lg overflow-hidden border-2 border-white">
            <video ref={localVideoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            {!isVideoEnabled && (
              <div className="absolute inset-0 bg-gray-800 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-white" />
              </div>
            )}
          </div>

          {/* Connection Status Overlay */}
          {connectionState !== "connected" && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <div className="text-center text-white">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"></div>
                <p className="text-lg">
                  {connectionState === "connecting" ? "Connecting..." : "Waiting for connection..."}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Chat Sidebar */}
        {showChat && (
          <div className="w-80 bg-card border-l border-border flex flex-col">
            <div className="p-4 border-b border-border">
              <h3 className="font-semibold flex items-center">
                <MessageSquare className="mr-2 h-4 w-4" />
                Chat
              </h3>
            </div>

            <div className="flex-1 p-4 overflow-y-auto space-y-3">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg max-w-[80%] ${
                    msg.sender === (userProfile?.firstName || "You")
                      ? "bg-primary text-primary-foreground ml-auto"
                      : "bg-muted"
                  }`}
                >
                  <p className="text-sm">{msg.message}</p>
                  <p className="text-xs opacity-70 mt-1">{msg.timestamp.toLocaleTimeString()}</p>
                </div>
              ))}
            </div>

            <div className="p-4 border-t border-border">
              <div className="flex space-x-2">
                <Input
                  value={newMessage}
                  onChange={(e) => setNewMessage(e.target.value)}
                  placeholder="Type a message..."
                  onKeyPress={(e) => e.key === "Enter" && sendChatMessage()}
                />
                <Button onClick={sendChatMessage} size="sm">
                  Send
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Controls */}
      <div className="bg-card border-t border-border p-4">
        <div className="flex items-center justify-center space-x-4">
          {/* Audio Toggle */}
          <Button
            variant={isAudioEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleAudio}
            className="rounded-full w-12 h-12"
          >
            {isAudioEnabled ? <Mic className="h-5 w-5" /> : <MicOff className="h-5 w-5" />}
          </Button>

          {/* Video Toggle */}
          <Button
            variant={isVideoEnabled ? "default" : "destructive"}
            size="lg"
            onClick={toggleVideo}
            className="rounded-full w-12 h-12"
          >
            {isVideoEnabled ? <Video className="h-5 w-5" /> : <VideoOff className="h-5 w-5" />}
          </Button>

          {/* Screen Share */}
          <Button
            variant={isScreenSharing ? "secondary" : "outline"}
            size="lg"
            onClick={startScreenShare}
            className="rounded-full w-12 h-12"
          >
            <Monitor className="h-5 w-5" />
          </Button>

          {/* Chat Toggle */}
          <Button
            variant={showChat ? "secondary" : "outline"}
            size="lg"
            onClick={() => setShowChat(!showChat)}
            className="rounded-full w-12 h-12"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          {/* End Call */}
          <Button variant="destructive" size="lg" onClick={endCall} className="rounded-full w-12 h-12">
            <PhoneOff className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  )
}
