const express = require("express");
const router = express.Router();
const userController = require('../controller/userController');
const userService = require('../services/userRender');
const middlewares = require('../middleware/UserMiddleware');

// Home
router.get("/", middlewares.isUserLogged,userService.home);

// SignupuserController
router.get("/signup", userService.signup); // Render signup page
router.post('/api/signupUser', userController.newUser); // Save new user

// Signin
router.get("/signin", userService.signin);  // Render signin page
router.post("/api/signinUser", userController.alreadyUser); // Verify if user already exists

router.get("/forgot-password",userService.forgotPasswordPage);
router.post('/sendResetPasswordOTP',userController.checkEmail);
router.post('/changePassword',userController.changePassword);
// OTP
router.get('/otpLogin', userService.otpLogin);
router.post('/verifyOTP', userController.otp);
router.get('/resendOTP', userController.resendOTP);

// Product Page
router.get('/products', userController.product);
router.get('/product-Details',userService.productDetailsPage);


module.exports = router;
