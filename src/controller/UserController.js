const UserCollection = require("../models/UserCollection")
const OtpCollection = require("../models/OtpCollection")
const sendMail = require("../utils/SendMail")
const { generateMaiTemplate, afterMailVerifiedTemplate } = require("../utils/Subject")
const bcrypt = require("bcryptjs")


exports.userSignup = async (req, res) => {
    try {
        const { name, email, password, number } = req.body

        if (number.length < 10) {
            return res.status(400).json({ error: "Number Should Not Less than 10 Digit" })
        }

        const isUserAlreadyExist = await UserCollection.findOne({ email })

        if (isUserAlreadyExist && isUserAlreadyExist.isEmailVerified) {
            return res.status(401).json({ error: "User Already Exist Please use another Gmail" })

        } else if (isUserAlreadyExist && !isUserAlreadyExist.isEmailVerified) {
            await UserCollection.findByIdAndDelete(isUserAlreadyExist._id)
        }

        const bcryptPass = await bcrypt.hash(password, 12)

        const user = new UserCollection({ name, email, password: bcryptPass, number })

        const otp = Math.ceil(1000 + Math.random() * 412)

        const otpCol = new OtpCollection({ userId: user._id, otp })

        await user.save()
        await otpCol.save()

        // calling sendMail function to send mail for verify otp
        sendMail({ email, subject: "Verify Your Email Account", text: generateMaiTemplate(otp) })

        return res.status(200).json({ message: "Signup Successfully", userId: user._id })

    } catch (err) {
        // console.log(err)
        return res.status(500).json({ error: "Internal Server Error", err })
    }
}


exports.userLogin = async (req, res) => {
    try {
        const { email, password } = req.body

        const isUserAlreadyExist = await UserCollection.findOne({ email })
        if (!isUserAlreadyExist) {
            return res.status(404).json({ error: "No Account Found Please First SignUp" })
        }

        const comparePassword = await bcrypt.compare(password, isUserAlreadyExist.password)

        if (!comparePassword) {
            return res.status(401).json({ error: "Invalid Credential" })
        }

        const userDoc = isUserAlreadyExist._doc
        delete userDoc.password

        return res.status(200).json({ message: "Login Successfully", user: userDoc })

    } catch (err) {
        // console.log(err)
        return res.status(500).json({ error: "Internal Server Error", err })
    }
}


exports.optVerfication = async (req, res) => {
    try {
        let { userId, otp } = req.body

        // for user
        const isUserExist = await UserCollection.findById(userId)

        if (isUserExist.isEmailVerified) {
            return res.status(401).json({ error: "This account is already verified" })
        }

        // for otp
        const isOtpAvailable = await OtpCollection.findOne({ userId })

        if (!isOtpAvailable) {
            return res.status(404).json({ error: "Otp Expired Please Signup Again" })
        }

        // const isOtpMatch = await bcrypt.compare(otp, isOtpAvailable.otp)
        if (otp != isOtpAvailable.otp) {
            return res.status(400).json({ error: "OTP not match please enter correct OTP" })
        }

        isUserExist.isEmailVerified = true
        await isUserExist.save()

        await OtpCollection.findByIdAndDelete(isOtpAvailable._id)

        const userDoc = isUserExist._doc
        delete userDoc.password

        sendMail({ email: isUserExist.email, subject: "Gmail Verified Successfully", text: afterMailVerifiedTemplate("Welcome to the Global Chat Platform, Start Chatting With your friends and make new friends, Thanks.") })

        return res.status(200).json({ message: "Gmail Verified Successfully", user: userDoc })

    } catch (err) {
        // console.log("OTP Verification Error : ", err)
        return res.status(500).json({ error: "Internal Server Error", err })
    }
}