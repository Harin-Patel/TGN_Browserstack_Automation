/**
 * Site home / marketing dashboard — https://tgn-staging.staffbot.com/ (route `/`).
 * Maps primary landmarks: hero, top nav, Resources menu, newsletter, app CTAs, footer.
 *
 * Note: on staging, loading `/` while already logged in can surface a client “Application error”;
 * these helpers assume the public shell (typical unauthenticated or fresh session).
 */
const SECTION_HEADINGS = {
  NEWSLETTER: 'Sign Up for Our Community Newsletter Today',
}

/** Copy that appears in the hero area (used as a readiness signal). */
const HERO = {
  COMMUNITY_BLURB: /The Scrub Society is dedicated to providing powerful tools/i,
}

/**
 * Quick-link row under the hero blurb (staging implements this inside a large `footer` landmark).
 * There is no free-text job search `<input>` here—**Find a Job** routes to `/jobs` where the real search bar lives.
 */
const HERO_QUICK_LINK = {
  FIND_A_JOB: 'Find a Job',
  RESOURCES: 'Resources',
  MEMBER_BENEFITS: 'Member Benefits',
  EVENTS: 'Events',
  ABOUT_US: 'About Us',
  BLOG: 'Blog',
  CONTACT_US: 'Contact Us',
}

/** Expected path patterns after clicking {@link HERO_QUICK_LINK} entries. */
const HERO_QUICK_LINK_URL = {
  FIND_A_JOB: /\/jobs/i,
  RESOURCES: /\/travel-nurse-resource-hub/i,
  MEMBER_BENEFITS: /\/member-benefits/i,
  EVENTS: /\/events/i,
  ABOUT_US: /\/about-us/i,
  BLOG: /\/articles/i,
  CONTACT_US: /\/contact/i,
}

const TOP_NAV = {
  SEARCH_JOBS: 'Search Jobs',
  SOCIAL_WALL: 'Social Wall',
}

/** “Resources” dropdown entries (link text in the open menu). */
const RESOURCES_MENU_LINK = {
  TRAVEL_NURSE_RESOURCE_HUB: 'Resources',
  ABOUT_US: 'About Us',
  BLOG: 'Blog',
  CONTACT: 'Contact Us',
  EVENTS: 'Events',
  FIND_A_JOB: 'Find a Job',
  MEMBER_BENEFITS: 'Member Benefits',
}

const FOOTER_LINK = {
  ABOUT_US: 'About Us',
  BLOG: 'Blog',
  CONTACT_US: 'Contact Us',
  EVENTS: 'Events',
  FIND_A_JOB: 'Find a Job',
  MEMBER_BENEFITS: 'Member Benefits',
  RESOURCES: 'Resources',
  PRIVACY: 'Privacy Policy',
  USER_AGREEMENT: 'User Agreement',
}

class DashboardPage {

constructor(page){
this.page = page
}

topNav(){

return this.page.locator('nav.fixed')
}

_main(){

return this.page.locator('main')
}

async _hasClientApplicationError(){

return this.page.getByText(/Application error/i).isVisible().catch(() => false)
}

async goto(){

await this.page.goto('/', { waitUntil: 'domcontentloaded', timeout: 90000 })

await this.waitForHomeDashboardReady()
}

async waitForHomeDashboardReady(){

await this.page.waitForURL((url) => url.pathname === '/' || url.pathname === '', { timeout: 60000 })

if (await this._hasClientApplicationError()){

throw new Error(
'Home dashboard shows a client-side Application error — often seen when visiting `/` with an active session on staging; open `/` logged out or use a clean context.'
)
}

await this._main().waitFor({ state: 'visible', timeout: 90000 })

await this.page.getByText(HERO.COMMUNITY_BLURB).first()
.waitFor({ state: 'visible', timeout: 90000 })
}

/**
 * Scrolls a known home section heading into view (e.g. newsletter).
 * Not all blocks are descendants of `main` on the home page, so we match by role globally.
 * @param {string} headingName — use SECTION_HEADINGS
 */
async scrollSectionHeadingIntoView(headingName){

const heading = this.page.getByRole('heading', { name: headingName }).first()

await heading.waitFor({ state: 'visible', timeout: 60000 })

await heading.scrollIntoViewIfNeeded()
}

/**
 * Marketing “hero” column: community blurb + quick links + newsletter (same landmark as footer on staging).
 */
heroBand(){

return this.page.locator('footer').filter({ hasText: HERO.COMMUNITY_BLURB })
}

/**
 * Newsletter specialty field under the hero band (autocomplete; not the jobs search on `/jobs`).
 */
heroNewsletterSpecialtyInput(){

return this.heroBand().getByPlaceholder('Select Specialties')
}

async waitForHeroBandReady(){

await this.heroBand().getByRole('link', { name: HERO_QUICK_LINK.FIND_A_JOB }).first()
.waitFor({ state: 'visible', timeout: 60000 })
}

/**
 * @param {string} linkName — {@link HERO_QUICK_LINK}
 * @param {string|RegExp} urlPattern — {@link HERO_QUICK_LINK_URL}
 */
async openHeroBandLink(linkName, urlPattern){

const link = this.heroBand().getByRole('link', { name: linkName }).first()

await link.waitFor({ state: 'visible', timeout: 30000 })

await link.scrollIntoViewIfNeeded()

await Promise.all([
this.page.waitForURL(urlPattern, { timeout: 60000 }),
link.click()
])
}

async openHeroFindAJob(){

await this.openHeroBandLink(HERO_QUICK_LINK.FIND_A_JOB, HERO_QUICK_LINK_URL.FIND_A_JOB)
}

async openHeroTravelResourcesHub(){

await this.openHeroBandLink(HERO_QUICK_LINK.RESOURCES, HERO_QUICK_LINK_URL.RESOURCES)
}

async openHeroMemberBenefits(){

await this.openHeroBandLink(HERO_QUICK_LINK.MEMBER_BENEFITS, HERO_QUICK_LINK_URL.MEMBER_BENEFITS)
}

async openHeroEvents(){

await this.openHeroBandLink(HERO_QUICK_LINK.EVENTS, HERO_QUICK_LINK_URL.EVENTS)
}

async openHeroAboutUs(){

await this.openHeroBandLink(HERO_QUICK_LINK.ABOUT_US, HERO_QUICK_LINK_URL.ABOUT_US)
}

async openHeroBlog(){

await this.openHeroBandLink(HERO_QUICK_LINK.BLOG, HERO_QUICK_LINK_URL.BLOG)
}

async openHeroContactUs(){

await this.openHeroBandLink(HERO_QUICK_LINK.CONTACT_US, HERO_QUICK_LINK_URL.CONTACT_US)
}

async openResourcesMenu(){

await this.topNav().getByRole('button', { name: 'Resources' }).click()
}

/**
 * Opens the Resources menu and follows a link by visible label.
 * @param {string|RegExp} linkName — e.g. RESOURCES_MENU_LINK.TRAVEL_NURSE_RESOURCE_HUB
 * @param {string|RegExp} [urlPattern] — optional URL assertion
 */
async openResourcesMenuLink(linkName, urlPattern){

await this.openResourcesMenu()

const link = this.page.getByRole('link', { name: linkName }).first()

await link.waitFor({ state: 'visible', timeout: 30000 })

if (urlPattern){

await Promise.all([
this.page.waitForURL(urlPattern, { timeout: 60000 }),
link.click()
])
}

else {

await link.click()
}
}

async openTopNavSearchJobs(){

await Promise.all([
this.page.waitForURL(/\/jobs/i, { timeout: 60000 }),
this.topNav().getByRole('link', { name: TOP_NAV.SEARCH_JOBS }).click()
])
}

async openTopNavSocialWall(){

await Promise.all([
this.page.waitForURL(/\/social-wall/i, { timeout: 60000 }),
this.topNav().getByRole('link', { name: TOP_NAV.SOCIAL_WALL }).click()
])
}

async scrollFooterLinkIntoView(linkName){

const link = this.page.locator('footer').getByRole('link', { name: linkName }).first()

await link.scrollIntoViewIfNeeded()

await link.waitFor({ state: 'visible', timeout: 60000 })
}

}

module.exports = {
DashboardPage,
SECTION_HEADINGS,
HERO,
HERO_QUICK_LINK,
HERO_QUICK_LINK_URL,
TOP_NAV,
RESOURCES_MENU_LINK,
FOOTER_LINK,
}
