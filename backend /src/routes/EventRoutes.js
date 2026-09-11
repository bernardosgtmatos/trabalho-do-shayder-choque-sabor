const express = require('express');
const {newOrder , listProdutos} = require('../controllers/EventsController.js');

const EventRoute = express();
//EventRoute.js
EventRoute.post('/Pedido', newOrder)
EventRoute.get('/Produtos', listProdutos)

module.exports = EventRoute;