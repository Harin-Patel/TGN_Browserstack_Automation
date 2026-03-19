const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');
const { ProfilePage } = require('../../pages/profile.page');

test.describe('Profile — Work history', () => {

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page }) => {
test.setTimeout(180000)
})

test('opens add-work-history form then dismisses with Cancel', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Work History', '+ Add Work History')

await profilePage.scrollSectionHeadingIntoView('Work History')

await profilePage.openSectionAddForm('+ Add Work History', 'Add New Work History')

await expect(page.getByText('Enter your work experience details', { exact: false })).toBeVisible()

await profilePage.cancelSectionAddForm('Add New Work History')

await expect(page.getByRole('button', { name: '+ Add Work History' })).toBeVisible()
})

test('CRUD: create work history, view, update description, delete', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Work History', '+ Add Work History')

await profilePage.scrollSectionHeadingIntoView('Work History')

await profilePage.openSectionAddForm('+ Add Work History', 'Add New Work History')

await profilePage.muiAutocompleteOpenAndPick('Search facilities...', { index: 1 })

await profilePage.muiAutocompleteOpenAndPick('Search specialties...', { index: 1 })

const desc = `E2E work history ${Date.now()}`

await page.locator('input[name="startDate"]').fill('2019-01-01')

await page.locator('input[name="endDate"]').fill('2020-12-01')

await page.locator('textarea[name="description"]').fill(desc)

await page.getByRole('button', { name: 'Add Work History' }).last().click()

await expect(page.getByText(desc, { exact: false }).filter({ visible: true }).first()).toBeVisible({ timeout: 60000 })

await profilePage.waitForNotice(/[Ww]ork history.*added|successfully/i).catch(() => {})

const card = profilePage.profileItemCardRoot(desc)

await card.getByRole('button', { name: 'Edit work history' }).click()

await page.getByRole('heading', { name: 'Edit Work History' }).last().waitFor({ state: 'visible', timeout: 30000 })

const updated = `${desc} — updated`

await page.locator('textarea[name="description"]').fill(updated)

await page.getByRole('button', { name: 'Update' }).click()

await profilePage.waitForNotice(/Work history updated/i)

await expect(page.getByText(updated, { exact: false }).filter({ visible: true }).first()).toBeVisible()

page.once('dialog', d => d.accept())

const card2 = profilePage.profileItemCardRoot(updated)

await card2.getByRole('button', { name: 'Delete work history' }).click()

await profilePage.waitForNotice(/Work history entry deleted/i)

await expect(page.getByText(updated, { exact: false }).filter({ visible: true })).toHaveCount(0)
})

})
