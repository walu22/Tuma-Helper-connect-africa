import { test, expect } from '@playwright/test'

test.describe('Homepage', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should display the main navigation', async ({ page }) => {
    await expect(page.getByRole('link', { name: 'LocalServe' })).toBeVisible()
    await expect(page.getByText('Services')).toBeVisible()
    await expect(page.getByText('How It Works')).toBeVisible()
  })

  test('should show hero section', async ({ page }) => {
    await expect(page.getByRole('heading', { name: /professional services/i })).toBeVisible()
    await expect(page.getByText(/find trusted local service providers/i)).toBeVisible()
  })

  test('should display service categories', async ({ page }) => {
    await expect(page.getByText('Service Categories')).toBeVisible()
    
    // Wait for categories to load
    await page.waitForSelector('[data-testid="service-category"]', { timeout: 10000 })
    
    const categories = page.locator('[data-testid="service-category"]')
    await expect(categories).toHaveCountGreaterThan(0)
  })

  test('should be responsive on mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    
    await expect(page.getByRole('link', { name: 'LocalServe' })).toBeVisible()
    await expect(page.getByRole('button', { name: /menu/i })).toBeVisible()
  })

  test('should navigate to services page', async ({ page }) => {
    await page.click('text=Services')
    await expect(page).toHaveURL('/services')
  })

  test('should open sign in dialog', async ({ page }) => {
    await page.click('text=Sign In')
    await expect(page.getByRole('dialog')).toBeVisible()
    await expect(page.getByText('Welcome back')).toBeVisible()
  })
})