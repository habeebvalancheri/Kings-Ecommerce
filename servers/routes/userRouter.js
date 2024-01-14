const express = require("express")
const router = express.Router();
const userController = require('../controller/userController');
const userService = require('../services/userRender');


// Register
router.get("/signup",userService.signup); // Register render
