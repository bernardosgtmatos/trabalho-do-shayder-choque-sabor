const express = require('express');
const {CreateUser, login} = require('../controllers/UserController.js');
const { newProduct, listPedidos } = require('../controllers/EventsController.js');
const auth = require('../middleware/authorization.js')

const OwnerRoute = express();
//OwnerRoute.js
OwnerRoute.post('/login',login)
OwnerRoute.post('/NovoUsuario',auth, CreateUser)
OwnerRoute.post('/NovoProduto',auth, newProduct)
OwnerRoute.get('/Pedidos',auth, listPedidos)

module.exports = OwnerRoute;