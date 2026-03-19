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

await profilePage.specialtyAddFormPickCertificationThenSpecialty()

const deleteSpecialtyBtns = page.getByRole('button', { name: 'Delete certification specialty' })

const rowCountBefore = await deleteSpecialtyBtns.count()

await page.getByRole('button', { name: 'Add Specialty' }).click()

await expect.poll(async () => (await deleteSpecialtyBtns.count()) > rowCountBefore,
{ timeout: 60000 }).toBeTruthy()

await profilePage.waitForNotice(/Certification specialty added/i).catch(() => {})

page.once('dialog', d => d.accept())

await page.getByRole('button', { name: 'Delete certification specialty' }).last().click()

await profilePage.waitForNotice(/Certification specialty deleted/i)
})

})
