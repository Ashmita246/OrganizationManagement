
const { Sequelize } = require('sequelize');
require("dotenv").config();
const mysql = require("mysql2");

const sequelize = new Sequelize(process.env.DATABASE, 'root', process.env.PASSWORD, {
    host: process.env.HOST,
    dialect: 'mysql',
    multipleStatements: true,
    logging: false,
    sync: false, // Disable automatic synchronization
    alter: false, // Disable automatic schema alterations.
 });

sequelize.authenticate()
  .then(() => {
    console.log('Connected to the database.');
  })
  .catch(err => {
    console.error('Unable to connect to the database:', err);
  });


const connection = mysql.createConnection({
    host: process.env.HOST,
    user: 'root',
    password: process.env.PASSWORD,
    database: process.env.DATABASE,
    multipleStatements: true,
  });
  
  connection.connect((err) => {
    if (!err) {
      console.log("Connected to database!");
    } else {
      console.log("Connection failed.");
    }
  });
module.exports= { connection, sequelize }