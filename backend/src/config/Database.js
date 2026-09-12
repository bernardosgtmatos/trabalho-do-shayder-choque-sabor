const { Sequelize } = require('sequelize')
const path  = require('path')
const { defaultMaxListeners } = require('events')
const { timeStamp } = require('console')

const sequelize = new Sequelize({
    dialect: 'sqlite', //define o tipo do banco
    storage: path.join(__dirname, '../../database.sqlite'), // define onde vai ser salvo 
    logging: false,
    define: {
        timeStamp: true //define como config global
    }
});

module.exports = sequelize