const { expect } = require('@playwright/test');

class ProfilePage {

constructor(page){
this.page = page
}

async goto(){

await this.page.goto('/profile', { waitUntil: 'domcontentloaded', timeout: 90000 })

await this.waitForProfileReady()
}

async waitForProfileReady(){

await this.page.waitForURL(/\/profile/i, { timeout: 60000 })

await this.page.getByRole('button', { name: 'Edit Profile' }).waitFor({ state: 'visible', timeout: 90000 })
}

async openEditProfile(){

await this.page.getByRole('button', { name: 'Edit Profile' }).click()

await this.page.getByRole('button', { name: 'Update' }).waitFor({ state: 'visible', timeout: 30000 })
}

async cancelEditProfile(){

await this.page.getByRole('button', { name: 'Cancel' }).click()

await this.page.getByRole('button', { name: 'Edit Profile' }).waitFor({ state: 'visible', timeout: 15000 })
}

async openProfileSection(sectionName){

await this.page.getByRole('button', { name: sectionName }).first().click()
}

/**
 * Opens a profile tab and waits until its primary “add” control is visible.
 * @param {string} sectionTab — e.g. "Professional Licenses", "Certificates"
 * @param {string} addButtonLabel — exact accessible name of the add button
 */
async openProfileSectionWithAddControl(sectionTab, addButtonLabel){

await this.page.getByRole('button', { name: sectionTab }).first().click()

await this.page.getByRole('button', { name: addButtonLabel }).first()
.waitFor({ state: 'visible', timeout: 60000 })
}

/**
 * Clicks the section add button and waits for the inline form heading.
 * @param {string} addButtonLabel
 * @param {string|RegExp} formHeading — role=heading name (string or regex)
 */
async openSectionAddForm(addButtonLabel, formHeading){

const addButton = this.page.getByRole('button', { name: addButtonLabel })

await addButton.scrollIntoViewIfNeeded()

await addButton.click()

await this.page.getByRole('heading', { name: formHeading }).last()
.waitFor({ state: 'visible', timeout: 60000 })
}

/**
 * Dismisses the topmost inline “add” form via Cancel and waits for its heading to hide.
 * @param {string|RegExp} formHeading
 */
async cancelSectionAddForm(formHeading){

await this.page.getByRole('button', { name: 'Cancel' }).last().click()

await this.page.getByRole('heading', { name: formHeading }).last()
.waitFor({ state: 'hidden', timeout: 30000 })
}

async scrollSectionHeadingIntoView(headingName){

const heading = this.page.getByRole('heading', { name: headingName }).last()

await heading.scrollIntoViewIfNeeded()

await heading.waitFor({ state: 'visible', timeout: 60000 })
}

async getEditProfileFieldValue(fieldName){

return this.page.locator(`input[name="${fieldName}"]`).inputValue()
}

async fillEditProfileInformation(fields){

const allowed = new Set([
'firstName',
'lastName',
'dateOfBirth',
'ssn',
'yearsOfExperience',
'streetAddress',
'address',
'city',
'zipcode',
])

for (const [key, value] of Object.entries(fields)){

if (value === undefined || !allowed.has(key)) continue

await this.page.locator(`input[name="${key}"]`).fill(String(value))
}

}

async submitEditProfileUpdate(){

await this.page.getByRole('button', { name: 'Update' }).click()

await this.page.getByText('Profile updated successfully').first().waitFor({ state: 'visible', timeout: 30000 })
}

/**
 * Waits for a transient banner/toast line (substring or regex match on visible text).
 * @param {string|RegExp} textOrRegExp
 */
async waitForNotice(textOrRegExp, options = {}){

const loc = typeof textOrRegExp === 'string'
? this.page.getByText(textOrRegExp, { exact: false })
: this.page.getByText(textOrRegExp)

const timeout = options.timeout ?? 45000

await expect.poll(async () => {

const n = await loc.count()

for (let i = 0; i < n; i++){

if (await loc.nth(i).isVisible()) return true
}

return false
}, {
timeout,
}).toBeTruthy()
}

/**
 * Adds a minimal work-history row so References can bind to `workHistoryEmployerId`.
 * @returns {Promise<string>} description text used as a marker on the card
 */
async seedWorkHistoryEntry(){

await this.openProfileSectionWithAddControl('Work History', '+ Add Work History')

await this.scrollSectionHeadingIntoView('Work History')

await this.openSectionAddForm('+ Add Work History', 'Add New Work History')

await this.muiAutocompleteOpenAndPick('Search facilities...', { index: 1 })

await this.muiAutocompleteOpenAndPick('Search specialties...', { index: 1 })

const desc = `E2E WH seed ${Date.now()}`

await this.page.locator('input[name="startDate"]').fill('2019-01-01')

await this.page.locator('input[name="endDate"]').fill('2020-12-01')

await this.page.locator('textarea[name="description"]').fill(desc)

await this.page.getByRole('button', { name: 'Add Work History' }).last().click()

await this.page.getByText(desc, { exact: false }).filter({ visible: true }).first()
.waitFor({ state: 'visible', timeout: 60000 })

return desc
}

/**
 * Visible profile list card (shadow panel) containing marker text — avoids duplicate lg:hidden stacks.
 * @param {string} markerText — unique text on the card body
 * @param {string} [subtitleHint] — extra copy to disambiguate (e.g. "Certificate Number")
 */
profileItemCardRoot(markerText, subtitleHint){

let card = this.page.locator('div.shadow-md').filter({ hasText: markerText })

if (subtitleHint) card = card.filter({ hasText: subtitleHint })

return card.filter({ visible: true }).first()
}

/**
 * Opens a MUI Autocomplete dropdown and picks an option (global popper in body).
 * @param {string} inputPlaceholder — input placeholder inside the field
 * @param {{ index?: number, textMatch?: RegExp }} [pick]
 */
async muiAutocompleteOpenAndPick(inputPlaceholder, pick = {}){

const root = this.page.locator('.MuiAutocomplete-root')
.filter({ has: this.page.locator(`input[placeholder="${inputPlaceholder}"]`) })
.first()

await root.getByRole('button', { name: 'Open' }).click()

const popper = this.page.locator('.MuiAutocomplete-popper')

await popper.locator('[role="option"], li').first().waitFor({ state: 'visible', timeout: 45000 })

if (pick.textMatch){

const items = await popper.locator('[role="option"], li').allTextContents()

const choice = items.find(t => pick.textMatch.test(String(t))) || items[0]

await popper.locator('[role="option"], li', { hasText: choice }).first().click()
}

else {

const idx = pick.index ?? 0

await popper.locator('[role="option"], li').nth(idx).click()
}

await this.page.locator('.MuiAutocomplete-popper').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
}

/**
 * License “type” row (first autocomplete on the add-license form).
 */
async licenseAddFormPickLicenseType(){

await this.muiAutocompleteOpenAndPick('Search or select license type', { index: 0 })
}

/**
 * License state autocomplete — prefers Illinois when present.
 */
async licenseAddFormPickState(){

await this.muiAutocompleteOpenAndPick('Search states...', { textMatch: /Illinois/i })
}

/**
 * Add-license submit (not the “+ Add License” opener).
 */
async submitAddLicenseInlineForm(){

await this.page.getByRole('button', { name: 'Add License' }).last().click()
}

/**
 * Certification + specialty pair on “Add New Certification Specialty”.
 * Varies the pair using `options.salt` (or time + random) to reduce duplicate “already registered” pairs.
 * @param {{ salt?: number }} [options]
 */
async specialtyAddFormPickCertificationThenSpecialty(options = {}){

const certRoot = this.page.locator('.MuiAutocomplete-root')
.filter({ has: this.page.locator('input[placeholder="Select certification"]') })
.first()

const preferCert = /BLS|CPR|Basic Life|ACLS|Advanced Cardiac|RN|Nursing|Certified|IV/i

await certRoot.getByRole('button', { name: 'Open' }).click()

let popper = this.page.locator('.MuiAutocomplete-popper')

let certItems = popper.locator('[role="option"], li')

await certItems.first().waitFor({ state: 'visible', timeout: 45000 })

const certCount = await certItems.count()

if (certCount < 1) throw new Error('No certification options in autocomplete')

const certLabels = await certItems.allTextContents()

let certPickIndices = certLabels
.map((t, i) => ({ t: String(t).trim(), i }))
.filter(({ t }) => t && preferCert.test(t))
.map(({ i }) => i)

if (certPickIndices.length === 0){

certPickIndices = certLabels.map((t, i) => ({ t: String(t).trim(), i })).filter(({ t }) => t).map(({ i }) => i)
}

if (certPickIndices.length === 0) certPickIndices = [...Array(certCount).keys()]

const entropy = options.salt != null
? BigInt(options.salt)
: (BigInt(Date.now()) ^ BigInt(Math.floor(Math.random() * 0x7fffffff)))

const start = Number((entropy + 97n) % BigInt(certPickIndices.length))

let certIdxUsed = null

for (let k = 0; k < certPickIndices.length; k++){

if (k > 0){

await certRoot.getByRole('button', { name: 'Open' }).click()

popper = this.page.locator('.MuiAutocomplete-popper')

certItems = popper.locator('[role="option"], li')

await certItems.first().waitFor({ state: 'visible', timeout: 45000 })
}

const idxInList = certPickIndices[(start + k) % certPickIndices.length]

await certItems.nth(idxInList).click()

const specialtyReady = await this.page.waitForFunction(() => {

const el = document.querySelector('input[placeholder="Select specialty"]')

return el && el.offsetParent !== null && !el.disabled
}, null, { timeout: 15000 }).then(() => true).catch(() => false)

if (specialtyReady){

certIdxUsed = idxInList

break
}
}

if (certIdxUsed === null){

throw new Error('No certification option enabled the specialty field — check staging data')
}

const specRoot = this.page.locator('.MuiAutocomplete-root')
.filter({ has: this.page.locator('input[placeholder="Select specialty"]') })
.first()

await specRoot.getByRole('button', { name: 'Open' }).click()

const popper2 = this.page.locator('.MuiAutocomplete-popper')

const specItems = popper2.locator('[role="option"], li')

await specItems.first().waitFor({ state: 'visible', timeout: 45000 })

const specCount = await specItems.count()

if (specCount < 1) throw new Error('No specialty options in autocomplete')

const specLabels = await specItems.allTextContents()

let specPickIndices = specLabels
.map((t, i) => ({ t: String(t).trim(), i }))
.filter(({ t }) => t)
.map(({ i }) => i)

if (specPickIndices.length === 0) specPickIndices = [...Array(specCount).keys()]

const specIdx = specPickIndices[Number((entropy * 7919n + BigInt(certIdxUsed) * 193n) % BigInt(specPickIndices.length))]

await specItems.nth(specIdx).click()

await this.page.locator('.MuiAutocomplete-popper').waitFor({ state: 'hidden', timeout: 15000 }).catch(() => {})
}

}

module.exports = { ProfilePage }
