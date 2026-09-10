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

User.beforeCreate(async (user) => {
    const salt = await bcrypt.genSalt(10);
    user.senha = await bcrypt.hash(user.senha, salt); //haseia a senha antes de salvar
});

User.beforeUpdate(async (user) => {
    if (user.changed('senha')) {
        const salt = await bcrypt.genSalt(10);
        user.senha = await bcrypt.hash(user.senha, salt); //hasheia a senha quando troca 
    }
});


User.prototype.validSenha = async function (senha) {
    return await bcrypt.compare(senha, this.senha);
};


// owner.sync({alter: true})
module.exports = {owner}