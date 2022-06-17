const router = require('express').Router();
const UserCollection = require('../models/UserCollection');
const OtpCollection = require('../models/OtpCollection');
// const { transporter } = require('../utils/SendMail');
const upload = require('../middleware/MulterMiddleware');
const { userSignup, userLogin, optVerfication } = require('../controller/UserController');


router.post('/user/signup', userSignup)

router.post('/user/signin', userLogin)

router.post('/user/otp/verification', optVerfication)

// router.post('/user/profile/update', upload.single('profileImage'), async (req, res) => {
//     try {
//         const user = await UserCollection.findByIdAndUpdate(req.body._id, { image: req.file.filename }, { new: true })

//         return res.status(200).json({ message: "Image Uploaded Successfully", user })

//     } catch (err) {
//         // console.log(err)
//         return res.status(500).json({ error: "Internal Server Error", err })
//     }
// })




module.exports = router;