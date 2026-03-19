const { test, expect } = require('@playwright/test');
const { JobsPage } = require('../../pages/jobs.page');

test.describe('Search jobs', () => {

test.describe.configure({ mode: 'serial' })

test.beforeEach(async ({ page }) => {
test.setTimeout(120000)
})

test('Top nav Search Jobs opens jobs page', async ({ page }) => {

const jobsPage = new JobsPage(page)

await jobsPage.openViaTopNavSearchJobs()

await expect(page).toHaveURL(/\/jobs/i)

await expect(page.getByRole('heading', { name: 'Find Your Next Travel Nursing Job' })).toBeVisible()

await expect(page.getByPlaceholder(/Search by job title, facility, location, certification/)).toBeVisible()

})

test('Direct jobs URL loads search and job results', async ({ page }) => {

const jobsPage = new JobsPage(page)

await jobsPage.goto()

await expect(page.getByRole('heading', { name: 'Find Your Next Travel Nursing Job' })).toBeVisible()

await expect(page.getByRole('button', { name: 'View more' }).first()).toBeVisible()

})

test('Keyword search updates URL and still shows job cards', async ({ page }) => {

const jobsPage = new JobsPage(page)

await jobsPage.goto()

await jobsPage.searchByKeyword('ICU')

await expect(page).toHaveURL(/search=ICU/)

await expect(page.getByRole('button', { name: 'View more' }).first()).toBeVisible()

})

test('Advanced Filters exposes specialty filters', async ({ page }) => {

const jobsPage = new JobsPage(page)

await jobsPage.goto()

await jobsPage.openAdvancedFilters()

await expect(page.getByText('Specialty', { exact: false }).first()).toBeVisible()

})

test('View more expands first job card', async ({ page }) => {

const jobsPage = new JobsPage(page)

await jobsPage.goto()

await jobsPage.expandFirstJobCard()

await expect(page.getByRole('button', { name: 'View less' })).toBeVisible()

})

test('Switch to list view', async ({ page }) => {

const jobsPage = new JobsPage(page)

await jobsPage.goto()

await jobsPage.switchToListView()

await expect(page.getByRole('button', { name: 'List view' })).toBeVisible()

})

})
