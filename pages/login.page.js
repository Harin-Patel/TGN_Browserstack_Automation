class LoginPage {

constructor(page){
this.page = page
}

async navigate(){

await this.page.goto('/')

}

async login(email,password){

await this.page.goto('/login', { waitUntil: 'domcontentloaded', timeout: 60000 })

await this.page.locator('#email').first().waitFor({ state: 'visible', timeout: 30000 })

await this.page.locator('#email').first().fill(email)

await this.page.locator('#password').first().fill(password)

await this.page.getByRole('button', { name: 'Log In' }).click()
}

async loginAndExpectJobsLanding(email,password){

await this.login(email, password)

await this.page.waitForURL(/\/jobs/i, { timeout: 60000 })
}

}

module.exports = { LoginPage }