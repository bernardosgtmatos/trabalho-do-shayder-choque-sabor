require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const { configDotenv } = require('dotenv')

const port = process.env.PORT || 8080

//import routes
const EventRoute = require('./routes/EventRoutes.js')
const OwnerRoute = require('./routes/OwnerRoutes.js')


// Middlewares
app.use(cors());
app.use(express.json());
//server.js
app.use('/Admin', OwnerRoute)
app.use('/Cliente', EventRoute)

app.listen(port, () => {
    console.log(`rodando na porta ${port}`);
});
