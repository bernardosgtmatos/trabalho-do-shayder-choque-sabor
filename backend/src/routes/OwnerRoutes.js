const express = require('express');
const {CreateUser, login} = require('../controllers/UserController.js');
const { newProduct, listPedidos } = require('../controllers/EventsController.js');
const auth = require('../middleware/authorization.js')
const upload = require('../middleware/Upload.js')

const OwnerRoute = express();
//OwnerRoute.js
OwnerRoute.post('/login',login)
OwnerRoute.post('/NovoUsuario',auth, CreateUser)
OwnerRoute.post('/NovoProduto',auth, upload.single('imagem'), newProduct) //valida user -> faz upload -> cria produto no banco 
OwnerRoute.get('/Pedidos',auth, listPedidos)

module.exports = OwnerRoute;