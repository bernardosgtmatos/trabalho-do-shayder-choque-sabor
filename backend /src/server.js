require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const { configDotenv } = require('dotenv')

const port = process.env.PORT || 8080

//import routes
const userRoute = require('./routes/UserRoutes.js')


// Middlewares
app.use(cors());
app.use(express.json());

app.use('/admin', userRoute)

app.listen(port, () => {
    console.log(`rodando na porta ${port}`);
});
