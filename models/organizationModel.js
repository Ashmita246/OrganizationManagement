const { Sequelize, DataTypes } = require('sequelize');
const {sequelize} = require('../config/dbconnection');
const bcrypt = require('bcryptjs');

const Org = sequelize.define('organizationModel', {
    id: {
        type: Sequelize.UUID,
        defaultValue: Sequelize.UUIDV4,
        primaryKey: true,
        allowNull: false
    },
    name: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    password: {
        type: DataTypes.STRING,
        allowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        allowNull: false,
        
    },
    role:{
        type:DataTypes.STRING,
        defaultValue: 'org'
    },
    resetPasswordToken: {
        type: DataTypes.STRING,
        allowNull: true
    },
    resetPasswordExpires: {
        type: DataTypes.DATE,
        allowNull: true
    }
}, 
{
    tableName: 'orgs' // Specify the table name as 'orgs'
});

Org.beforeCreate(async (org) => {
    const hashedPassword = await bcrypt.hash(org.password, 4);
    org.password = hashedPassword;
});

sequelize.sync({ alter: true }) // Pass `{ force: true }` to drop existing tables before syncing


module.exports = Org;
