import { test, expect } from "@playwright/test"

test.describe("Navigation", () => {
  test("should display homepage correctly", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByRole("heading", { name: /modern healthcare at your fingertips/i })).toBeVisible()
    await expect(page.getByText(/healthconnect/i)).toBeVisible()
    await expect(page.getByRole("link", { name: /book appointment/i })).toBeVisible()
    await expect(page.getByRole("link", { name: /join as doctor/i })).toBeVisible()
  })

  test("should display features section", async ({ page }) => {
    await page.goto("/")

    await expect(page.getByText(/easy scheduling/i)).toBeVisible()
    await expect(page.getByText(/teleconsultation/i)).toBeVisible()
    await expect(page.getByText(/secure & private/i)).toBeVisible()
    await expect(page.getByText(/expert doctors/i)).toBeVisible()
  })

  test("should be responsive on mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    await expect(page.getByRole("heading", { name: /modern healthcare/i })).toBeVisible()
    await expect(page.getByText(/healthconnect/i)).toBeVisible()
  })

  test("should redirect unauthorized users", async ({ page }) => {
    // Try to access protected route without authentication
    await page.goto("/dashboard")

    // Should redirect to login
    await expect(page).toHaveURL("/login")
  })
})
