require("dotenv").config();

const express = require("express");
const LocalStrategy = require("passport-local").Strategy;
const bodyParser = require("body-parser");
const mysql = require("mysql2");
 const session = require("express-session");
const MySQLStore = require("express-mysql-session")(session);
const bcrypt = require("bcryptjs");
const Swal=require('sweetalert2');
const orgRouter = require('./routes/orgRouter');
const empRouter = require('./routes/empRouter');
const path = require('path');
const {forwardAuth, backwardAuth, orgLogin} = require('./config/auth')


// Configure session middleware
const { connection, sequelize } = require('./config/dbconnection');
const passport = require("passport");

const sessionStore = new MySQLStore({
  expiration: 1000 * 60 * 60 * 24, // Session duration: 1 day
  schema: {
    tableName: 'Sessions', // Change this if needed
    columnNames: {
      session_id: 'session_id',
      expires: 'expires',
      data: 'data'
    }
  }
}, connection);

const app = express();
 app.use(
  session({
    secret: "secret", // Change this to a secure random key
    resave: false,
    saveUninitialized: false,
    store: sessionStore,
    cookie: {
      maxAge: 1000 * 60 * 60 * 24, // Session duration: 1 day
    },
  })
)

/*----------------------prevent user from navigation BACK------------------------*/
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

/*----------------------PASSPORT AUTHENTICATION------------------------*/

require("./config/passport");

app.use(passport.initialize());
app.use(passport.session());

app.use((req, res, next) => {
  // console.log(req.session);
  // console.log(req.user);
  next()
})



//Static files
app.use(express.static('public'))
app.use('/css', express.static(__dirname + 'public/css'))
app.use('/assets', express.static(__dirname + 'public/assets'))
app.use('/js', express.static(__dirname + 'public/js'))
app.set('/views', path.join(__dirname, 'views'));


app.use(express.json())
app.use(express.urlencoded())

app.set("view engine", "ejs");

app.use('/org', orgRouter);
app.use('/emp', empRouter);
// Route for the root path '/'
app.get('/', (req, res) => {
  let authuser;
  if (req.isAuthenticated()) {
    authuser = req.user;
    console.log('index', req.user.role);
  } else {
    authuser = false;
  }
  res.render('frontend/index', { authuser, role: req.user ? req.user.role : null });
});
 


app.listen(process.env.PORT, () => {
  console.log(`Server started at port ${process.env.PORT}`);
});
