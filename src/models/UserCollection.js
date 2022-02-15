const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        require: true
    },
    number: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    image: {
        type: String,
        default: null
    },
    about: {
        type: String,
        default: null
    },
    isEmailVerified: {
        type: Boolean,
        default: false
    },
    socketId: {
        type: String,
        default: null
    }

}, { timestamps: true })

const UserCollection = mongoose.model("users", userSchema)

module.exports = UserCollection;