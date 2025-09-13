import { render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { LoginForm } from "@/components/auth/login-form"
import jest from "jest" // Import jest to declare the variable

// Mock the auth context
const mockSignIn = jest.fn()
jest.mock("@/lib/auth-context", () => ({
  ...jest.requireActual("@/lib/auth-context"),
  useAuth: () => ({
    signIn: mockSignIn,
    user: null,
    userProfile: null,
    loading: false,
  }),
}))

describe("LoginForm", () => {
  beforeEach(() => {
    mockSignIn.mockClear()
  })

  it("renders login form fields", () => {
    render(<LoginForm />)

    expect(screen.getByLabelText(/email/i)).toBeInTheDocument()
    expect(screen.getByLabelText(/password/i)).toBeInTheDocument()
    expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument()
  })

  it("validates required fields", async () => {
    const user = userEvent.setup()
    render(<LoginForm />)

    const submitButton = screen.getByRole("button", { name: /sign in/i })
    await user.click(submitButton)

    // Form should not submit without required fields
    expect(mockSignIn).not.toHaveBeenCalled()
  })

  it("submits form with valid data", async () => {
    const user = userEvent.setup()
    mockSignIn.mockResolvedValue(undefined)

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "password123")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(mockSignIn).toHaveBeenCalledWith("test@example.com", "password123")
    })
  })

  it("displays error message on failed login", async () => {
    const user = userEvent.setup()
    mockSignIn.mockRejectedValue(new Error("Invalid credentials"))

    render(<LoginForm />)

    await user.type(screen.getByLabelText(/email/i), "test@example.com")
    await user.type(screen.getByLabelText(/password/i), "wrongpassword")
    await user.click(screen.getByRole("button", { name: /sign in/i }))

    await waitFor(() => {
      expect(screen.getByText(/invalid credentials/i)).toBeInTheDocument()
    })
  })
})
