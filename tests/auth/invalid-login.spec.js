const { test, expect } = require('@playwright/test');
const { LoginPage } = require('../../pages/login.page');

test('Invalid Login Attempt', async ({ page }) => {

const loginPage = new LoginPage(page)

await loginPage.navigate()

await loginPage.login(
'invalid@email.com',
'wrongpassword'
)

// verify error message
await expect(page.getByText('Invalid email or password. Please check your credentials and try again.')).toBeVisible()

})