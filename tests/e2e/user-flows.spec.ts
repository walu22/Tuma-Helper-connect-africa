import { test, expect } from '@playwright/test'

test.describe('User Flows', () => {
  test('complete service discovery flow', async ({ page }) => {
    // Start on homepage
    await page.goto('/')
    
    // Navigate to services
    await page.click('text=Services')
    await expect(page).toHaveURL('/services')
    
    // Search for a service
    await page.fill('input[placeholder*="Search"]', 'plumbing')
    await page.keyboard.press('Enter')
    
    // Wait for results
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 10000 })
    
    // Click on first service
    const firstService = page.locator('[data-testid="service-card"]').first()
    await firstService.click()
    
    // Should navigate to service detail
    await expect(page.url()).toContain('/service/')
  })

  test('provider signup flow', async ({ page }) => {
    await page.goto('/become-provider')
    
    // Check provider signup page loads
    await expect(page.getByText('Become a Service Provider')).toBeVisible()
    
    // Fill out the form
    await page.fill('input[name="businessName"]', 'Test Plumbing Co')
    await page.fill('input[name="description"]', 'Professional plumbing services')
    await page.fill('input[name="experience"]', '5')
    
    // Select service category
    await page.selectOption('select[name="category"]', 'plumbing')
    
    // Submit form (would normally require auth)
    const submitButton = page.getByRole('button', { name: /submit/i })
    await expect(submitButton).toBeVisible()
  })

  test('booking flow (requires auth)', async ({ page }) => {
    await page.goto('/services')
    
    // Try to book a service
    await page.waitForSelector('[data-testid="service-card"]', { timeout: 10000 })
    const firstService = page.locator('[data-testid="service-card"]').first()
    await firstService.click()
    
    // Click book now
    const bookButton = page.getByRole('button', { name: /book now/i })
    if (await bookButton.isVisible()) {
      await bookButton.click()
      
      // Should redirect to auth or booking form
      await expect(page.getByText(/sign in|book service/i)).toBeVisible()
    }
  })

  test('navigation accessibility', async ({ page }) => {
    await page.goto('/')
    
    // Test keyboard navigation
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Test screen reader elements
    const heading = page.getByRole('heading', { level: 1 })
    await expect(heading).toBeVisible()
    
    // Check for alt text on images
    const images = page.locator('img')
    const imageCount = await images.count()
    
    for (let i = 0; i < imageCount; i++) {
      const img = images.nth(i)
      if (await img.isVisible()) {
        await expect(img).toHaveAttribute('alt')
      }
    }
  })
})