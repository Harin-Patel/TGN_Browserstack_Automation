class LoginPage {

constructor(page){
this.page = page
}

async navigate(){

await this.page.goto('/')

}

async login(email,password){

await this.page.getByRole('link', { name: 'Login or Create Account' }).click()

await this.page.getByRole('link', { name: 'Sign in here' }).click()

await this.page.getByLabel('Email Address').fill(email)

await this.page.getByLabel('Password').fill(password)

await this.page.getByRole('button', { name: 'Log In' }).click()
}

}

module.exports = { LoginPage }