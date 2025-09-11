import jest from "jest"
import "@testing-library/jest-dom"

// Mock Firebase
jest.mock("./lib/firebase", () => ({
  auth: {},
  db: {},
  storage: {},
}))

// Mock Next.js router
jest.mock("next/navigation", () => ({
  useRouter: () => ({
    push: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
  usePathname: () => "/test-path",
}))

// Mock WebRTC APIs
Object.defineProperty(window, "RTCPeerConnection", {
  writable: true,
  value: jest.fn().mockImplementation(() => ({
    createOffer: jest.fn(),
    createAnswer: jest.fn(),
    setLocalDescription: jest.fn(),
    setRemoteDescription: jest.fn(),
    addIceCandidate: jest.fn(),
    close: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
  })),
})

Object.defineProperty(navigator, "mediaDevices", {
  writable: true,
  value: {
    getUserMedia: jest.fn().mockResolvedValue({
      getTracks: () => [],
    }),
    getDisplayMedia: jest.fn().mockResolvedValue({
      getTracks: () => [],
    }),
  },
})
