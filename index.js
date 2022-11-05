const express = require('express')
const app = express()
const port = process.env.PORT || 5000;
const cors = require('cors')
var jwt = require('jsonwebtoken');
require('dotenv').config();

//Middleware 
app.use(cors())
app.use(express.json())