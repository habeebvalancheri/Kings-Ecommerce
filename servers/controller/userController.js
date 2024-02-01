const userDB = require('../model/userSchema');
const userOtpVerification = require('../model/userOtpVerificationSchema');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const productDB = require('../model/productSchema');
const { render } = require('ejs');
dotenv.config();

// creating nodemailer transport
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
  secure: true,  // secure option
});

console.log(process.env.AUTH_EMAIL);

const sendOtpVerificationEmail = async ({ _id, email,otpPurpose }) => {
  try {
    // Generate OTP
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;
    console.log(otp);

    // Define email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter ${otp} in the app to verify your email address and complete the signin</p>`,
    };

    // Hash OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Create new OtpVerification document
    const newOtpVerification = await new userOtpVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiredAt: Date.now() + 60000000,
    });
    
    // Save OTP
    await newOtpVerification.save();

    // Send email
    await transport.sendMail(mailOptions);
  } catch (error) {
    console.error(error);
  }
};

// Signup controller
module.exports = {
  newUser: async (req, res) => {
    try {

       // Clear session data related to errors
    req.session.errorName = '';
    req.session.errorEmail = '';
    req.session.errorPassword = '';
    req.session.errorPassword2 = '';
    req.session.checkPassword = '';
    req.session.errorPhone = '';
    req.session.errorPattern = '';

      // Form validation
      if (!req.body.name){
        req.session.errorName = "Name is required!";
      }
      if (!req.body.email){
        req.session.errorEmail = "Email is required!";
      } 
      if (!req.body.phone){
        req.session.errorPhone = "Phone Number is required!";
      } 
      if (!req.body.password){
        req.session.errorPassword = "Password is required!";
      } 
      if (!req.body.confirmPassword){
        req.session.errorPassword2 = "Password is required!";
      } 

      if (req.body.password !== req.body.confirmPassword) {
        req.session.checkPassword = "The Password is not matching!";
      }

      const phoneNumber = req.body.phone;
      if (!/^\d{10}$/.test(phoneNumber)) {
        req.session.errorDigits = "Phone Number is not 10 digits long!";
      }

      req.session.phone = req.body.phone;
      const emailPattern = /^[a-zA-Z0-9._-]+@gmail\.com$/;
      if (!emailPattern.test(req.body.email)) {
        req.session.errorPattern = "Invalid Pattern!";
      }
      
      if(req.body.checkbox == ''){
        req.session.terms = "Accept Terms and Conditions";
      }
      // Check if user already exists
      const existingUser = await userDB.findOne({ email: req.body.email });
      if (existingUser) {
        req.session.userExists = "Email is already registered";
        return res.redirect("/signup");
      }
     

      // Check if there are any validation errors
      if (
        req.session.errorName ||
        req.session.errorEmail ||
        req.session.errorPassword ||
        req.session.errorPassword2 ||
        req.session.checkPassword ||
        req.session.errorPhone ||
        req.session.errorPattern ||
        req.session.terms 
      ) {
        console.log('register error');
        return res.redirect("/signup");
      }

     
      // Hashing password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);

      // Create new user
      const user = new userDB({
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
        block: false,
        verified: false,
      });

      req.session.Id = user._id;

      // Save user
      const savedUser = await user.save();
      req.session.email = req.body.email;

      // Send OTP verification email
      sendOtpVerificationEmail(savedUser);

      res.render("otpLogin", {
        email: user.email,
        id: savedUser._id,
        otp: savedUser.otp,
      });
    } catch (err) {
      console.error(err);
      return res.status(400).redirect("/signup");
    }
  },

  alreadyUser: async (req, res) => {
    try {

      req.body.errorEmail = '';
      req.body.errorPassword = '';
      req.body.errorPattern = '';

      // Form validation
      if (!req.body.email) req.session.errorEmail = "Email is required";
      if (!req.body.password) req.session.errorPassword = "Password is required";
      if (!/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)) {
        req.session.errorPattern = "This Email is not valid!";
      }

      // Check if there are any validation errors
      if (req.body.errorEmail || req.body.errorPassword || req.body.errorPattern) {
        return res.status(400).redirect("/signin");
      }

      const { email: inputEmail, password: inputPassword } = req.body;
      const user = await userDB.findOne({ email: inputEmail,block:false});

      if (user) {
        const isPasswordMatch = await bcrypt.compare(inputPassword, user.password);

        if (isPasswordMatch) {
          // Password matched
          req.session.isLogged = true;
          req.session.email = user.email;
          return res.redirect('/');
        } else {
          // Password not match
          req.session.isNotValidate = true;
          return res.redirect('/signin');
        }
      } else {
        req.session.userNotRegistered = "Invalid Credential";
        return res.redirect('/signin');
      }
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: "Error retrieving user" });
    }
  },

  otp: async (req, res) => {
    
    try {
      let {email, userId, one, two, three, four, five, six } = req.body;
      let otp = one + two + three + four + five + six;
      
      req.session.email = email;
      if (!userId || !otp) {
        throw new Error("Empty otp details are not allowed");
      }

      // Fetch user OTP verification record
      const userOtpVerificationRecord = await userOtpVerification.find({
        userId,
      });

      if (userOtpVerificationRecord.length <= 0) {
        // No records found
        throw new Error("Account record doesn't exist or has been verified already. Please sign up or sign in");
      } else {
        // User OTP record exists
        const { expiredAt } = userOtpVerificationRecord[0];
        const hashedOTP = userOtpVerificationRecord[0].otp;

        if (expiredAt < Date.now()) {
          // User OTP record has expired
          await userOtpVerification.deleteMany({ userId });
          throw new Error("Code has expired. Please request again");
        } else {
          console.log('hi');
          const validOTP = await bcrypt.compare(otp, hashedOTP);
          if (!validOTP) {
            // OTP is wrong
            throw new Error("Invalid code passed. Check your inbox.");
          } else {
            // Success
            console.log(userId);
            await userDB.updateOne({ _id: userId }, { verified: true });
            await userOtpVerification.deleteMany({ userId });
            res.redirect('/');
          }
        }
      }
    } catch (error) {
      res.json({
        status: "Failed",
        message: error.message,
      });
    }
  },

  resendOTP: async (req, res) => {
    try {
    
      const email = req.session.email;
      const userId = req.session.Id;
      console.log(userId,'resend page in user side');
      if ( !userId || !email){
        throw new Error("Empty user details are not allowed");
      } else {
        
        await userOtpVerification.deleteMany({ userId });
        // Send a new OTP
        await sendOtpVerificationEmail({_id:userId,email });

      }
    } catch (error) {
      res.json({
        status: "Failed",
        message: error.message,
      });
    }
  },
  

  product: async (req, res) => {
    try {
      const products = await productDB.find();
      console.log(products);
      return res.render('home');
    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
  },

  checkEmail: async (req, res) => {
    try {
      let { email } = req.body;
      console.log(email);
      
      // Fetch user with the provided email
      const user = await userDB.findOne({ email });
  
      if (user) {
        // User found, send OTP for forgot password
        await sendOtpVerificationEmail({ _id: user._id, email, otpPurpose: 'forgotPassword' });
        res.render('otpLogin',{id:user._id,email}); // Assuming 'otpLogin' is your OTP verification page
      } else {
        // User not found
        res.redirect('/verifyEmail');
      }
    } catch (error) {
      console.error(error);
      res.status(400).send('Something went wrong');
    }
  },
  // Add this function to your userController
  changePassword: async (req, res) => {
  try {
    const { userId, newPassword, confirmPassword } = req.body;

    // Validate the new password and confirm password
    if (newPassword !== confirmPassword) {
      throw new Error("Passwords do not match");
    }

    // Hash the new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update the user's password in the database
    await userDB.updateOne({ _id: userId }, { password: hashedPassword });

    // Redirect to a success page or login page
    res.redirect('/signin');
  } catch (error) {
    console.error(error);
    res.status(400).send('Something went wrong');
  }
}

  
};
