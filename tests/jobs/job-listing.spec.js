const path = require('path');
const { test, expect } = require('@playwright/test');
const { JobsPage } = require('../../pages/jobs.page');
const { LoginPage } = require('../../pages/login.page');

const DEFAULT_RESUME_PATH = path.join(__dirname, '../../fixtures/test-resume.pdf');

test.describe('Job listing and details', () => {

test('Login, listing cards, upload resume, submit application, random detail, pagination', async ({ page }) => {

test.setTimeout(180000)

const jobsPage = new JobsPage(page)
const loginPage = new LoginPage(page)

const email = process.env.TGN_TEST_EMAIL || 'james@mailinator.com'
const password = process.env.TGN_TEST_PASSWORD || 'Harin123'
const resumePath = process.env.TGN_TEST_RESUME_PATH || DEFAULT_RESUME_PATH

await loginPage.loginAndExpectJobsLanding(email, password)

await jobsPage.goto()

await expect(page.getByRole('heading', { name: 'Find Your Next Travel Nursing Job' })).toBeVisible()

await expect(page.getByText(/Showing \d+ jobs\(of [\d,]+ total\)/)).toBeVisible()

const titles = jobsPage.jobTitleHeadings()

await expect(titles.first()).toBeVisible()

const cardCount = await titles.count()

expect(cardCount).toBeGreaterThanOrEqual(12)

await expect(page.getByRole('button', { name: 'View more' }).first()).toBeVisible()

await jobsPage.openFirstJobDetailWithApplyNow()

await expect(page).toHaveURL(/\/jobs\/job/)

await expect(page).toHaveURL(/jobId=/)

await expect(page.getByRole('button', { name: 'Apply Now' })).toBeVisible()

await jobsPage.revealApplicationForm()

await expect(page.getByText(/Apply for /)).toBeVisible()

await expect(page.getByText('Resume/CV').first()).toBeVisible()

await expect(page.getByText(/Drag and drop your resume here/i).first()).toBeVisible()

await jobsPage.uploadResumeFile(resumePath)

await jobsPage.submitApplicationWithResume()

await expect(page.getByText('Application submitted successfully!')).toBeVisible()

await expect(page.getByRole('button', { name: 'Applied' }).first()).toBeVisible()

await jobsPage.gotoJobsListing()

const pickIndex = Math.floor(Math.random() * cardCount)

await jobsPage.openJobDetailByTitleIndex(pickIndex)

await expect(page).toHaveURL(/\/jobs\/job/)

await expect(page).toHaveURL(/jobId=/)

await jobsPage.gotoJobsListing()

const countBefore = await jobsPage.getShowingJobsCount()

expect(countBefore).toBeGreaterThan(0)

await jobsPage.scrollToTriggerNextJobsPage()

await expect.poll(async () => jobsPage.getShowingJobsCount(), { timeout: 60000 }).toBeGreaterThan(countBefore)

})

})
