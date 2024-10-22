const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Employee = require("../models/employeeModel");
const nodemailer= require('nodemailer');
const transport = require('../config/nodemailer');
const mailUser = process.env.EMAIL_USER;
const Org= require('../models/organizationModel')
 

//@desc register
//@routes /emp/register/
//@public
const register = asyncHandler(async (req, res) => {
  const { userName, organization, email, password, department, position, startDate, salary, isActive } = req.body;

  console.log(req.body);
  console.log(userName);
  // Check if all required fields are provided
  if (!userName || !organization || !email || !password || !department || !position || !startDate || !salary) {
    res.status(400);
    throw new Error("All fields are mandatory!!!");
  }

  // Check if the user already exists
  const existingEmployee = await Employee.findOne({ 
    where: { email } 
  });

  if (existingEmployee) {
    res.status(400);
    throw new Error("Employee already registered!!!");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 4);

  // Create a new employee
  const employee = await Employee.create({
    userName, // Assign merged username to name field
    email: email,
    password: hashedPassword,
    organization,
    department,
    position,
    startDate,
    salary,
    isActive
  });

  // Respond with the created employee data
  res.status(201).json({
    _id: employee._id, // Assuming "_id" is the unique identifier for the employee
    userName: employee.userName, // Sending back the username as "name" for consistency
    email: employee.email,
    organization: employee.organization,
    department: employee.department,
    position: employee.position,
    startDate: employee.startDate,
    salary: employee.salary,
    isActive: employee.isActive
  });
  const mailOptions = {
    to: email,
    from: mailUser,
    subject: 'Employee Login ID and Password',
    text: `Your login credentials for the employee portal are as follows:\n\nEmail: ${email}\nPassword: ${password}\n\nYou can log in at http://localhost:5502/emp/login`,
    html: `<p>Dear ${userName},</p><p>Your login credentials for the employee portal are as follows:</p><p>Email: ${email}</p><p>Password: ${password}</p><p>You can log in <a href="http://localhost:5502/emp/login">here</a>.</p>`
  };
  

transport.sendMail(mailOptions, function(err) {
    if (err) {
        console.error('Error sending email:', err);
        return res.status(500).json({ error: 'Error sending email' });
    }
    console.log('Email sent');
    res.status(200).json({ message: `An e-mail has been sent to ${email} with further instructions.` });
});
});

///@desc Post login
//@routes Post /org/login
//@access public
const login = asyncHandler(async (req, res) => {
 
  const { email, organization, password } = req.body;
  console.log(req.body);

  if (!email ||!organization || !password) {
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  try {
    // Retrieve user from the database
    const employee = await Employee.findOne({ where: { email:req.body.email } });
    console.log(employee);

    if (!employee) {
      return res.status(400).json({ message: "Email not found" });
    }
    console.log('email checked');

    console.log(employee.password);
    const isPasswordValid = await bcrypt.compare(password, employee.password);
    if (!isPasswordValid) {
      console.log('password is incorrect');
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Store user ID in session
    req.session.userId = employee.id;

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    // Handle error
    console.error("Login Error:", error.message); // Log the error message
    res.status(500).json({ message: "Internal Server Error" });
  }
});

///@desc get dashboard
//@routes Get /org/dashboard
//@access public
const dashboard = asyncHandler(async (req, res) => {
  // Fetch data required for the employee's dashboard
  // For example, you might want to fetch employee information, tasks, notifications, etc.
  // Once you have the necessary data, render the dashboard template

  // Example of fetching employee data
  const employee = await Employee.findOne({ where: { id: req.session.userId } });
  if (!employee) {
    return res.status(404).json({ message: "Employee not found" });
  }

  // Render the dashboard template with the employee data
  res.render('../views/frontend/employeeDashboard.ejs', { employee });
});

//@desc Logout
//@routes POST /org/logout
//@access private
const logout = asyncHandler(async (req, res) => {
  // Destroy the session
  req.session.destroy(function(err) {
    if (err) {
      console.error('Error destroying session:', err);
    }
    
    // Clear the session cookie
    res.clearCookie('connect.sid'); // Replace 'connect.sid' with your session cookie name
      
 
    // Redirect the user to a desired page after logout
    res.redirect('/'); // You can redirect to any other page
  });
});





module.exports = { register, login, logout}
