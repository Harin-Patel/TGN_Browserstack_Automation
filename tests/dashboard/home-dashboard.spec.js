const { test, expect } = require('@playwright/test')
const {
  DashboardPage,
  SECTION_HEADINGS,
  HERO,
  TOP_NAV,
  RESOURCES_MENU_LINK,
  FOOTER_LINK,
} = require('../../pages/dashboard.page')

test.describe('Home dashboard (/)', () => {

test.beforeEach(async () => {
test.setTimeout(120000)
})

test('Loads hero, newsletter section, and top nav', async ({ page }) => {

const dashboard = new DashboardPage(page)

await dashboard.goto()

await expect(page).toHaveURL(/\/$/)

await expect(page.getByText(HERO.COMMUNITY_BLURB).first()).toBeVisible()

await dashboard.scrollSectionHeadingIntoView(SECTION_HEADINGS.NEWSLETTER)

await expect(page.getByRole('heading', { name: SECTION_HEADINGS.NEWSLETTER })).toBeVisible()

await expect(dashboard.topNav().getByRole('link', { name: TOP_NAV.SEARCH_JOBS })).toBeVisible()

await expect(dashboard.topNav().getByRole('link', { name: TOP_NAV.SOCIAL_WALL })).toBeVisible()
})

test('Resources menu opens Travel Nurse Resource Hub', async ({ page }) => {

const dashboard = new DashboardPage(page)

await dashboard.goto()

await dashboard.openResourcesMenuLink(
RESOURCES_MENU_LINK.TRAVEL_NURSE_RESOURCE_HUB,
/\/travel-nurse-resource-hub/i
)

await expect(page).toHaveURL(/\/travel-nurse-resource-hub/i)
})

test('Footer exposes key community links', async ({ page }) => {

const dashboard = new DashboardPage(page)

await dashboard.goto()

await dashboard.scrollFooterLinkIntoView(FOOTER_LINK.ABOUT_US)

await expect(page.locator('footer').getByRole('link', { name: FOOTER_LINK.ABOUT_US })).toBeVisible()

await dashboard.scrollFooterLinkIntoView(FOOTER_LINK.RESOURCES)

await expect(page.locator('footer').getByRole('link', { name: FOOTER_LINK.RESOURCES })).toBeVisible()
})

})
