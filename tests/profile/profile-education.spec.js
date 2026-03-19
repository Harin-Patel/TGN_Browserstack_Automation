const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');
const { ProfilePage } = require('../../pages/profile.page');

test.describe('Profile — Education', () => {

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page }) => {
test.setTimeout(180000)
})

test('opens add-education form then dismisses with Cancel', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Education', '+ Add Education')

await profilePage.scrollSectionHeadingIntoView('Education')

await profilePage.openSectionAddForm('+ Add Education', 'Add New Education')

await expect(page.getByText('Enter your education history details', { exact: false })).toBeVisible()

await profilePage.cancelSectionAddForm('Add New Education')

await expect(page.getByRole('button', { name: '+ Add Education' })).toBeVisible()
})

test('CRUD: create, view card, update via modal, delete education entry', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Education', '+ Add Education')

await profilePage.scrollSectionHeadingIntoView('Education')

await profilePage.openSectionAddForm('+ Add Education', 'Add New Education')

await profilePage.muiAutocompleteOpenAndPick('Search schools...', { index: 0 })

await profilePage.muiAutocompleteOpenAndPick('Select course of study', { index: 0 })

await page.getByRole('button', { name: 'Add Education' }).last().click()

await profilePage.waitForNotice(/Education history added/i)

await page.getByRole('button', { name: 'Edit education history' }).last().click()

await page.locator('#education-history-form').waitFor({ state: 'visible', timeout: 30000 })

await profilePage.muiAutocompleteOpenAndPick('Search schools...', { index: 0 })

await profilePage.muiAutocompleteOpenAndPick('Select course of study', { index: 0 })

await page.getByRole('checkbox', { name: /Did you Graduate/i }).uncheck().catch(() => {})

await page.getByRole('button', { name: 'Update' }).click()

await profilePage.waitForNotice(/Education history updated/i)

page.once('dialog', d => d.accept())

await page.getByRole('button', { name: 'Delete education history' }).last().click()

await profilePage.waitForNotice(/Education history entry deleted/i)
})

})
