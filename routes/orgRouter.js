const express = require('express')
const router = express.Router()
const {register, login, logout, dashboard} = require('../controller/orgController')
const {forgotPassword, resetPassword} = require('../controller/authController')
const Organization = require('../models/organizationModel')
const Employee = require('../models/employeeModel')
const {forwardAuth, backwardAuth, orgLogin} = require('../config/auth')
const passport = require( '../config/passport' )
 

//@route: 
///org/register/ -> registration page of the organization
router.get('/register',(req,res)=>{
     res.render('../views/frontend/orgRegister.ejs');
});

//@route:
// org/login/ -> login page of the ogranization
router.get('/login' ,orgLogin, (req,res)=>{
    res.render('../views/frontend/orgLogin.ejs');
});

//@route:
// org/dashboard/ -> dasboard of the ogranization
router.get('/dashboard',  backwardAuth, async(req,res)=>{ 
  try {
    // Fetch employee data from the database
    const employees = await Employee.findAll(); // Assuming you want to fetch all employees

    // Render the template with the employee data
    res.render('../views/frontend/orgDashboard.ejs', { employees });
  } catch (error) {
      // Handle any errors
      console.error('Error fetching employee data:', error);
      res.status(500).send('Internal Server Error');
    }
});
router.get('/forgotPassword',(req,res)=>{
  res.render('../views/frontend/forgotPassword.ejs')
})
// Render the reset password form
router.get('/resetPassword/:token', (req, res) => {
  const token = req.params.token;
  res.render('../views/frontend/resetPassword.ejs', { token });
});





router.route("/forgotPassword").post(forgotPassword);  

router.post('/resetPassword/:token', resetPassword);
router.route("/register").post(register);

// POST request for user login
router.post('/login', (req, res, next) => {
  passport.authenticate('organization', (err, user, info) => {

    if(err=="password"){
      var data = {
        title: "Incorrect Password"
      }
      return res.json(data)
    }
  else  if(err=="no user"){
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
  })(req, res, next);
}, (req, res) => {
  // This function will be called if authentication is successful
  
  res.redirect('/org/dashboard');
}, forwardAuth);

router.get('/logout', logout);
// router.route("/login").post(login);
router.route("/forgotPassword").post(forgotPassword);  
router.route("/resetPassword/:token").post(resetPassword);

router.put('/id/:employeeId', async (req, res) => {
  try {
    const employee = await Employee.findOne({ where: { id: req.params.employeeId } });

    if (!employee) {
      return res.status(404).json({ error: 'Employee not found' });
    }

    // Sending the employee object as a JSON response
    res.json({ employee });
    // res.redirect('/org/dashboard')
  } catch (error) {
    // If there's an error during database query or processing, send an error response
    console.error('Error fetching employee:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
})

// Define the route handler for GET /updateEmployee
router.route('/dashboard').put(dashboard);


// Define the route handler for GET /deleteEmployee
router.get('/deleteEmployee/:id', async (req, res) => {
  const { id } = req.params;

  try {
    // Find the employee by ID and delete it
    const deletedEmployee = await Employee.destroy({
      where: {
        id: id
      }
    });

    if (deletedEmployee === 0) {
      return res.status(404).send('Employee not found');
    }

    // Redirect back to the employees page after deletion
    res.redirect('/org/dashboard');
  } catch (error) {
    console.error('Error:', error);
    res.status(500).send('Failed to delete employee');
  }
});

module.exports = router;