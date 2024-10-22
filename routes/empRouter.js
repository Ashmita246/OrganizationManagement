const express = require('express');
const router = express.Router();
const { register, login, logout, dashboard } = require('../controller/empController');
const Employee = require('../models/employeeModel');
const passport = require( '../config/passport' );
const {forwardAuth, backwardAuth, preventRenderingLoginPageEmp} = require('../config/auth')
const { log } = require('async');
// Registration Page
router.get('/register', (req, res) => {
    res.render('../views/frontend/empRegister.ejs');
});

// Login Page
router.get('/login', preventRenderingLoginPageEmp,(req, res) => {
    res.render('../views/frontend/empLogin.ejs');
});

// Dashboard Page
router.get('/dashboard', backwardAuth,(req, res) => {
    if (!req.isAuthenticated()) {
      console.log("not auth");
        return res.redirect('/emp/login');
    } else {
        console.log("User is authenticated");

        // Fetch the authenticated user's data and pass it to the dashboard template
        Employee.findByPk(req.user.id)
            .then(foundUser => {
                // Additional operations after fetching user data if needed
                res.render('../views/frontend/empDashboard.ejs', { employee: foundUser });
            })
            .catch(err => {
                console.error("Error:", err);
                // Handle error if necessary
                res.status(500).send("Internal Server Error");
            });
    }
});

// Registration form submission
router.post('/register', register);

// Login form submission
router.post('/login', (req, res, next) => {
   passport.authenticate('employee', (err, user, info) => {

    if(err=="password"){
      var data = {
        title: "Incorrect Password"
      }
      return res.json(data)
    }
  else  if(err=="no employee"){
      var data = {
        title: "no user"
      }
      return res.json(data)
    }

    else {    
      req.logIn(user , () => {
        var data  = {
          title: "success"
        }
        return res.json(data)
      })
    }
    // console.log(user);
    // console.log(info);
    // addition check

  })(req, res, next);
}, (req, res) => {
    // This function will be called if authentication is successful
    res.redirect('/emp/dashboard');
  });
 
  router.get('/logout', logout);

module.exports = router;
