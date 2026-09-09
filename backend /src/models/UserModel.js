const { DataTypes } = require('sequelize');
const sequelize = require('../config/Database.js');
const bcrypt = require('bcryptjs');

const owner = sequelize.define('owner' ,{ //admin
    nome: {
        type: DataTypes.STRING,
        AllowNull: false,
    },
    email: {
        type: DataTypes.STRING,
        AllowNull: false,
        unique : true,
        validate: {
            isEmail: true
        }
    },
    senha: {
        type: DataTypes.STRING,
        allowNull: false,
    },
}, {
    defaultScope: {
        attributes: { exclude: ['senha'] }
    },

});

owner.sync({alter: true})
module.exports = {owner}