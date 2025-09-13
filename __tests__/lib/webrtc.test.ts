import { WebRTCService } from "@/lib/webrtc"
import jest from "jest"

describe("WebRTCService", () => {
  let webrtcService: WebRTCService
  let mockOnRemoteStream: jest.Mock
  let mockOnDataChannelMessage: jest.Mock
  let mockOnConnectionStateChange: jest.Mock

  beforeEach(() => {
    mockOnRemoteStream = jest.fn()
    mockOnDataChannelMessage = jest.fn()
    mockOnConnectionStateChange = jest.fn()

    webrtcService = new WebRTCService(mockOnRemoteStream, mockOnDataChannelMessage, mockOnConnectionStateChange)
  })

  afterEach(() => {
    webrtcService.endCall()
  })

  it("initializes local stream", async () => {
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([]),
    }
    ;(navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream)

    const stream = await webrtcService.initializeLocalStream()

    expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
      video: { width: 1280, height: 720 },
      audio: true,
    })
    expect(stream).toBe(mockStream)
  })

  it("creates peer connection", async () => {
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([{ kind: "video" }, { kind: "audio" }]),
    }
    ;(navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream)

    await webrtcService.initializeLocalStream()
    const peerConnection = await webrtcService.createPeerConnection()

    expect(peerConnection).toBeInstanceOf(RTCPeerConnection)
  })

  it("toggles video track", async () => {
    const mockVideoTrack = { enabled: true }
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([mockVideoTrack]),
      getVideoTracks: jest.fn().mockReturnValue([mockVideoTrack]),
    }
    ;(navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream)

    await webrtcService.initializeLocalStream()

    const result = webrtcService.toggleVideo()

    expect(mockVideoTrack.enabled).toBe(false)
    expect(result).toBe(false)
  })

  it("sends chat message through data channel", () => {
    const mockDataChannel = {
      readyState: "open",
      send: jest.fn(),
    }

    // Simulate data channel setup
    webrtcService["dataChannel"] = mockDataChannel as any

    webrtcService.sendChatMessage("Hello, World!")

    expect(mockDataChannel.send).toHaveBeenCalledWith("Hello, World!")
  })

  it("ends call and cleans up resources", async () => {
    const mockTrack = { stop: jest.fn() }
    const mockStream = {
      getTracks: jest.fn().mockReturnValue([mockTrack]),
      getVideoTracks: jest.fn().mockReturnValue([mockTrack]),
    }
    ;(navigator.mediaDevices.getUserMedia as jest.Mock).mockResolvedValue(mockStream)

    await webrtcService.initializeLocalStream()
    webrtcService.endCall()

    expect(mockTrack.stop).toHaveBeenCalled()
  })
})
