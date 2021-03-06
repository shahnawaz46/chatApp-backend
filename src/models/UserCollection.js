const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        require: true,
        unique: true
    },
    number: {
        type: Number,
        required: true
    },
    password: {
        type: String,
        required: true,
    },
    online: {
        type: Boolean,
        default: false
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
    friends: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'users'
        }
    ],
    notifications: [
        {
            userId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: 'users'
            },
            message: { type: String }
        }
    ]

}, { timestamps: true })

const UserCollection = mongoose.model("users", userSchema)

module.exports = UserCollection;