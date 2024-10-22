// Import required modules
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const Organization = require('../models/organizationModel');
const Employee = require('../models/employeeModel');
const bcrypt = require("bcryptjs");
const { JSON } = require('sequelize');
const { log } = require('async');

// Define custom fields for different types of users

// Configure Passport to use LocalStrategy for username/email and password authentication
passport.use('employee', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async function(email, password, done) {
  try {
    // Find organization by email
    const employee = await Employee.findOne({ where: { email } });
    // console.log(organization);
    
    // If organization is not found or password is incorrect, return false
    if (!employee)
      {  
        // console.log('xaina');
        var err = 'no employee'
        return done(err)
      }
     if(!(await bcrypt.compare(password, employee.password))) {
      var err = 'password'
      return done(err)
    }

    // If organization is found and password is correct, return the organization object
    return done(null, employee);
  } catch (err) {
    // If an error occurs, pass it to the done function
    return done(err); // Ensure proper error handling
  }
}));

passport.use('organization', new LocalStrategy({ usernameField: 'email', passwordField: 'password' }, async function(email, password, done) {
  try {
    // Find organization by email
    const organization = await Organization.findOne({ where: { email } });
    // console.log(organization);
    // console.log('s'+organization);
    
    // If organization is not found or password is incorrect, return false
    if (!organization ) {  
      // console.log('xaina');
      var err = 'no user'
      return done(err)
    }

    if(!(await bcrypt.compare(password, organization.password))){
      var err = 'password'
      return done(err)
    }

    // If organization is found and password is correct, return the organization object
    return done(null, organization);
  } catch (err) {
     return done(err); // Ensure proper error handling
  }
}));

// Serialize and deserialize user functions
passport.serializeUser(function(user, done) {
  done(null, user.id);
});
passport.deserializeUser(async function(id, done) {
  try {
    // Retrieve user data from the database using id
    let user;
    user = await Organization.findByPk(id) 

    if(!user){
      user =  await Employee.findByPk(id)
    }

    // console.log('user', user);
    
    // If user is not found, return false
    if (!user) {
      return done(null, false);
    }

    // If user is found, return the user object
    return done(null, user);
  } catch (err) {
    // If an error occurs, return the error
    return done(err); // Ensure proper error handling
  }
});

// Export configured Passport instance
module.exports = passport;