const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');

test('User Logout', async ({ page }) => {

const loginPage = new LoginPage(page)

await loginPage.navigate()

await loginPage.login(
'james@mailinator.com',
'Harin123'
)

// open profile menu
await page.locator("//button[@class='relative flex items-center gap-3 px-4 py-2 bg-white border-2 border-gray-200 rounded-xl transition-all shadow-sm group']").click()

// click logout
await page.getByText('Log Out').click()

// handle confirmation dialog
await page.locator('span:has-text("Log Out")').first().click()

})