const express = require('express');
const CreateUser = require('../controllers/UserController.js');
const { newProduct } = require('../controllers/EventsController.js');

const OwnerRoute = express();
//OwnerRoute.js
OwnerRoute.post('/NovoUsuario', CreateUser)
OwnerRoute.post('/NovoProduto', newProduct)

module.exports = OwnerRoute;