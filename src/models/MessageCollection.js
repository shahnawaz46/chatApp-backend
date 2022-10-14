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
            senderId: {
                type: String,
                required: true
            },
            receiverId: {
                type: String,
                required: true
            },
            message: {
                type: String
            },
            messageId: {
                type: String,
                required: true
            },
            time: {
                type: Date,
                required: true
            },
            receiverSeen: {
                type: Boolean,
                default: false
            },
            mediaURL: {
                type: String,
            }
        }
    ]
})

module.exports = mongoose.model("message", messageSchema)