const asyncHandler = require("express-async-handler");
const bcrypt = require("bcryptjs");
const Organization = require("../models/organizationModel");
const Org = require("../models/organizationModel");
const Employee = require("../models/employeeModel");

//@desc register
//@routes /org/register/
//@public
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  // Check if all required fields are provided
  if (!name || !email || !password) {
    res.status(400);
    throw new Error("All fields are mandatory!!!");
  }

  // Check if the user already exists
  const existingOrganization = await Organization.findOne({ 
    where: { email 
    } 
  });
    console.log(existingOrganization);
  if (existingOrganization) {
    res.status(400);
    throw new Error("User already registered!!!");
  }

  // Hash the password
  const hashedPassword = await bcrypt.hash(password, 4);

  // Create a new organization
  const organization = await Organization.create({
    name,
    email: email.trim(),
    password: hashedPassword,
  });

  // Respond with the created organization data
  res.status(201).json({
    _id: organization._id,
    username: organization.name,
    email: organization.email,
  });
});

///@desc Post login
//@routes Post /org/login
//@access public
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password) {
    // Display SweetAlert error message if email or password is missing
    return res.status(400).json({ message: "All fields are mandatory" });
  }

  try {
    const organization = await Org.findOne({ where: { email:req.body.email } });

    if (!organization) {
      // Display SweetAlert error message if email is not found
    
      return res.status(400).json({ message: "Email not found" });
    }
    
    const isPasswordValid = await bcrypt.compare(password, organization.password);

    if (!isPasswordValid) {
      // Display SweetAlert error message if password is incorrect
      
      console.log('password is incorrect');
      return res.status(400).json({ message: "Incorrect password" });
    }

    // Store user ID in session
    req.session.userId = organization.id;
    console.log('session id: '+ req.session.userId );
    console.log('organization id: '+ organization.id );

    

    res.status(200).json({ message: "Login successful" });
  } catch (error) {
    console.error("Login Error:", error.message); // Log the error message
    
    res.status(500).json({ message: "Internal Server Error" });
  }
});

///@desc get dashboard
//@routes Get /org/dashboard
//@access public
const dashboard = asyncHandler(async (req, res) => {
  const { id, userName, organization, email, department, position, startDate, salary, isActive } = req.body;

  try {
    // Find the employee by ID
    const employee = await Employee.findOne({ where: { id } });

    if (!employee) {
      // If employee with the given ID is not found, return 404
      return res.status(404).json({ message: "Employee not found" });
    }

    // Define the new data for update
    const newData = {
      userName,
      organization,
      email,
      department,
      position,
      startDate,
      salary,
      isActive
    };

    // Update the employee with the new data
    await employee.update(newData);

    res.status(200).json({ message: "Employee updated successfully" });
  } catch (error) {
    console.error("Update Error:", error.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
});


//@desc Logout
//@routes GET /org/logout
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

module.exports = { register, login, logout, dashboard}
