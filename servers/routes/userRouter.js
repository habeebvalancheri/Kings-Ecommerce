const express = require("express")
const router = express.Router();
const userController = require('../controller/userController');
const userService = require('../services/userRender');



// Register
router.get("/signup",userService.signup); // Register render
router.post('/api/signupUser',userController.newUser); // For saving new user

// Login
router.get("/signin",userService.signin);  // Login render
router.post("/api/signinUser", userController.alreadyUser); // Verify already a user

// OTP
router.get('/otpLogin',userService.otpLogin);


module.exports = router;