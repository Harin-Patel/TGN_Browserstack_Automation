const { test, expect } = require('@playwright/test')
const {
  DashboardPage,
  HERO,
  HERO_QUICK_LINK,
  HERO_QUICK_LINK_URL,
} = require('../../pages/dashboard.page')

test.describe('Home hero band — discovery links (no in-hero job keyword field)', () => {

test.beforeEach(async () => {
test.setTimeout(120000)
})

test('Hero band is ready and exposes specialty newsletter field', async ({ page }) => {

const dashboard = new DashboardPage(page)

await dashboard.goto()

await expect(page.getByText(HERO.COMMUNITY_BLURB).first()).toBeVisible()

await dashboard.waitForHeroBandReady()

await expect(dashboard.heroBand().getByRole('link', { name: HERO_QUICK_LINK.FIND_A_JOB }).first()).toBeVisible()

await expect(dashboard.heroNewsletterSpecialtyInput()).toBeVisible()
})

test('Hero quick links navigate to the expected routes', async ({ page }) => {

const dashboard = new DashboardPage(page)

const cases = [
[HERO_QUICK_LINK.FIND_A_JOB, HERO_QUICK_LINK_URL.FIND_A_JOB],
[HERO_QUICK_LINK.RESOURCES, HERO_QUICK_LINK_URL.RESOURCES],
[HERO_QUICK_LINK.MEMBER_BENEFITS, HERO_QUICK_LINK_URL.MEMBER_BENEFITS],
[HERO_QUICK_LINK.EVENTS, HERO_QUICK_LINK_URL.EVENTS],
[HERO_QUICK_LINK.ABOUT_US, HERO_QUICK_LINK_URL.ABOUT_US],
[HERO_QUICK_LINK.BLOG, HERO_QUICK_LINK_URL.BLOG],
[HERO_QUICK_LINK.CONTACT_US, HERO_QUICK_LINK_URL.CONTACT_US],
]

for (const [label, urlRe] of cases){

await dashboard.goto()

await dashboard.waitForHeroBandReady()

await dashboard.openHeroBandLink(label, urlRe)

await expect(page).toHaveURL(urlRe)
}
})

test('Find a Job reaches the jobs listing search experience', async ({ page }) => {

const dashboard = new DashboardPage(page)

await dashboard.goto()

await dashboard.openHeroFindAJob()

await expect(page).toHaveURL(/\/jobs/i)

await expect(page.getByPlaceholder('Search by job title, facility, location, certification...')).toBeVisible()
})

})
