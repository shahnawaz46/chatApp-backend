const router = require('express').Router();
const { userSignup,
    userLogin,
    optVerfication,
    searchUser,
    updateProfilePic,
    updateStatus } = require('../controller/UserController');


router.post('/user/signup', userSignup)

router.post('/user/signin', userLogin)

router.post('/user/otp/verification', optVerfication)

router.post('/user/search', searchUser)

router.post('/user/profile/update', updateProfilePic)

router.post('/user/status/update', updateStatus)

module.exports = router;