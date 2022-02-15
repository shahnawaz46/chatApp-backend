const mongoose = require("mongoose")
const dotenv = require("dotenv");

dotenv.config()

const URI = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASSWORD}@chatapp.uoprc.mongodb.net/${process.env.DATABASE}?retryWrites=true&w=majority`

const Connection = async () => {
    try {
        await mongoose.connect(URI, {
            useNewUrlParser: true, useUnifiedTopology: true
        })
        console.log("Database Connected")
    } catch (error) {
        console.log(error)
    }
}

module.exports = Connection