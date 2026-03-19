class RegisterPage {

constructor(page){
this.page = page
}

async openViaTopNavJoinTheScrubSociety(){

await this.page.goto('/')

await this.page.locator('nav.fixed').getByRole('link', { name: 'Join The Scrub Society' }).click()

await this.page.waitForURL(/register/i)

await this.page.locator('form').filter({ has: this.page.locator('#firstName') }).waitFor({ state: 'visible' })
}

async submitNewUserRegistration({ firstName, lastName, mobileNumber, email, password }){

const form = this.page.locator('form').filter({ has: this.page.locator('#firstName') })

await form.locator('#firstName').fill(firstName)
await form.locator('#lastName').fill(lastName)
await form.locator('#mobileNumber').fill(mobileNumber)
await form.locator('#email').fill(email)
await form.locator('#password').fill(password)
await form.locator('#confirmPassword').fill(password)

await this.page.locator('#agreeToTerms').check()

await Promise.all([
this.page.waitForURL(/\/onboarding/i, { timeout: 90000 }),
form.getByRole('button', { name: 'Register' }).click()
])
}


}

module.exports = { RegisterPage }
