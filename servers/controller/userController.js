
const userDB = require('../model/userSchema');
const userOtpVerification = require('../model/userOtpVerificationSchema');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const dotenv = require('dotenv');
dotenv.config();


// creating nodemailer transport
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
  secure: true,
});


console.log(process.env.AUTH_EMAIL)
const sendOtpVerificationEmail = async ({ _id, email }) => {
  try {
    // Generate OTP
    const otp = `${Math.floor(100000 + Math.random() * 900000)}`;

    // Define email options
    const mailOptions = {
      from: process.env.AUTH_EMAIL,
      to: email,
      subject: "Verify Your Email",
      html: `<p>Enter ${otp} in the app to verify your email address and complete the signin</p>`
    };

    // Hash OTP
    const hashedOTP = await bcrypt.hash(otp, 10);

    // Create new OtpVerification document
    const newOtpVerification = await new userOtpVerification({
      userId: _id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiredAt: Date.now() + 60000000
    });

    // Save OTP
    await newOtpVerification.save();

    // Send email
    await transport.sendMail(mailOptions, (error) => {
      if (error) {
        console.log(error);
      } else {
        console.log("OTP sent successfully");
      }
    });

    console.log("Calling sendOtpVerificationEmail...");

  } catch (error) {
    console.error(error);
  }
};

// Signup controller
module.exports = {
  newUser: async (req, res) => {
    try {
      if (!req.body.name) {
        req.session.errorName = "Name is required!";
      }
      if (!req.body.email) {
        req.session.errorEmail = "Email is required!";
      }
      if (!req.body.phone) {
        req.session.errorPhone = "Phone Number is required!";
      }
      if (!req.body.password) {
        req.session.errorPassword = "Password is required!";
      }
      if (!req.body.confirmPassword) {
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

      const existingUser = await userDB.findOne({ email: req.body.email });

      if (existingUser) {
        req.session.userExists = "Email is already registered";
      }

      if (
        req.session.errorName ||
        req.session.errorEmail ||
        req.session.errorPassword ||
        req.session.errorPassword2 ||
        req.session.checkPassword ||
        req.session.errorPhone ||
        req.session.errorPattern ||
        req.session.userExists
      ) {
        console.log("hi")
        return res.redirect("/signup");
      }

      // How long the hash is
      const saltRounds = 10;

      // Hashing password
      const hashedPassword = await bcrypt.hash(req.body.password, saltRounds);
      const user = new userDB({
        block: "false",
        name: req.body.name,
        email: req.body.email,
        password: hashedPassword,
        phone: req.body.phone,
        status: "true",
        verified: false,
      });

      // user email 
      const userEmail = user.email;

      // user not verified
      req.session.verified = "false";

      // save user
      const savedUser = await user.save();

      // verify user through otp by sending email
      console.log("Calling sendOtpVerificationEmail...");
      sendOtpVerificationEmail(savedUser)
      res.render("otpLogin", {
        email: userEmail,
        id: savedUser._id,
        otp: savedUser.otp,
      });


    } catch (err) {
      console.error(err);
      return res.status(400).redirect("/signup");
      
    }
  },

  alreadyUser : async (req, res) => {
    try {
      if (!req.body.email) {
        req.session.errorEmail = "Email is required";
        
      }
      if (!req.body.password) {
        req.session.errorPassword = "Password is required";
        
      }
      if (!/^[A-Za-z0-9]+@gmail\.com$/.test(req.body.email)) {
        req.session.errorPattern = "This Email is not valid!";
      }
      if(req.body.errorEmail || req.body.errorPassword || req.body.errorPattern){
        return res.status(400).redirect("/signin")
      }
  
      const { email: inputEmail, password: inputPassword } = req.body;
      const user = await userDB.findOne({ email: inputEmail });
  
      if (user) {
        const isPasswordMatch = await bcrypt.compare(inputPassword, user.password);
  
        if (isPasswordMatch) {
          // Password matched
          req.session.isLogged = true;
          req.session.name = user.name;
          return res.render('otpLogin',{email:req.body.email,id:user._id});
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
  }
}



  

