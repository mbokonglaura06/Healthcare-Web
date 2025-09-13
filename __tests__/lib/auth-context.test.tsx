"use client"

import { render, screen, waitFor } from "@testing-library/react"
import { AuthProvider, useAuth } from "@/lib/auth-context"
import jest from "jest" // Import jest to declare it

// Mock Firebase auth
jest.mock("firebase/auth", () => ({
  onAuthStateChanged: jest.fn((auth, callback) => {
    // Simulate user login
    setTimeout(() => callback({ uid: "test-uid", email: "test@example.com" }), 100)
    return jest.fn() // unsubscribe function
  }),
  signInWithEmailAndPassword: jest.fn(),
  createUserWithEmailAndPassword: jest.fn(),
  signOut: jest.fn(),
}))

// Mock Firestore
jest.mock("firebase/firestore", () => ({
  doc: jest.fn(),
  getDoc: jest.fn().mockResolvedValue({
    exists: () => true,
    data: () => ({
      uid: "test-uid",
      email: "test@example.com",
      role: "patient",
      firstName: "John",
      lastName: "Doe",
      isApproved: true,
      createdAt: new Date(),
    }),
  }),
  setDoc: jest.fn(),
}))

// Test component that uses auth context
function TestComponent() {
  const { user, userProfile, loading } = useAuth()

  if (loading) return <div>Loading...</div>
  if (!user) return <div>Not authenticated</div>

  return (
    <div>
      <div data-testid="user-email">{user.email}</div>
      <div data-testid="user-name">
        {userProfile?.firstName} {userProfile?.lastName}
      </div>
      <div data-testid="user-role">{userProfile?.role}</div>
    </div>
  )
}

describe("AuthContext", () => {
  it("provides authentication state to children", async () => {
    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>,
    )

    // Initially loading
    expect(screen.getByText("Loading...")).toBeInTheDocument()

    // Wait for auth state to load
    await waitFor(() => {
      expect(screen.getByTestId("user-email")).toHaveTextContent("test@example.com")
    })

    expect(screen.getByTestId("user-name")).toHaveTextContent("John Doe")
    expect(screen.getByTestId("user-role")).toHaveTextContent("patient")
  })

  it("throws error when used outside provider", () => {
    // Suppress console.error for this test
    const consoleSpy = jest.spyOn(console, "error").mockImplementation(() => {})

    expect(() => {
      render(<TestComponent />)
    }).toThrow("useAuth must be used within an AuthProvider")

    consoleSpy.mockRestore()
  })
})
