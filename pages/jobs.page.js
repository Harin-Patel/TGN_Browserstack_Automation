const path = require('path')

const SEARCH_PLACEHOLDER = 'Search by job title, facility, location, certification...'

class JobsPage {

constructor(page){
this.page = page
}

_waitForFirstJobsPublicApi(){

return this.page.waitForResponse(
(r) =>{

if (r.request().method() !== 'GET' || !r.ok()) return false

const u = r.url()

if (!u.includes('/api/v1/jobs/public')) return false

return /[?&]page=1(?:&|$)/.test(u)
},
{ timeout: 90000 }
)
}

_waitForJobsPublicAfterSearch(){

return this.page.waitForResponse(
(r) => r.request().method() === 'GET' && r.ok() && r.url().includes('/api/v1/jobs/public'),
{ timeout: 90000 }
)
}

async _hasClientApplicationError(){

return this.page.getByText(/Application error/i).isVisible().catch(() => false)
}

async _finalizeJobListReady(){

await this.page.getByPlaceholder(SEARCH_PLACEHOLDER).waitFor({ state: 'visible', timeout: 60000 })

await this.page.getByRole('button', { name: 'View more' }).first().waitFor({ state: 'visible', timeout: 90000 })

if (await this._hasClientApplicationError()){

await Promise.all([
this._waitForFirstJobsPublicApi(),
this.page.reload({ waitUntil: 'domcontentloaded', timeout: 60000 })
])

await this.page.getByPlaceholder(SEARCH_PLACEHOLDER).waitFor({ state: 'visible', timeout: 60000 })

await this.page.getByRole('button', { name: 'View more' }).first().waitFor({ state: 'visible', timeout: 90000 })
}

if (await this._hasClientApplicationError()){

throw new Error('Jobs page shows a client-side Application error after load — check staging (API 500 / websocket failures in console often precede this).')
}
}

async gotoJobsListing(){

await Promise.all([
this._waitForFirstJobsPublicApi(),
this.page.goto('/jobs', { waitUntil: 'domcontentloaded', timeout: 60000 })
])

await this._finalizeJobListReady()
}

async goto(){

await this.gotoJobsListing()
}

async waitForJobListReady(){

await this._finalizeJobListReady()
}

async openViaTopNavSearchJobs(){

await this.page.goto('/', { waitUntil: 'domcontentloaded', timeout: 60000 })

const searchJobs = this.page.locator('nav.fixed').getByRole('link', { name: 'Search Jobs' })

await searchJobs.waitFor({ state: 'visible', timeout: 30000 })

const firstJobs = this._waitForFirstJobsPublicApi()

await Promise.all([
this.page.waitForURL(/\/jobs/i, { timeout: 60000 }),
searchJobs.click()
])

await firstJobs

await this._finalizeJobListReady()
}

async searchByKeyword(keyword){

const input = this.page.getByPlaceholder(SEARCH_PLACEHOLDER)

await input.fill(keyword)

const listingsRefetch = this._waitForJobsPublicAfterSearch()

await Promise.all([
this.page.waitForURL((url) => url.searchParams.get('search') === keyword, { timeout: 60000 }),
listingsRefetch,
input.press('Enter')
])

await this.page.getByRole('button', { name: 'View more' }).first().waitFor({ state: 'visible', timeout: 90000 })
}

async openAdvancedFilters(){

await this.page.getByRole('button', { name: 'Advanced Filters' }).click()
}

async expandFirstJobCard(){

await this.page.getByRole('button', { name: 'View more' }).first().click()
}

async switchToListView(){

await this.page.getByRole('button', { name: 'List view' }).click()
}

jobTitleHeadings(){

return this.page.locator('main h3').filter({ hasNotText: 'Quick Summary' })
}

async getShowingJobsCount(){

const text = await this.page.getByText(/Showing \d+ jobs/).innerText()

const match = text.match(/Showing (\d+) jobs/)

return match ? parseInt(match[1], 10) : 0
}

async openJobDetailByTitleIndex(index){

const titles = this.jobTitleHeadings()

await Promise.all([
this.page.waitForURL(/\/jobs\/job/i, { timeout: 60000 }),
titles.nth(index).click()
])
}

async scrollToTriggerNextJobsPage(){

await Promise.all([
this.page.waitForResponse(
(resp) =>
resp.request().method() === 'GET' &&
resp.url().includes('/api/v1/jobs/public') &&
resp.url().includes('page=2'),
{ timeout: 60000 }
),
this.page.evaluate(() => window.scrollTo(0, document.body.scrollHeight))
])
}

async openFirstJobDetailWithApplyNow(){

const max = await this.jobTitleHeadings().count()

for (let i = 0; i < max; i++){

await this.gotoJobsListing()

const titles = this.jobTitleHeadings()

await Promise.all([
this.page.waitForURL(/\/jobs\/job/i, { timeout: 60000 }),
titles.nth(i).click()
])

await this.page.waitForTimeout(1500)

const applyBtn = this.page.getByRole('button', { name: 'Apply Now' })

if (await applyBtn.count() > 0){

await applyBtn.first().waitFor({ state: 'visible', timeout: 10000 })

return
}

}

throw new Error('No job with Apply Now was found in the current listing')
}

async revealApplicationForm(){

await this.page.getByRole('button', { name: 'Apply Now' }).click()

await this.page.getByText(/Apply for /).waitFor({ state: 'visible', timeout: 20000 })
}

async uploadResumeFile(resumePath){

const fileName = path.basename(resumePath)

await this.page.locator('#resume-file-upload').setInputFiles(resumePath)

await this.page.getByText(fileName, { exact: true }).waitFor({ state: 'visible', timeout: 60000 })
}

async submitApplicationWithResume(){

await this.page.getByRole('button', { name: 'Submit Application' }).click()

await this.page.getByText('Application submitted successfully!').waitFor({ state: 'visible', timeout: 60000 })
}

}

module.exports = { JobsPage }
