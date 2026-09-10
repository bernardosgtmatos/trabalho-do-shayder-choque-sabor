const express = require('express');
const {newProduct ,} = require('../controllers/EventsController.js');

const userRoute = express();

userRoute.post('/', newProduct)

module.exports = userRoute;