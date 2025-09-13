// WebRTC utilities for teleconsultation
export class WebRTCService {
  private localStream: MediaStream | null = null
  private remoteStream: MediaStream | null = null
  private peerConnection: RTCPeerConnection | null = null
  private dataChannel: RTCDataChannel | null = null

  // STUN servers for NAT traversal (using free Google STUN servers)
  private configuration: RTCConfiguration = {
    iceServers: [{ urls: "stun:stun.l.google.com:19302" }, { urls: "stun:stun1.l.google.com:19302" }],
  }

  constructor(
    private onRemoteStream: (stream: MediaStream) => void,
    private onDataChannelMessage: (message: string) => void,
    private onConnectionStateChange: (state: RTCPeerConnectionState) => void,
  ) {}

  async initializeLocalStream(video = true, audio = true): Promise<MediaStream> {
    try {
      this.localStream = await navigator.mediaDevices.getUserMedia({
        video: video ? { width: 1280, height: 720 } : false,
        audio: audio,
      })
      return this.localStream
    } catch (error) {
      console.error("Error accessing media devices:", error)
      throw error
    }
  }

  async createPeerConnection(): Promise<RTCPeerConnection> {
    this.peerConnection = new RTCPeerConnection(this.configuration)

    // Handle remote stream
    this.peerConnection.ontrack = (event) => {
      this.remoteStream = event.streams[0]
      this.onRemoteStream(this.remoteStream)
    }

    // Handle connection state changes
    this.peerConnection.onconnectionstatechange = () => {
      if (this.peerConnection) {
        this.onConnectionStateChange(this.peerConnection.connectionState)
      }
    }

    // Add local stream tracks
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => {
        if (this.peerConnection && this.localStream) {
          this.peerConnection.addTrack(track, this.localStream)
        }
      })
    }

    return this.peerConnection
  }

  async createOffer(): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    // Create data channel for chat
    this.dataChannel = this.peerConnection.createDataChannel("chat")
    this.setupDataChannel(this.dataChannel)

    const offer = await this.peerConnection.createOffer()
    await this.peerConnection.setLocalDescription(offer)
    return offer
  }

  async createAnswer(offer: RTCSessionDescriptionInit): Promise<RTCSessionDescriptionInit> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }

    // Handle incoming data channel
    this.peerConnection.ondatachannel = (event) => {
      this.setupDataChannel(event.channel)
    }

    await this.peerConnection.setRemoteDescription(offer)
    const answer = await this.peerConnection.createAnswer()
    await this.peerConnection.setLocalDescription(answer)
    return answer
  }

  async setRemoteAnswer(answer: RTCSessionDescriptionInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }
    await this.peerConnection.setRemoteDescription(answer)
  }

  async addIceCandidate(candidate: RTCIceCandidateInit): Promise<void> {
    if (!this.peerConnection) {
      throw new Error("Peer connection not initialized")
    }
    await this.peerConnection.addIceCandidate(candidate)
  }

  private setupDataChannel(channel: RTCDataChannel): void {
    channel.onopen = () => console.log("Data channel opened")
    channel.onmessage = (event) => this.onDataChannelMessage(event.data)
    channel.onerror = (error) => console.error("Data channel error:", error)
    this.dataChannel = channel
  }

  sendChatMessage(message: string): void {
    if (this.dataChannel && this.dataChannel.readyState === "open") {
      this.dataChannel.send(message)
    }
  }

  toggleVideo(): boolean {
    if (this.localStream) {
      const videoTrack = this.localStream.getVideoTracks()[0]
      if (videoTrack) {
        videoTrack.enabled = !videoTrack.enabled
        return videoTrack.enabled
      }
    }
    return false
  }

  toggleAudio(): boolean {
    if (this.localStream) {
      const audioTrack = this.localStream.getAudioTracks()[0]
      if (audioTrack) {
        audioTrack.enabled = !audioTrack.enabled
        return audioTrack.enabled
      }
    }
    return false
  }

  async shareScreen(): Promise<MediaStream> {
    try {
      const screenStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true,
      })

      // Replace video track with screen share
      if (this.peerConnection && this.localStream) {
        const videoTrack = this.localStream.getVideoTracks()[0]
        const screenTrack = screenStream.getVideoTracks()[0]

        const sender = this.peerConnection.getSenders().find((s) => s.track && s.track.kind === "video")

        if (sender) {
          await sender.replaceTrack(screenTrack)
        }

        // Handle screen share end
        screenTrack.onended = () => {
          if (sender && videoTrack) {
            sender.replaceTrack(videoTrack)
          }
        }
      }

      return screenStream
    } catch (error) {
      console.error("Error sharing screen:", error)
      throw error
    }
  }

  endCall(): void {
    // Close data channel
    if (this.dataChannel) {
      this.dataChannel.close()
      this.dataChannel = null
    }

    // Close peer connection
    if (this.peerConnection) {
      this.peerConnection.close()
      this.peerConnection = null
    }

    // Stop local stream
    if (this.localStream) {
      this.localStream.getTracks().forEach((track) => track.stop())
      this.localStream = null
    }

    // Clear remote stream
    this.remoteStream = null
  }

  getLocalStream(): MediaStream | null {
    return this.localStream
  }

  getRemoteStream(): MediaStream | null {
    return this.remoteStream
  }
}
