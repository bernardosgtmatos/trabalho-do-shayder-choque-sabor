const express = require('express');
const {CreateUser,} = require('../controllers/UserController.js');

const OwnerRoute = express();

OwnerRoute.use('/', CreateUser)

module.exports = OwnerRoute;