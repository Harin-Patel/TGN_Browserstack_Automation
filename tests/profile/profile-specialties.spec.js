const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');
const { ProfilePage } = require('../../pages/profile.page');

test.describe('Profile — Specialties', () => {

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page }) => {
test.setTimeout(180000)
})

test('opens add-certification-specialty form then dismisses with Cancel', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Specialties', 'Add Certification Specialty')

await profilePage.scrollSectionHeadingIntoView('Specialties')

const formTitle = /Add New.*Specialty/i

await profilePage.openSectionAddForm('Add Certification Specialty', formTitle)

await expect(page.getByRole('heading', { name: formTitle }).last()).toBeVisible()

await profilePage.cancelSectionAddForm(formTitle)

await expect(page.getByRole('button', { name: 'Add Certification Specialty' })).toBeVisible()
})

test('Create, read, delete certification specialty (no row edit in UI)', async ({ page }) => {

const loginPage = new LoginPage(page)
const profilePage = new ProfilePage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'

await loginPage.loginAndExpectJobsLanding(email, password)

await profilePage.goto()

await profilePage.openProfileSectionWithAddControl('Specialties', 'Add Certification Specialty')

await profilePage.scrollSectionHeadingIntoView('Specialties')

const formTitle = /Add New.*Specialty/i

await profilePage.openSectionAddForm('Add Certification Specialty', formTitle)

const deleteSpecialtyBtns = page.getByRole('button', { name: 'Delete certification specialty' })

const rowCountBefore = await deleteSpecialtyBtns.count()

let added = false

for (let attempt = 0; attempt < 6 && !added; attempt++){

const salt = Date.now() + attempt * 924269 + Math.floor(Math.random() * 100000)

await profilePage.specialtyAddFormPickCertificationThenSpecialty({ salt })

const rowsBeforeClick = await deleteSpecialtyBtns.count()

await page.getByRole('button', { name: 'Add Specialty' }).click()

try {

await expect.poll(async () => {

if ((await deleteSpecialtyBtns.count()) > rowsBeforeClick) return true

const toast = page.getByText(/Certification specialty added/i)

const n = await toast.count()

for (let i = 0; i < n; i++){

if (await toast.nth(i).isVisible()) return true
}

return false
}, { timeout: 55000 }).toBeTruthy()

added = true
}

catch {

if (attempt === 5) throw new Error('Could not add a unique certification specialty after 6 attempts (pairs may all exist)')
}
}

page.once('dialog', d => d.accept())

await page.getByRole('button', { name: 'Delete certification specialty' }).last().click()

await profilePage.waitForNotice(/Certification specialty deleted/i)
})

})
