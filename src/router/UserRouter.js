const router = require('express').Router();
const UserCollection = require('../models/UserCollection');
const OtpCollection = require('../models/OtpCollection');
const { transporter } = require('../utils/SendMail');
const upload = require('../middleware/MulterMiddleware');

// api
router.post('/user/signup', async (req, res) => {
    try {
        const { name, email, password, number } = req.body

        const isUserAlreadyExist = await UserCollection.findOne({ email })
        if (isUserAlreadyExist && isUserAlreadyExist.isEmailVerified) {
            return res.status(401).json({ error: "User Already Exist Please Signin" })

        } else if (isUserAlreadyExist && !isUserAlreadyExist.isEmailVerified) {
            await UserCollection.findByIdAndDelete(isUserAlreadyExist._id)
        }

        const otp = Math.ceil(1000 + Math.random() * 412)

        const user = new UserCollection({ name, email, password, number })
        const userOtp = new OtpCollection({ userId: user._id, otp })


        await user.save()
        await userOtp.save()

        res.status(200).json({ message: "Signup Successfully", userId: user._id })
        // const userDoc = {
        //     _id: user._id,
        //     name: user.name,
        //     email: user.email,
        //     number: user.number
        // }

        // return res.status(200).json({ message: "Signup Successfully", user: { ...userDoc } })

        transporter.sendMail({
            from: "From GlobalTalk frowebformail@gmail.com", // sender address
            to: email, // list of receivers
            subject: "Verify Your Email Account", // Subject line
            html: `<h1>${otp}</h2>`, // html body
        })


    } catch (err) {
        // console.log(err)
        return res.status(500).json({ error: "Internal Server Error", err })
    }
})


router.post('/user/signin', async (req, res) => {
    try {
        const { email, password } = req.body

        const isUserAlreadyExist = await UserCollection.findOne({ email })
        if (!isUserAlreadyExist) {
            return res.status(404).json({ error: "No Account Found Please First SignUp" })
        }

        if (!(password === isUserAlreadyExist.password)) {
            return res.status(401).json({ error: "Invalid Credential" })
        }

        const userDoc = isUserAlreadyExist._doc
        delete userDoc.password

        return res.status(200).json({ message: "Login Successfully", user: userDoc })

    } catch (err) {
        // console.log(err)
        return res.status(500).json({ error: "Internal Server Error", err })
    }
})


router.post('/user/profile/update', upload.single('profileImage'), async (req, res) => {
    try {
        const user = await UserCollection.findByIdAndUpdate(req.body._id, { image: req.file.filename }, { new: true })

        return res.status(200).json({ message: "Image Uploaded Successfully", user })

    } catch (err) {
        // console.log(err)
        return res.status(500).json({ error: "Internal Server Error", err })
    }
})


router.post('/user/otp/verification', async (req, res) => {
    try {
        let { userId, otp } = req.body
        console.log(userId, otp);

        // for user
        const isUserExist = await UserCollection.findById(userId)

        if (!isUserExist) {
            return res.status(404).json({ error: "No User Found Please Signup Again" })
        }

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

        res.status(200).json({ message: "Gmail Verified Successfully", user: userDoc })

        transporter.sendMail({
            from: "From GlobalTalk frowebformail@gmail.com", // sender address
            to: isUserExist.email, // list of receivers
            subject: "Verify Your Email Account", // Subject line
            html: `<h3>Email Verified Successfully Thanks to Join Our Team Hopefully You will Enjoy This Journy</h3>`, // html body
        })

    } catch (err) {
        // console.log("OTP Verification Error : ", err)
        return res.status(500).json({ error: "Internal Server Error", err })
    }
})


module.exports = router;