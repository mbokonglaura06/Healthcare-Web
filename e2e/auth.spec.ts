import { test, expect } from "@playwright/test"

test.describe("Authentication Flow", () => {
  test("should display login page", async ({ page }) => {
    await page.goto("/login")

    await expect(page.getByRole("heading", { name: /welcome back/i })).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByLabel(/password/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /sign in/i })).toBeVisible()
  })

  test("should display registration page", async ({ page }) => {
    await page.goto("/register")

    await expect(page.getByRole("heading", { name: /create account/i })).toBeVisible()
    await expect(page.getByLabel(/first name/i)).toBeVisible()
    await expect(page.getByLabel(/last name/i)).toBeVisible()
    await expect(page.getByLabel(/email/i)).toBeVisible()
    await expect(page.getByRole("button", { name: /create account/i })).toBeVisible()
  })

  test("should validate required fields on login", async ({ page }) => {
    await page.goto("/login")

    await page.getByRole("button", { name: /sign in/i }).click()

    // Check for HTML5 validation or custom error messages
    const emailInput = page.getByLabel(/email/i)
    await expect(emailInput).toHaveAttribute("required")
  })

  test("should navigate between login and register", async ({ page }) => {
    await page.goto("/")

    // Navigate to login
    await page.getByRole("link", { name: /sign in/i }).click()
    await expect(page).toHaveURL("/login")

    // Navigate to register
    await page.goto("/")
    await page.getByRole("link", { name: /get started/i }).click()
    await expect(page).toHaveURL("/register")
  })
})
