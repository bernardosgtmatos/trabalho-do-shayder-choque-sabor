require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const { configDotenv } = require('dotenv')

const port = process.env.PORT || 8080

//import routes
const EventRoute = require('./routes/EventRoutes.js')
// const OwnerRoute = require('./routes/OwnerRoutes.js') ta crashando deixar comentando por enquanto


// Middlewares
app.use(cors());
app.use(express.json());

app.use('/admin', EventRoute)

app.listen(port, () => {
    console.log(`rodando na porta ${port}`);
});
