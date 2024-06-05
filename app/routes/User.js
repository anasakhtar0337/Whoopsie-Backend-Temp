const express = require("express")
const router = express.Router();
const checkApiToken = require('../Middleware/CheckApiToken');
const UserController = require("../Controllers/Api/User/UserController");
const multer = require("multer");
const apiAuthentication = require("../Middleware/ApiAuthentication");
const UserOTPController = require("../Controllers/Api/User/UserOTPController");
const OTPTokenAuthentication = require("../Middleware/OTPTokenAuthentication");
const UserApiTokenController = require("../Controllers/Api/User/UserApiTokenController");
const upload = multer()


router.get("/", (req, res) => {
    res.send("hello world from test");
})


/*----------------------------------   OTP Routes  ------------------------------*/
router.post('/send-otp', checkApiToken, (req, res) => (new UserOTPController()).store({ request: req, response: res }))
router.post('/verify-otp/register', checkApiToken, (req, res) => (new UserOTPController()).verifyOTPRegister({ request: req, response: res }))
router.post('/verify-otp/change-number', checkApiToken, (req, res) => (new UserOTPController()).verifyOTPChangeNumber({ request: req, response: res }))

/*----------------------------------   User Configure Account Routes  ------------------------------*/
router.patch('/', apiAuthentication, (req, res) => (new UserController()).update({ request: req, response: res }))
router.patch('/device-token', apiAuthentication, (req, res) => (new UserApiTokenController()).update({ request: req, response: res }))
router.patch('/change-number', OTPTokenAuthentication.authenticate, (req, res) => (new UserController()).changePhoneNumber({ request: req, response: res }))
router.delete('/', checkApiToken, apiAuthentication, (req, res) => (new UserController()).destroy({ request: req, response: res }))
router.post('/login', checkApiToken, (req, res) => (new UserController()).login({ request: req, response: res }))
router.post('/logout', apiAuthentication, (req, res) => (new UserController()).logout({ request: req, response: res }))

module.exports = router;