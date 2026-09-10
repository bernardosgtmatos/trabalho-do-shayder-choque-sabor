const express = require('express');
const {newProduct ,} = require('../controllers/EventsController.js');

const EventRoute = express();

EventRoute.post('/', newProduct)

module.exports = EventRoute;