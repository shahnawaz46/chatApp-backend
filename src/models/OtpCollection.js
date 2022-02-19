const mongoose = require('mongoose')

const otpSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'users',
        required: true
    },
    otp: {
        type: Number,
        default: null
    },
    createdAt: {
        type: Date,
        expires: 600,
        default: Date.now
    }
})

module.exports = mongoose.model("otp", otpSchema)