const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');
const { ProfilePage } = require('../../pages/profile.page');

test.describe('Profile — References', () => {

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page }) => {
test.setTimeout(240000)
})

test('opens add-reference form then dismisses with Cancel', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('References', '+ Add Reference')

await profilePage.scrollSectionHeadingIntoView('References')

const formTitle = /Add New.*Reference/i

await profilePage.openSectionAddForm('+ Add Reference', formTitle)

await expect(page.getByRole('heading', { name: formTitle }).last()).toBeVisible()

await profilePage.cancelSectionAddForm(formTitle)

await expect(page.getByRole('button', { name: '+ Add Reference' })).toBeVisible()
})

test('CRUD: create, view card, update, delete professional reference', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

const whDesc = await profilePage.seedWorkHistoryEntry()

await profilePage.openProfileSectionWithAddControl('References', '+ Add Reference')

await profilePage.scrollSectionHeadingIntoView('References')

const formTitle = /Add New.*Reference/i

await profilePage.openSectionAddForm('+ Add Reference', formTitle)

const employerSelect = page.locator('select[name="workHistoryEmployerId"]')

await expect.poll(async () => (await employerSelect.locator('option').count()) >= 2, { timeout: 60000 }).toBeTruthy()

const stamp = Date.now()
const fullName = `E2E Reference ${stamp}`
const refEmail = `e2e.ref.${stamp}@mailinator.com`

await employerSelect.selectOption({ index: 1 })

await page.locator('input[name="fullName"]').fill(fullName)

await page.locator('input[name="referenceJobTitle"]').fill('Charge Nurse')

await page.getByPlaceholder('Enter 10 digits').fill('5551234567')

await page.locator('input[name="email"]').fill(refEmail)

await page.getByRole('button', { name: 'Add Reference' }).last().click()

await profilePage.waitForNotice(/Professional reference added/i)

await expect(page.getByText(fullName, { exact: true }).filter({ visible: true }).first()).toBeVisible({ timeout: 60000 })

const card = profilePage.profileItemCardRoot(fullName)

await card.getByRole('button', { name: 'Edit reference' }).click()

await page.getByRole('button', { name: 'Update' }).waitFor({ state: 'visible', timeout: 30000 })

await page.locator('input[name="referenceJobTitle"]').fill('Charge Nurse — Updated')

await page.getByRole('button', { name: 'Update' }).click()

await profilePage.waitForNotice(/Professional reference updated/i)

await expect(page.getByText('Charge Nurse — Updated', { exact: false }).filter({ visible: true }).first()).toBeVisible()

page.once('dialog', d => d.accept())

const card2 = profilePage.profileItemCardRoot(fullName)

await card2.getByRole('button', { name: 'Delete reference' }).click()

await profilePage.waitForNotice(/Professional reference deleted/i)

await expect(page.getByText(fullName, { exact: true }).filter({ visible: true })).toHaveCount(0)

await profilePage.openProfileSectionWithAddControl('Work History', '+ Add Work History')

await profilePage.scrollSectionHeadingIntoView('Work History')

page.once('dialog', d => d.accept())

const whCard = profilePage.profileItemCardRoot(whDesc)

await whCard.getByRole('button', { name: 'Delete work history' }).scrollIntoViewIfNeeded()

await whCard.getByRole('button', { name: 'Delete work history' }).click()

await profilePage.waitForNotice(/Work history entry deleted/i)
})

})
