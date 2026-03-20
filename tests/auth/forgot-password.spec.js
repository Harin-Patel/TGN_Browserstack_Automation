const { test, expect } = require('@playwright/test');

test('Forgot Password Flow', async ({ page }) => {

test.setTimeout(120000)

await page.goto('/')

await page.getByRole('link', { name: 'Login or Create Account' }).click()

const goToLogin = page.getByRole('link', { name: 'Go to login' })
await goToLogin.waitFor({ state: 'visible', timeout: 90000 })
await goToLogin.click()

await page.waitForURL(/\/login/i, { timeout: 90000 })

await page.getByText(/Forgot your password/i).click()

await page.getByPlaceholder('Enter your email address').fill('james@mailinator.com')

await page.getByRole('button', { name: 'Send Reset Link' }).click()

await expect(page.getByText('Password reset email sent!')).toBeVisible({ timeout: 60000 })

await page.getByRole('link', { name: 'Back to Login' }).click()

})