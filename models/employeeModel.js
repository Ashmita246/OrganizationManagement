const { Sequelize, DataTypes } = require('sequelize');
const { sequelize } = require('../config/dbconnection');
const bcrypt = require('bcryptjs');

const Employee = sequelize.define('employees', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
     },
     userName: {
        type: DataTypes.STRING,
        allowNull: true,
      },
    organization: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false, 
    },
    department: {
        type: DataTypes.STRING,
        defaultValue: 'General' // Default value for department
      },
      position: {
        type: DataTypes.STRING
      },
      startDate: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: Sequelize.NOW // Set default value to current date
      },
      salary: {
        type: DataTypes.DECIMAL(10, 2),
        allowNull: false
      },
      role:{
          type:DataTypes.STRING,
          defaultValue: 'emp'
      },
      isActive: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true // Default value for isActive
      }
},{
    tableName: 'Employee' // Specify the table name as 'Employee'
});

Employee.beforeCreate(async (org) => {
    const hashedPassword = await bcrypt.hash(org.password, 4);
    org.password = hashedPassword;
});

sequelize.sync({ alter: true }) // Pass `{ force: true }` to drop existing tables before syncing

module.exports = Employee;
