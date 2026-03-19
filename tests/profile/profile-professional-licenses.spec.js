const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');
const { ProfilePage } = require('../../pages/profile.page');

test.describe('Profile — Professional licenses', () => {

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page }) => {
test.setTimeout(180000)
})

test('opens add-license form then dismisses with Cancel', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Professional Licenses', '+ Add License')

const addLicense = page.getByRole('button', { name: '+ Add License' })
await addLicense.scrollIntoViewIfNeeded()
await expect(addLicense).toBeVisible()

await profilePage.scrollSectionHeadingIntoView('Professional Licenses')

await profilePage.openSectionAddForm('+ Add License', 'Add New License')

await expect(page.getByText('Enter your professional license details', { exact: false })).toBeVisible()

await profilePage.cancelSectionAddForm('Add New License')

await expect(page.getByRole('button', { name: '+ Add License' })).toBeVisible()
})

test('CRUD: create, view card, update, delete license', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Professional Licenses', '+ Add License')

await profilePage.scrollSectionHeadingIntoView('Professional Licenses')

await profilePage.openSectionAddForm('+ Add License', 'Add New License')

await profilePage.licenseAddFormPickLicenseType()

await profilePage.licenseAddFormPickState()

const licNumber = `E2E-LIC-${Date.now()}`

await page.locator('input[name="number"]').fill(licNumber)

await page.locator('input[name="expireDate"]').fill('2032-06-15')

await profilePage.submitAddLicenseInlineForm()

await expect(page.getByText(licNumber, { exact: true }).filter({ visible: true }).first()).toBeVisible({ timeout: 60000 })

await profilePage.waitForNotice(/[Ll]icense.*added|[Ll]icense added|successfully/i)

const card = profilePage.profileItemCardRoot(licNumber, 'License Number')

await card.getByRole('button', { name: 'Edit license' }).click()

await page.getByRole('heading', { name: 'Edit License' }).last().waitFor({ state: 'visible', timeout: 30000 })

const updated = `${licNumber}-U`

await page.locator('input[name="number"]').fill(updated)

await page.getByRole('button', { name: 'Update' }).click()

await profilePage.waitForNotice(/License updated/i)

await expect(page.getByText(updated, { exact: true }).filter({ visible: true }).first()).toBeVisible()

page.once('dialog', d => d.accept())

const card2 = profilePage.profileItemCardRoot(updated, 'License Number')

await card2.getByRole('button', { name: 'Delete license' }).click()

await profilePage.waitForNotice(/License deleted/i)

await expect(page.getByText(updated, { exact: true }).filter({ visible: true })).toHaveCount(0)
})

})
