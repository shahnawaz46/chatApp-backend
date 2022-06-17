const express = require('express');
require("./src/database/Connection")();
const dotenv = require("dotenv");
const cors = require("cors");
const userRouter = require('./src/routes/UserRouter');

dotenv.config()

// app
const app = express()

// middleware
app.use(cors({ origin: true, credentials: true }))
app.use(express.json())
app.use(express.static('public'))


// routes
app.use('/api', userRouter)


const Port = process.env.PORT || 9000

// server connection
const server = app.listen(Port, () => {
    console.log(`Server is Running at Port No ${Port}`)
})

app.use('/api', userRouter)