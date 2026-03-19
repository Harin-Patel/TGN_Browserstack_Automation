const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');
const { ProfilePage } = require('../../pages/profile.page');

test.describe('Profile — Certificates', () => {

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page }) => {
test.setTimeout(180000)
})

test('opens add-certificate form then dismisses with Cancel', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Certificates', 'Add Certificate')

await profilePage.scrollSectionHeadingIntoView('Certificates')

await profilePage.openSectionAddForm('Add Certificate', 'Add New Certificate')

await expect(page.getByText('Enter your professional certificate details', { exact: false })).toBeVisible()

await profilePage.cancelSectionAddForm('Add New Certificate')

await expect(page.getByRole('button', { name: 'Add Certificate' })).toBeVisible()
})

test('CRUD: create, view card, update, delete certificate', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Certificates', 'Add Certificate')

await profilePage.scrollSectionHeadingIntoView('Certificates')

await profilePage.openSectionAddForm('Add Certificate', 'Add New Certificate')

const certNumber = `E2E-CERT-${Date.now()}`

await page.locator('select[name="certificateTypeId"]').selectOption({ index: 1 })

await page.locator('input[name="number"]').fill(certNumber)

await page.locator('input[name="expireDate"]').fill('2030-12-31')

await page.getByRole('button', { name: 'Add Certificate' }).last().click()

await expect(page.getByText(certNumber, { exact: true }).filter({ visible: true }).first()).toBeVisible({ timeout: 60000 })

await profilePage.waitForNotice(/Certificate added successfully/i)

const card = profilePage.profileItemCardRoot(certNumber, 'Certificate Number')

await card.getByRole('button', { name: 'Edit certificate' }).click()

await page.getByRole('heading', { name: 'Edit Certificate' }).last().waitFor({ state: 'visible', timeout: 30000 })

const updated = `${certNumber}-U`

await page.locator('input[name="number"]').fill(updated)

await page.getByRole('button', { name: 'Update' }).click()

await profilePage.waitForNotice(/Certificate updated successfully/i)

await expect(page.getByText(updated, { exact: true }).filter({ visible: true }).first()).toBeVisible()

page.once('dialog', d => d.accept())

const card2 = profilePage.profileItemCardRoot(updated, 'Certificate Number')

await card2.getByRole('button', { name: 'Delete certificate' }).click()

await profilePage.waitForNotice(/Certificate deleted successfully/i)

await expect(page.getByText(updated, { exact: true }).filter({ visible: true })).toHaveCount(0)
})

})
