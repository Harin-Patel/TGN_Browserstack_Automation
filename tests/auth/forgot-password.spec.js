const { test, expect } = require('@playwright/test');

test('Forgot Password Flow', async ({ page }) => {

await page.goto('https://tgn-staging.staffbot.com/')

// open login
await page.getByRole('link', { name: 'Login or Create Account' }).click()

await page.getByRole('link', { name: 'Sign in here' }).click()

// click forgot password
await page.getByText('Forgot your password? →', { exact: true }).click()

// enter email
await page.getByPlaceholder('Enter your email address').fill('james@mailinator.com')

// submit
await page.getByRole('button', { name: 'Send Reset Link' }).click()

// verify success message
await expect(page.getByText('Password reset email sent!')).toBeVisible()

// back to login
await page.getByRole('link', { name: 'Back to Login' }).click()

})