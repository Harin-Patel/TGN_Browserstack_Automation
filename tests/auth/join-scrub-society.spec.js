const { test, expect } = require('@playwright/test');
const { RegisterPage } = require('../../pages/register.page');

test('Join The Scrub Society — top nav opens registration', async ({ page }) => {

const registerPage = new RegisterPage(page)

await registerPage.openViaTopNavJoinTheScrubSociety()

await expect(page).toHaveURL(/register/i)

await expect(page.getByRole('heading', { name: 'Join The Scrub Society' })).toBeVisible()

await expect(page.getByText('Start your travel nursing adventure today')).toBeVisible()

await expect(page.getByRole('textbox', { name: 'First Name *' })).toBeVisible()
await expect(page.getByRole('textbox', { name: 'Last Name *' })).toBeVisible()
await expect(page.getByRole('textbox', { name: 'Mobile Number *' })).toBeVisible()
await expect(page.getByRole('textbox', { name: 'Email *' })).toBeVisible()
await expect(page.locator('#password')).toBeVisible()
await expect(page.locator('#confirmPassword')).toBeVisible()

await expect(page.getByRole('checkbox', { name: /Privacy Policy and User Agreement/ })).toBeVisible()

await expect(page.getByRole('button', { name: 'Register' })).toBeVisible()

})

test('Join The Scrub Society — register new user and reach onboarding', async ({ page }) => {

test.setTimeout(120000)

const registerPage = new RegisterPage(page)

const uniqueSuffix = `${Date.now()}`
const testUser = {
firstName: 'E2E',
lastName: `Automation${uniqueSuffix.slice(-6)}`,
mobileNumber: `555${uniqueSuffix.slice(-7)}`,
email: `tgn.e2e.${uniqueSuffix}@mailinator.com`,
password: process.env.TGN_TEST_PASSWORD || 'Harin123',
}

await registerPage.openViaTopNavJoinTheScrubSociety()

await registerPage.submitNewUserRegistration(testUser)

await expect(page).toHaveURL(/\/onboarding/i)

await expect(page.getByRole('heading', { name: 'Personal Information' }).first()).toBeVisible()

await expect(page.getByText(/Let's start with your personal information/i).first()).toBeVisible()

})
