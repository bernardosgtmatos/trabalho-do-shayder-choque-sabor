require('dotenv').config();

const express = require('express');
const app = express();
const cors = require('cors');
const { configDotenv } = require('dotenv')

const port = process.env.PORT || 8080

// Middlewares
app.use(cors());
app.use(express.json());


app.listen(port, () => {
    console.log(`rodando na porta ${port}`);
});
