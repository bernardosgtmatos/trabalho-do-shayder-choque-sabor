const express = require('express');
const {newOrder ,} = require('../controllers/EventsController.js');

const EventRoute = express();
//EventRoute.js
EventRoute.post('/Pedido', newOrder)

module.exports = EventRoute;