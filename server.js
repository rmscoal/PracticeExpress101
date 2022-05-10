/*
  @ modules or framework imports
*/
const express = require('express');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const server = express(); // name of the app changed to server... app.get() -> server.get()
const mysql = require('mysql');
const { v4: uuidv4 } = require('uuid');
const emailValidator = require('deep-email-validator');
const nodemailer = require('nodemailer');
const sha256 = require('js-sha256').sha256;

/*
  @ fancy ports
*/
const port = process.env.PORT || "8080";

/*
  @ mysql connection for getting signups and logins for users
*/
var con = mysql.createConnection({
  host: '<Enter host here>',
  user: '<Enter user here>',
  password: '<Enter password here>',
  database: '<Enter database here>',
});

/*
  @ checks if email is valid
*/
async function isEmailValid(email) {
  return emailValidator.validate(email);
}

/*
  @ nodemailer to send emails during signing up
*/
async function mail(email) {
  let transporter = nodemailer.createTransport({
    host: "<Enter host here>", // this is for gmail account senders
    port: '<Write your port here. 587 or 465>', // use 465 for SSL
    secure: '<True or false>', // true for SSL
    auth: {
      user: '<Enter you email here>',
      pass: '<Enter password here>'
    }
  });

  let info = await transporter.sendMail({
    from: 'This is Practicing Express', // this is just a dummy mail
    to: email,
    subject:"Hello and Welcome 🥳", // this is just a dummy mail
    text: '<Write your text here!>', // this is just a dummy mail
    html: '<Write HTML code here>' // this is just a dummy mail
  }, function (err) {
    if (err) throw err; // less likely to appear an error since destination email is valid
  }); // error might appear if sender email has issues
}

/*
  @ view engine
*/
server.set('views', 'src-static/templates');
server.set('view engine', 'ejs');

/*
  @ body request parser
*/
server.use(express.json());
server.use(express.urlencoded({extended: true}));
server.use(cookieParser());

/*
  @ use session
*/
server.use(session({
	secret: process.env.SESSION_SECRET || '<Enter your secret here>',
  key: '<Enter your key here>',
  cookie: {secure: false}, 
  // secure true is for https connections!
	resave: true,
	saveUninitialized: true
}));

/*
  @ use static for javacript files!
*/
server.use(express.static('src-static'));

/*
  @ server routes
*/
server.get('/', function (req, res) {
  // the if statement checks whether users are logged in
  if (!req.session.loggedin) {
    res.render('home', {username:''});  // if they are not they can open the login page
    res.end();
  } else {
    res.redirect('/home');  // if they are they are sent to their respectives homepage!
  }
})

server.route('/signup')
  .get((req,res) => {
    if (!req.session.loggedin) { // if users are not loggedin
      res.render('signup', {});
      res.end();
    } else { // if users are loggedin
      res.redirect('/home');
    }
  })
  .post(async function (req,res) {
    // store the requests body into variables for simplicity
    const {username, email, password} = req.body;

    // check whether email isValid
    const {valid, reason, validators} = await isEmailValid(email);

    // here this means that none of the username, email and password are blanks
    if (username && email && password) {
      // check if account has existed or not
      var checker = `select * from users where username = ? or email = ?`
      // start of checker queries
      con.query(checker, [username, email], function (err, resultChecker) {
        // if there is an error
        if (err) {
          res.render('500');
          res.end();
        }

        // this if handles that there are no user with username and email above
        if (typeof resultChecker != 'undefined' && resultChecker.length == 0){

          // on valid
          if (valid) {

            const userID = uuidv4();

            //start putting email to database
            var values = [
              [userID, username, email, sha256(password)]
            ];
            var sql = `insert into users (id, username, email, password) values ?`;
            con.query(sql, [values], function (err, resultPush) {
              // here we handle errors such that the servers doesn't shut down

              // first error is for server errors or ECONNREFUSED error
              if (err) {
                res.render('500');
                res.end();
              }

              // this if statement handles successfully created account
              if (typeof resultPush != 'undefined' && resultPush.affectedRows > 0) {
                // response from the server would be 'SUCCESSFUL' and then go to the homepage!
                req.session.loggedin = true; // since user has signed up then he will be logged in!
                req.session.username = username; // the session username will be the username entered in the query!
                req.session.userID = userID; // the session userid

                // send email to user
                mail(email);

                // send redirect response to homepage
                res.redirect('/home');
              }
            })
          } else {
            // outputs the reason of validEmail and stores the value of the input fields
            let context = {
              haveFilled: true,
              username: username,
              email: email,
              password: password,
              validEmail: false,
              message: validators[reason].reason
            };

            res.render('signup', context)
          }
        }
        // this handles if account has existed and stores the value of the input fields
        if (typeof resultChecker != 'undefined' && resultChecker.length > 0){
          let context = {
            haveFilled: true,
            exist: true,
            username: username,
            email: email,
            password: password
          };
          res.render('signup', context);
        }
      })

    } else {
      // this would pop up some warning for empty fields!
      let context = {
        haveFilled: true,
        username: username,
        email: email,
        password: password,
        empty: true
      };

      res.render('signup', context);
      res.end();
    }
    // for developing purpose, send email to users after signing up!
  })

server.route('/login')
  // get method for log in
  .get((req, res) => {
    if (!req.session.loggedin || req.session.loggedin === false) {
      context = {empty: false, verified: null}
      res.render('login', context);
      res.end();
    } else {
      res.send('You are logged in!');
    }
  })
  // post method for log in
  .post((req, res) => {
    // defining variables
    // const {username, password} = req.body;
    const username = req.body.username;
    const password = sha256(req.body.password);

    if (username && password) {
      // using con.connect will cause error 'Cannot set headers after they are sent out the client'
      // The above error is caused by have already sent a response to the client, however we try
      // to overwrite the response again

      // sql query
      var sql = `select * from users where username = ? and password = ?`;

      con.query(sql, [username, password], function (err, result, fields) {
        // here we handle errors such that the servers doesn't shut down

        // the first if handles a query error... for example ECONNREFUSED error... database connection error
        // even though there are no connection to the database, it still outputs result from the query of type 'undefined'
        if (err) {
          res.render('500');
          res.end();
        }

        // in this if statement, we handle result that are defined and that are of length more than 0
        if (typeof result != 'undefined' && result.length > 0) {
          // using session
          req.session.loggedin = true;
          req.session.username = username;
          req.session.userID = result[result.length - 1].id;

          // redirect to home page after successfully loggin in
          res.redirect('/home');
        }

        // lastly in this if statement, we handle result that are defined however has result of length 0
        // in other words this if statement handles fail authentication
        if (typeof result != 'undefined' && result.length == 0) {
          // context for users input the wrong username or password
          req.session.loggedin = false;
          let context = {verified: false};

          // response send to the client for wrong authentication
          res.render('login', context);
          res.end(); // ending the respone would be neccessary to avoid the above error!
        }
        res.end(); // to avoid headers problems
      });
      // end of query

    // context for users filling blanks in the fields
    } else {
      // this is for empty fields during loggin in
      let context = {empty: true}

      // response
      res.render('login', context);
      res.end();
    }
  });

server.route('/home')
  // get home for users after log in or sign up and indicate whether users have signed in!
  .get((req,res) => {
    if (!req.session.loggedin) {
      res.redirect('login');
    } else res.render('home', {username: req.session.username});
  })

server.route('/logout')
  // this will handle logout requests
  .post((req, res) => {
    req.session.destroy();

    // response
    res.redirect('/');
  })

/*
  @ starting of the server ©
*/
server.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
