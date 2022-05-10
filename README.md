# ExpressJs-Practice

*This is a practice for ExpressJs and integrated with MySQL! 💕*

> This has been a fun experience coding the backend and a little of frontend.

> I learnt a lot during the making of this project and I hope that I can keep improving this project in future's time.

### Explaination of the Project

> This project is about making a simple signup, login and logout web app that uses sessions in order to keep the UX as wanted! The data of the users will be stored into a MySQL database. In this project, I also focused on handling errors such that servers can respond to errors they way it should do! This project is made to enhance my understanding using ExpressJs for making a website and the backend side of the server. Currently, all server side logics are stored in the `server.js` file and has not yet used an external middleware/router file.

### Current features

- Log in:  
  - Users input their username and password.
  - The server side will check whether the account exist by querying into MySQL.
  - Once the account is authenticated, session will be activated and determine that user is logged in.
  - After so, users will be redirected to their home page respectively.
  - If the authentication fails, then user are redirected to the log in page again, and again.
  - All password entered is hash encoded using SHA-256 algorithm. This is done using *js-sha256*.

- Sign up:
  - Users are asked to input their username, email, and password.
  - The server side will check whether the email is a valid email or not. This is done using *deep-email-validator* package.
  - If not then user are sent back to the sign up page for them to enter a valid email.
  - Once validated, the server side will check whether an account with the same email or username has existed.
  - If existed then, again, user are sent back to the sign up page.
  - If it has not existed, then user successfully signed up and an email will be sent to them -- a welcome email!
  - After successfully signed up, user are sent to their respective home page.
  - All password are hash encoded using SHA-256 algorithm. This is done using *js-sha256*.

- Home Page:
  - Having a search box to get meaning of words from the New KBBI API and display the cleaned result onto page!

### Future plan of the Project

> The future for this project is to make a interactive web ui with html, css, and javascript as a practice for me to sharpen my frontend skills too. Aside, from that, I would also like to add some cool features to this project such as making user histories and using the New KBBI API for word searches. Basically, mastering the backend! The frontend is just an extra. But what is very important to me is error handling and security. I really hope that I can implement web security features into this project! Also, I would also like to make this app to run in https rather than http. 

**Thank you all and have a great day! 😁**

*This is the list of commands for the git! Just in case.*

`git remote add origin https://github.com/rmscoal/ExpressJs-Practice.git`

`git branch -M main`

`git add .`

`git commit -m "Initial Commit"`

`git push -u origin main`
