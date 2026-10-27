const express = require('express');
const {CreateUser, login, me} = require('../controllers/UserController.js');
const { newProduct, listPedidos, NewCategoria, listProdutosAdmin, getProduto, updateProduct, deleteProduct, listCategorias } = require('../controllers/EventsController.js');
const auth = require('../middleware/authorization.js')
const upload = require('../middleware/Upload.js')

const OwnerRoute = express();
//OwnerRoute.js
OwnerRoute.post('/login',login)
OwnerRoute.get('/Me', auth, me)
OwnerRoute.post('/NovoUsuario',auth, CreateUser)
OwnerRoute.post('/NovoProduto',auth, upload.single('imagem'), newProduct) //valida user -> faz upload -> cria produto no banco 
OwnerRoute.get('/Pedidos',auth, listPedidos)
OwnerRoute.get('/Produtos', auth, listProdutosAdmin)
OwnerRoute.get('/Produtos/:id', auth, getProduto)
OwnerRoute.put('/Produtos/:id', auth, upload.single('imagem'), updateProduct)
OwnerRoute.delete('/Produtos/:id', auth, deleteProduct)
OwnerRoute.get('/Categorias', auth, listCategorias)
OwnerRoute.post('/NovaCategoria', auth, NewCategoria)

module.exports = OwnerRoute;