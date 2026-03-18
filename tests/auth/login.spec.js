const { test,expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');

test('User Login', async ({ page }) => {

const loginPage = new LoginPage(page)

await loginPage.navigate()

await loginPage.login(
'james@mailinator.com',
'Harin123'
)
// verify successful login
await expect(page).toHaveURL(/jobs/i)
})