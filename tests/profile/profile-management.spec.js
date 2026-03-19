const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');
const { ProfilePage } = require('../../pages/profile.page');

test.describe('Profile management', () => {

test.beforeEach(async ({ page }) => {
test.setTimeout(120000)
})

test('Logged-in user can open profile and see core layout', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await expect(page).toHaveURL(/\/profile/i)

await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible()

await expect(page.getByText('Email:', { exact: false })).toBeVisible()

await expect(page.getByText(email, { exact: true })).toBeVisible()

await expect(page.getByRole('button', { name: 'Professional Licenses' }).first()).toBeVisible()

const addLicense = page.getByRole('button', { name: '+ Add License' })

await addLicense.scrollIntoViewIfNeeded()

await expect(addLicense).toBeVisible()

})

test('Edit Profile opens personal information form and Cancel closes it', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openEditProfile()

await expect(page.getByRole('heading', { name: 'Edit Profile Information' })).toBeVisible()

await expect(page.getByPlaceholder('Enter first name')).toBeVisible()
await expect(page.getByPlaceholder('Enter last name')).toBeVisible()

await expect(page.getByRole('button', { name: 'Update' })).toBeVisible()
await expect(page.getByRole('button', { name: 'Cancel' })).toBeVisible()

await profilePage.cancelEditProfile()

await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible()
await expect(page.getByRole('button', { name: 'Update' })).toHaveCount(0)

})

test('Edit Profile Information modal shows required sections and inputs', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openEditProfile()

await expect(page.getByRole('heading', { name: 'Edit Profile Information' })).toBeVisible()

await expect(page.getByText('First Name *', { exact: true })).toBeVisible()
await expect(page.getByText('Last Name *', { exact: true })).toBeVisible()
await expect(page.getByText('Date of Birth *', { exact: true })).toBeVisible()
await expect(page.getByText('Social Security Number *', { exact: true })).toBeVisible()
await expect(page.getByText('Years of Experience *', { exact: true })).toBeVisible()

await expect(page.getByRole('heading', { name: 'Address Information' })).toBeVisible()

await expect(page.getByText('Street Address *', { exact: true })).toBeVisible()
await expect(page.getByText('City *', { exact: true })).toBeVisible()
await expect(page.getByText('State *', { exact: true })).toBeVisible()
await expect(page.getByText('Zipcode *', { exact: true })).toBeVisible()

await expect(page.getByPlaceholder('Enter first name')).toBeVisible()
await expect(page.getByPlaceholder('Enter last name')).toBeVisible()
await expect(page.getByPlaceholder('Enter street address')).toBeVisible()
await expect(page.getByPlaceholder('Enter city')).toBeVisible()
await expect(page.locator('input[name="zipcode"]')).toBeVisible()

await profilePage.cancelEditProfile()

})

test('Edit Profile modal validates first name (letters only)', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openEditProfile()

await page.getByPlaceholder('Enter first name').fill('123')

await page.getByRole('button', { name: 'Update' }).click()

await expect(page.getByText('First name can only contain letters and spaces')).toBeVisible()

await expect(page.getByRole('button', { name: 'Update' })).toBeVisible()

await profilePage.cancelEditProfile()

})

test('Edit Profile modal submits successfully with valid data', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openEditProfile()

await page.getByRole('button', { name: 'Update' }).click()

await expect(page.getByText('Profile updated successfully').first()).toBeVisible()

await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible()

await expect(page.getByRole('button', { name: 'Update' })).toHaveCount(0)

})

test('Edit Profile — update additional address line then restore previous value', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openEditProfile()

const previousAdditionalAddress = await profilePage.getEditProfileFieldValue('address')

const updatedAdditionalAddress = `E2E Automation ${Date.now()}`

await profilePage.fillEditProfileInformation({ address: updatedAdditionalAddress })

await profilePage.submitEditProfileUpdate()

await expect(page.getByText('Profile updated successfully').first()).toBeVisible()

await expect(page.getByRole('button', { name: 'Edit Profile' })).toBeVisible()

await profilePage.openEditProfile()

await expect(page.locator('input[name="address"]')).toHaveValue(updatedAdditionalAddress)

await profilePage.fillEditProfileInformation({ address: previousAdditionalAddress })

await profilePage.submitEditProfileUpdate()

await expect(page.getByText('Profile updated successfully').first()).toBeVisible()

})

test('Edit Profile — update years of experience then restore', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openEditProfile()

const previousYears = await profilePage.getEditProfileFieldValue('yearsOfExperience')

const n = parseInt(previousYears, 10)
let bumped
if (Number.isFinite(n) && n >= 1 && n < 50) bumped = String(n + 1)
else if (Number.isFinite(n) && n === 50) bumped = '49'
else bumped = '5'

await profilePage.fillEditProfileInformation({ yearsOfExperience: bumped })

await profilePage.submitEditProfileUpdate()

await expect(page.getByText('Profile updated successfully').first()).toBeVisible()

await profilePage.openEditProfile()

await expect(page.locator('input[name="yearsOfExperience"]')).toHaveValue(bumped)

await profilePage.fillEditProfileInformation({ yearsOfExperience: previousYears })

await profilePage.submitEditProfileUpdate()

await expect(page.getByText('Profile updated successfully').first()).toBeVisible()

})

test('Profile section tabs show focused content', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSection('Certificates')

const certHeading = page.getByRole('heading', { name: 'Certificates' })

await certHeading.last().scrollIntoViewIfNeeded()

await expect(certHeading.last()).toBeVisible()

await profilePage.openProfileSection('Specialties')

const specHeading = page.getByRole('heading', { name: 'Specialties' })

await specHeading.last().scrollIntoViewIfNeeded()

await expect(specHeading.last()).toBeVisible()

})

})
