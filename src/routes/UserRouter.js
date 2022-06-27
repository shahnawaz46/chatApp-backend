const router = require('express').Router();
const { userSignup,
    userLogin,
    optVerfication,
    searchUser,
    updateProfilePic } = require('../controller/UserController');
const upload = require("../middleware/MulterMiddleware")


router.post('/user/signup', userSignup)

router.post('/user/signin', userLogin)

router.post('/user/otp/verification', optVerfication)

router.post('/user/search', searchUser)

router.post('/user/profile/update', upload.single('profileImage'), updateProfilePic)
// async (req, res) => {
//     try {
//         const user = await UserCollection.findByIdAndUpdate(req.body._id, { image: req.file.filename }, { new: true })

//         return res.status(200).json({ message: "Image Uploaded Successfully", user })

//     } catch (err) {
//         // console.log(err)
//         return res.status(500).json({ error: "Internal Server Error", err })
//     }
// })




module.exports = router;