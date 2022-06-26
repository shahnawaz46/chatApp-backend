const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema({
    user1: {
        type: String,
        required: true
    },
    user2: {
        type: String,
        required: true
    },
    key: {
        type: String,
        unique: true,
        required: true
    },
    messages: [
        {
            from: {
                type: String,
                required: true
            },
            to: {
                type: String,
                required: true
            },
            message: {
                type: String,
                required: true
            },
            time: {
                type: Date,
                required: true
            }
        }
    ]
})

module.exports = mongoose.model("message", messageSchema)