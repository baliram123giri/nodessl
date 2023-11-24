const { userLogin, userDetails, updateAccountInfo, forgotPassword, resetPassword, logoutUser } = require("../Controllers/user/user.controller");
const { normalAuth } = require("../Utils/auth.utils");

const router = require("express").Router();

router.post('/login', userLogin);

router.get('/user-info', normalAuth(), userDetails);
router.post('/update-account-info', normalAuth(), updateAccountInfo);
router.post('/forgot-password', forgotPassword);

router.post('/reset-password', resetPassword);

module.exports = router
