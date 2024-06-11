const userDB = require("../model/userSchema");
const userOtpVerification = require("../model/userOtpVerificationSchema");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const dotenv = require("dotenv");
const productDB = require("../model/productSchema");
const categoryDB = require("../model/categorySchema");
const cartDB = require("../model/cartSchema");
const wishListDB = require("../model/wishListSchema");
const walletDB = require("../model/walletSchema");
const couponDB = require("../model/couponSchema");
const { Types: { ObjectId } } = require('mongoose');  
const { default: test } = require("node:test");
const addressDB = require("../model/addressSchema");
const orderDB = require('../model/orderSchema');
const { redirectIfUserLoggedIn } = require("../middleware/UserMiddleware");
const RazorPay = require('razorpay')
const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env;

const razorPayInstance = new RazorPay({
   key_id: RAZORPAY_ID_KEY, 
   key_secret: RAZORPAY_SECRET_KEY, 
  
  })


dotenv.config();

// creating nodemailer transport
const transport = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.AUTH_EMAIL,
    pass: process.env.AUTH_PASS,
  },
  secure: true, // secure option
});

console.log(process.env.AUTH_EMAIL);

const sendOtpVerificationEmail = async (req, res, { email }) => {
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
    const saltRound = 10;
    const hashedOTP = await bcrypt.hash(otp, saltRound);

    // Create new OtpVerification document
    console.log(Date.now());
    const newOtpVerification = await new userOtpVerification({
      userId: req.session.id,
      otp: hashedOTP,
      createdAt: Date.now(),
      expiredAt: Date.now() + 60000,
    });

    // Save OTP
    await newOtpVerification.save();
    console.log(newOtpVerification);
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
      req.session.errorName = "";
      req.session.minName = "";
      req.session.errorEmail = "";
      req.session.errorPattern = "";
      req.session.errorPhone = "";
      req.session.errorDigits = "";
      req.session.errorPassword = "";
      req.session.errorconfirmPassword = "";
      req.session.checkPassword = "";
      req.session.passInclude = "";
      req.session.confirmPassInclude = "";
      req.session.terms = "";
      req.session.userExists = "";
      
      // Remove white spaces
      const name = req.body.name.trim();
      const email = req.body.email.trim();
      const phone = req.body.phone.trim();
      const password = req.body.password.trim();
      const confirmPassword = req.body.confirmPassword.trim();

      req.session.email = email;
      req.session.phone = phone;

      // Form validation
      // check if name is empty
      if (!name) {
        req.session.errorName = "Name is required!";
      }
      
      // check if name have 3 to 20 characters
      // Regular expression to allow only characters
      const nameRegex = /^[A-Za-z]+$/;

      if (!(nameRegex.test(name) && name.length >= 3 && name.length <= 30)) {
        req.session.minName =
          "Name should be between 3 and 30 characters and contain only letters!";
      }

      // check if email is empty
      if (!email) {
        req.session.errorEmail = "Email is required!";
      }
      // check if email have correct pattern
      const emailPattern = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.(com|in)$/;
      if (!emailPattern.test(email)) {
        req.session.errorPattern = "Invalid Pattern!";
      }
      // check if phone Number is empty
      if (!phone) {
        req.session.errorPhone = "Phone Number is required!";
      }
      // Regular expression to allow only numbers
      const phoneRegex = /^\d+$/;

      if (!phoneRegex.test(phone) || phone.length !== 10) {
        req.session.errorDigits =
          "Phone Number should be 10 digits long and contain only numbers!";
      }

      // check if password is empty
      if (!password) {
        req.session.errorPassword = "Password is required!";
      }
      // check if confirmPassword is empty
      if (!confirmPassword) {
        req.session.errorconfirmPassword = "Password is required!";
      }
      // check if password matching or not
      if (password !== confirmPassword) {
        req.session.checkPassword = "The Password is not matching!";
      }
      // Regular expression to allow only letters and numbers
      const passwordRegex = /^(?=.*[a-zA-Z])(?=.*[0-9])[A-Za-z0-9]{8,}$/;

      if (!passwordRegex.test(password)) {
        req.session.passInclude =
          "The password should include at least one letter, one number, and be a minimum of 8 characters in length.";
      }

      // check if confirmPassword include both characters and numbers
      if (!passwordRegex.test(confirmPassword)) {
        req.session.confirmPassInclude =
          "The password should include at least one letter, one number, and be a minimum of 8 characters in length.";
      }
      // check if checkBox is empty
      if (!req.body.checkbox) {
        req.session.terms = "Accept Terms and Conditions";
      }

      // Check if user already exists
      const existingUser = await userDB.findOne({ email: email });
      if (existingUser) {
        req.session.userExists = "Email is already registered";
      }
      
      // Check if there are any validation errors
      if (
        req.session.errorName ||
        req.session.minName ||
        req.session.errorEmail ||
        req.session.errorPattern ||
        req.session.errorPhone ||
        req.session.errorDigits ||
        req.session.errorPassword ||
        req.session.errorconfirmPassword ||
        req.session.checkPassword ||
        req.session.passInclude ||
        req.session.terms ||
        req.session.userExists
      ) {
        console.log("register error");
        return res.redirect("/signup");
      }

      // Hashing password
      const saltRounds = 10;
      const hashedPassword = await bcrypt.hash(password, saltRounds);

      // Create new user
      const user = new userDB({
        name: name,
        email: email,
        password: hashedPassword,
        phone: phone,
      });

      // Save user
      await user.save();
      req.session.isAuthenticated = true;
      req.session.id = user._id;
      req.session.email = user.email;
      // Send OTP verification email
      await sendOtpVerificationEmail(req, res, { email: user.email });
      return res.redirect("/otpLogin");
    } catch (err) {
      console.error(err);
      return res.status(400).redirect("/signup");
    }
  },

  alreadyUser: async (req, res) => {
    try {
      req.session.errorEmail2 = "";
      req.session.errorPassword2 = "";
      req.session.passInclude2 = "";
      req.session.errorPattern2 = "";
      req.session.userNotRegistered = "";
      req.session.isNotValidate = "";
      req.session.userNotRegistered = "";

      // Remove white Spaces
      const inputEmail = req.body.email.trim();
      const inputPassword = req.body.password.trim();

      // Form validation

      if (!inputEmail) {
        req.session.errorEmail2 = "Email is required";
      }
      if (!inputPassword) {
        req.session.errorPassword2 = "Password is required";
      }
      const trimmedEmail = inputEmail.trim();
      console.log("Trimmed Email:", trimmedEmail);

      if (!/^[A-Za-z0-9]+@[a-zA-Z]+\.(com|in)$/.test(trimmedEmail)) {
        req.session.errorPattern2 = "Invalid email pattern!";
      } else if (trimmedEmail !== inputEmail) {
        req.session.errorPattern2 =
          "Email should not have leading or trailing spaces!";
        res.redirect("/signin");
      }

      // check if password includes both characters and numbers
      const passwordInclude = /^(?=.*[a-zA-Z])(?=.*[0-9]).{8,}$/;
      if (!passwordInclude.test(inputPassword)) {
        req.session.passInclude2 =
          "The password should include at least one letter, one number, and be a minimum of 8 characters in length.";
      }

      // Check if there are any validation errors
      if (
        req.session.errorEmail2 ||
        req.session.errorPassword2 ||
        req.session.errorPattern2 ||
        req.session.passInclude2
      ) {
        return res.redirect("/signin");
      }
      const user = await userDB.findOne({ email: inputEmail });

      if (!user || user.block === true) {
        // User not found or blocked
        req.session.userNotRegistered =
          "User is not registered or account is blocked";
        return res.redirect("/signin");
      }

      const isPasswordMatch = await bcrypt.compare(
        inputPassword,
        user.password
      );

      if (!isPasswordMatch) {
        // Password does not match
        req.session.isNotValidate = "Password is incorrect!";
        return res.redirect("/signin");
      }

      // Password matched
      req.session.userLoggedIn = req.body.email;
      req.session.userId = user._id
      req.session.email = user.email;
      return res.redirect("/");
    } catch (error) {
      console.error(error);
      return res.status(400).json({ error: "Error retrieving user" });
    }
  },

  otp: async (req, res) => {
    try {
      req.session.emptyDetails = "";
      req.session.noRecords = "";
      req.session.codeExpired = "";
      req.session.InvalidCode = "";
  
      const email = req.query.email;
      let { userId, one, two, three, four, five, six } = req.body;
      let otp = one + two + three + four + five + six;
      if (!userId || !otp) {
        req.session.emptyDetails = "OTP Fields are Empty";
        return res.redirect("/otpLogin");
      }
      // Fetch user OTP verification record
      const userOtpVerificationRecord = await userOtpVerification.find({
        userId,
      });
      if (userOtpVerificationRecord.length <= 0) {
        // No records found
        req.session.noRecords =
          "Account record doesn't exist or has been verified already. Please sign up or sign in";
        return res.redirect("/otpLogin");
      } else {
        // User OTP record exists
        const { expiredAt } = userOtpVerificationRecord[0];
        const hashedOTP = userOtpVerificationRecord[0].otp;
        if (expiredAt < Date.now()) {
          await userOtpVerification.deleteMany({});
          req.session.codeExpired = "Code has expired. Please request again";
          return res.redirect("/otpLogin");
        } else {
          console.log("hi");
          const validOTP = await bcrypt.compare(otp, hashedOTP);

          if (!validOTP) {
            // OTP is wrong
            req.session.InvalidCode = "code is wrong. Check your inbox.";
            return res.redirect("/otpLogin");
          } else {
            // Success
            const user = await userDB.findOne(
              { email: req.body.email },
              { verified: 1 }
            );
            if (user && user.verified === true) {
              console.log("User verified. Redirecting to changePassword.");
              await userOtpVerification.deleteMany({ userId : userId});
              return res.redirect("/changePassword");
            } else {
              console.log("User not verified. Updating user verification status.");
              await userDB.updateOne(
                { email: email },
                { $set: { verified: true } }
              );
              req.session.isOtpVerified = true;
              console.log(req.session.isOtpVerified);
              await userOtpVerification.deleteMany({});
              return res.redirect("/");
              
            }
          }
        }
      }
    } catch (error) {
      console.error("Error in otp function:", error);
      res.json({
        status: "Failed",
        message: error.message,
      });
    }
  },

  resendOTP: async (req, res) => {
    try {
      const email = req.query.email;
      const userId = req.session.id;
      console.log(email);
      console.log(userId, "resend page in user side");
      if (!userId || !email) {
        return res.redirect("/otpLogin");
      } else {
        await userOtpVerification.deleteMany({userId:userId});
        // Send a new OTP
        await sendOtpVerificationEmail(req, res, { email: email });
      }
    } catch (error) {
      res.json({
        status: "Failed",
        message: error.message,
      });
    }
  },

  productsInShop: async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const itemsPerPage = parseInt(req.query.items) || 9;
        const search = req.query.search || '';
        let sort = req.query.sort || "price";
        let category = req.query.category || "All"; // Default to "All" if category is not provided
        const email = req.session.email;
        const minPrice = req.query.minPrice || 0;
        const maxPrice = req.query.maxPrice || Number.MAX_SAFE_INTEGER;

        // Check if category is "All" and adjust the query accordingly
        let categoryDetails;
        if (category === "All") {
            // Fetch all category IDs
            const allCategories = await categoryDB.find().distinct("_id");
            categoryDetails = allCategories;
        } else {
            // Fetch category details based on the provided category names
            categoryDetails = await categoryDB.find({ name: { $in: category.split(",") } }).distinct("_id");
        }

        req.session.categoryy = category === "All" ? ["All"] : category.split(",");

        // Split and parse the sort parameter
        let sortBy = {};
        if (sort === "price,asc" || sort === "price,desc" || sort === "createdAt,desc") {
            const [sortField, sortOrder] = sort.split(",");
            sortBy[sortField] = sortOrder;
        } else {
            // Default sorting by price if invalid or no sorting parameter provided
            sortBy["price"] = "asc";
        }

        // Query products based on search, category, price range, and pagination
        let query = {
            active: true,
            categoryStats: true,
            price: { $gte: minPrice, $lte: maxPrice }
        };

        if (search) {
            query.pName = { $regex: search, $options: "i" };
        }

        let products = await productDB
            .find(query)
            .where("category")
            .in(categoryDetails)
            .populate("category")
            .sort(sortBy)
            .skip((page - 1) * itemsPerPage)
            .limit(itemsPerPage);

        const total = await productDB.countDocuments({
            category: { $in: categoryDetails },
            ...query
        });

        const noPages = Math.ceil(total / itemsPerPage);

        const categorys = await categoryDB.find();
        console.log(req.session.categoryy,"categoryy")
       return res.render("ourStore", {
            products: products,
            category: categorys,
            page: page,
            noPages: noPages,
            email: email,
            req: req,
            categoryy: req.session.categoryy,
            priceMinMax: {
                min: minPrice,
                max: maxPrice,
            },
        });
    } catch (error) {
        console.error(error);
        res.status(500).send("Internal Server Error");
    }
},

  
  checkEmail: async (req, res) => {
    try {
      req.session.noUserFound = "";
      req.session.errorEmail3 = "";
      req.session.errorPattern3 = "";

      const email = req.body.email.trim();
      req.session.email = email;
      console.log(email);

      // Fetch user with the provided email
      const user = await userDB.findOne({ email: email });
      if (!email) {
        req.session.errorEmail3 = "Email is required";
      }
      if (!/^[A-Za-z0-9]+@[a-zA-Z]+\.(com|in)$/.test(email)) {
        req.session.errorPattern3 = "Invalid pattern!";
      }
      if (user) {
        // User found, send OTP for forgot password
        await sendOtpVerificationEmail(req, res, { email: user.email });
        return res.redirect("/otpLogin"); // Assuming 'otpLogin' is your OTP verification page
      } else {
        // User not found
        req.session.noUserFound = "User not found!";
        return res.redirect("/forgot-password");
      }
    } catch (error) {
      console.error(error);
      return res.status(400).send("Something went wrong");
    }
  },

  // Add this function to your userController
  forgotPassword: async (req, res) => {
    try {
      req.session.errorPassword3 = "";
      req.session.errorPassword4 = "";
      req.session.newPasswordNotMatch = "";
      const email = req.query.email;
      const { newPassword, confirmPassword } = req.body;

      if (!newPassword) {
        req.session.errorPassword3 = "Password is required";
      }
      if (!confirmPassword) {
        req.session.errorPassword4 = "Password is required";
      }

      // Validate the new password and confirm password

      if (newPassword !== confirmPassword) {
        req.session.newPasswordNotMatch = "Password not matching!";
      }

      if (
        req.session.errorPassword3 ||
        req.session.errorPassword4 ||
        req.session.newPasswordNotMatch
      ) {
        return res.redirect("/changePassword");
      } else {
        // Hash the new password
        const saltRound = 10;
        const hashedPassword = await bcrypt.hash(newPassword, saltRound);
        console.log(email);
        // Update the user's password in the database
        await userDB.updateOne(
          { email: email },
          { $set: { password: hashedPassword } }
        );

        // Redirect to a success page or login page
        return res.redirect("/signin");
      }
    } catch (error) {
      console.error(error);
      return res.status(400).send("Something went wrong");
    }
  },
  addToCart : async (req,res)=>{
    try {
      console.log("hello")
      const { productId,quantity } = req.body;
      console.log(productId,"product")
      req.session.productId = productId;
      // Retrieve the user ID from the session or whereever you store it
        // Ensure quantity defaults to 1 if not provided
        const qty = quantity ? parseInt(quantity) : 1;

      const userId = req.session.userId; // Assuming you store the user ID in the session
      console.log(userId,"session")

    
      // Find the user's cart based on the user ID
      let userCart = await cartDB.findOne({ userId });
     console.log(userCart,"cart")
     
      // If the user doesn't have a cart, create a new one
      if (userCart) {
        const productIndex = userCart.product.findIndex(item => item.productId.toString() === productId.toString());
  
     console.log(productIndex,"index")
        if (productIndex !== -1) {
          // Product is already in the cart, increase its quantity
          userCart.product[productIndex].quantity += quantity;
          console.log("increase")
        } else {
          // Product is not in the cart, add it with the given quantity
          userCart.product.push({ productId, qty });
          console.log("push")
        }
        console.log("save")
        // Save the updated cart
        await userCart.save();
  
       return res.json({ success: true, message: 'Product added to cart successfully' });
      } else {
        console.log("create")
        // If the user doesn't have a cart, create a new one and add the product
        const newCart = new cartDB({ userId, product: [{ productId, quantity }] });
        await newCart.save();
  
       return res.json({ success: true, message: 'Product added to cart successfully' });
      }  
     
    } catch (error) {
      console.error('Error adding product to cart:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  },
  
  addToWishList : async (req,res)=>{
    try {
      console.log("hello")
      const { productId } = req.body;
      console.log(productId,"product")
      // Retrieve the user ID from the session or wherever you store it
      const userId = req.session.userId; // Assuming you store the user ID in the session
      console.log(userId,"session")
  
      // Find the user's wishlist based on the user ID
      let userWishList = await wishListDB.findOne({ userId });
      console.log(userWishList)
      // If the user doesn't have a wishlist, create a new one
      if (userWishList) {
        const isProductWishList = userWishList.product.some(item => item.productId.toString() === productId.toString());
  
      if (isProductWishList) {
        return res.json({ success: false, message: 'Product is already added to wishList' });
      } else {
        // Add the product to the wishlist
        userWishList.product.push({ productId });
  
        // Update the existing wishlist without saving as a new document
        await wishListDB.updateOne({ userId }, { $set: { product: userWishList.product } });
  
        return res.json({ success: true, message: 'Product added to wishList successfully' });
      }
    
      } else {
        userWishList = new wishListDB({ userId, product: [{ productId }] });
        await userWishList.save();
        return res.json({ success: true, message: 'Product added to wishList successfully' });
      }
      // Save the user's wishlist
     
    } catch (error) {
      console.error('Error adding product to wishList:', error);
      res.status(500).json({ error: 'Server Error' });
    }
  },

  updateCart : async (req, res) => {
    try {
        const { productId, quantity } = req.body;
        const userId = req.session.userId;
        console.log(productId,quantity,"contro")
        // Validate inputs
        if (!userId || !productId || isNaN(quantity)) {
            return res.status(400).json({ error: 'Invalid input data' });
        }else{

              
   // Find the user's cart based on the user ID and product ID
   let userCart = await cartDB.findOneAndUpdate(
    { userId, 'product.productId': productId },
    { $set: { 'product.$.quantity': quantity } },
    { new: true } // To return the updated document
);

if (!userCart) {
    return res.status(404).json({ error: 'User or product not found in the cart' });
}

console.log('Cart updated successfully:', userCart);
res.status(200).json({ message: 'Cart and stock updated successfully', cart: userCart });

        }
    } catch (error) {
        console.error('Error updating cart:', error);
        res.status(500).json({ error: 'Server Error' });
    }
},
// Controller
getTotalItemsInCart: async (req, res) => {
  try {
      const userId = req.session.userId; // Assuming you have the user's ID in the session

      // Find the user's cart based on the user ID
      let userCart = await cartDB.findOne({ userId });

      // Calculate total quantity of all products
      let totalQuantity = 0;
      if (userCart && userCart.product.length > 0) {
          totalQuantity = userCart.product.reduce((acc, item) => acc + item.quantity, 0);
      }
      console.log(totalQuantity)

      res.status(200).json({ totalQuantity });
  } catch (error) {
      console.error('Error fetching total items in cart:', error);
      res.status(500).json({ error: 'Server Error' });
  }
},
getTotalItemsInWishList: async (req, res) => {
  try {
      const userId = req.session.userId; // Assuming you have the user's ID in the session

      // Find the user's wishList based on the user ID
      let userWishList = await wishListDB.findOne({ userId });

      // Calculate total quantity of all products
      let totalQuantity = 0;
      if (userWishList && userWishList.product.length > 0) {
          totalQuantity = userWishList.product.reduce((acc, item) => acc + item.quantity, 0);
      }
      console.log(totalQuantity)

      res.status(200).json({ totalQuantity });
  } catch (error) {
      console.error('Error fetching total items in cart:', error);
      res.status(500).json({ error: 'Server Error' });
  }
},
removeFromCart: async (req, res) => {
  try {
    const userId = req.session.userId;
    const productId = req.query.id;
    

    if (!productId) {
      return res.status(400).json({ success: false, message: 'Invalid product ID' });
    }

    const cart = await cartDB.findOne({ userId });

    if (!cart) {
      return res.status(404).json({ success: false, message: 'Cart not found' });
    }

    // Find the product index in the cart
    const productIndex = cart.product.findIndex(item => item.productId.toString() === productId);

    if (productIndex === -1) {
      return res.status(404).json({ success: false, message: 'Product not found in cart' });
    }

    // Remove the product from the cart
    cart.product.splice(productIndex, 1);

    // Save the updated cart
    await cart.save();

    res.json({ success: true, message: 'Product removed from cart successfully' });
  } catch (error) {
    console.error('Error removing product from cart:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
},

removeFromWishlist: async (req, res) => { // Corrected route function name
  try {
    const userId = req.session.userId;
    const productId = req.query.id;
    console.log(productId);

    if (!productId) {
      res.status(500).json({ success: false, message: 'Invalid product ID' });
      return;
    }

    const deleteFromWishlist = await wishListDB.findOneAndUpdate(
      { userId },
      { $pull: { 'product': { productId: productId } } },
      { new: true }
    );

    if (!deleteFromWishlist) {
      res.status(404).json({ success: false, message: 'Product not found in wishlist' });
      return;
    }

    res.json({ success: true, message: 'Product removed from wishlist successfully' });
  } catch (error) {
    console.error('Error removing product from wishlist:', error);
    res.status(500).json({ success: false, message: 'Server error' });
  }
},
updateUserProfile : async (req,res)=>{
  try{
      // Clear session errors
      req.session.userFullNameRequired = "";
      req.session.fullNameRegex = "";
      req.session.userEmailRequired = "";
      req.session.emailRegex = "";
      req.session.userPhoneRequired = "";
      req.session.phoneRegex = "";

    // trim inpt fields
    const fullName = req.body.fullName
    const email = req.body.email
    const phone = req.body.phone
    const currentPassword = req.body.currentPassword
    const newPassword = req.body.newPassword
    const confirmPassword = req.body.confirmPassword

    // backend form validation
    if(!fullName){
      req.session.userFullNameRequired = "Full Name is required";
      console.log("name")
    }
    const fullNameRegex = /^[A-Za-z\s]+$/;
    if(!fullNameRegex.test(fullName)){
      req.session.fullNameRegex = "Name should be between 3 and 30 characters and contain only letters!";
      console.log("name regex")
    }
    if(!phone){
      req.session.userPhoneRequired = "Phone is required"
      console.log("phone")
    }
    const phoneRegex = /^[0-9]{10}$/;
    if(!phoneRegex.test(phone)){
      req.session.phoneRegex = "Phone should be 10 numbers"
      console.log("phone regex")
    }

    if ( req.session.userFullNameRequired ||
      req.session.fullNameRegex||
      req.session.userPhoneRequired ||
      req.session.phoneRegex
      ) {
      console.log("errors")
      return res.redirect("/account-details");
    } else {
      console.log("users")
      const userId = req.session.userId
      // Fetch user from DB
    const existingUser = await userDB.findById(userId);

    existingUser.name = fullName;
    existingUser.phone = phone;

    const passwordRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{8,}$/;

    if(!currentPassword){
      req.session.errorCurrentPassword = "Current Password is required";
     console.log("current password")
    }else if(!passwordRegex.test(currentPassword)){
      req.session.currentPasswordRegex = "Please enter a password that is at least 8 characters long and contains at least one letter and one number."
      console.log("password regex")
    }else{
      const passwordMatch = await bcrypt.compare(currentPassword,existingUser.password);

      if(!passwordMatch){
        req.session.notMatchingCurrentPassword = "Current Password is incorrect";
        return res.redirect("/account-details");
      }else{
        if(!newPassword){
          req.session.errorNewPassword = "New Password is required";
     console.log("new password")
        }else if(!passwordRegex.test(newPassword)){
          req.session.newPasswordRegex = "Please enter a password that is at least 8 characters long and contains at least one letter and one number."
        }else{
          if (!confirmPassword) {
            req.session.errorConfirmPassword = "Confirm Password is required";
            console.log("confirm password")
          }else if(!passwordRegex.test(confirmPassword)){
            req.session.confirmPasswordRegex = "Please enter a password that is at least 8 characters long and contains at least one letter and one number."
          }else{
            if(newPassword !== confirmPassword){
              req.session.notEqualPassword = "The new passsword confirm password are not matching"
            }else if(newPassword && confirmPassword === currentPassword){
              req.session.alreadyUsedPassword = "This password is already used"
            }else{
              const hashedPassword = await bcrypt.hash(newPassword,10);
              existingUser.password = hashedPassword
              console.log("password changed")
            }
          }       
        }
      }
    }
      await existingUser.save();
      console.log("updated")
      
      return res.redirect('/account-details');
    }
  }catch(error){
    console.error(error)
    res.status(500).send("Server error");
  }
},
checkOut : async(req,res)=>{
  try{

    const userId = req.session.userId;
    req.session.productIdInCheckout = req.query.id;
   
    const cart = await cartDB.findOne({userId}).populate('product.productId');

    let total = 0;
    cart.product.forEach((item) => {
        let price = item.productId.price;
        let discount = item.productId.discount || 0;
        let subTotal = price * item.quantity;
        let subDiscount = (price * discount / 100) * item.quantity;
        total += subTotal - subDiscount;
    });
    total += 40; // Shipping cost (if applicable)
    req.session.totalAmount = total;

res.redirect('/checkout')
  }catch(error){
    console.error(error);
    res.status(500).send("Server error")
  }
},


onlinePayment: async (req, res) => {
  try {

    const { paymentMethod,couponCode,total } = req.body; // Retrieve payment method from request body

    if (paymentMethod !== "Online_Payment") {
        throw new Error('Invalid payment method');
    }

    let amount = 0;
    if(!couponCode){
      amount = total * 100;
    }else{
         // check the coupon is valid or not;
         const coupon = await couponDB.findOne({couponCode:couponCode,active:true,expired:false});
         console.log(coupon)               
                  amount = total * 100;          
    }

      const order = await razorPayInstance.orders.create({
          amount: amount,
          currency: "INR",
      });

      console.log(order, "payment");
      res.status(200).json({ success: order }); // Send success response with order details
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message }); // Send error response with error message
  }
},

walletPayment: async (req, res) => {
  try {

    const {paymentMethod,total}= req.body;

    if (paymentMethod !== "wallet") {
      throw new Error('Invalid payment method');
  }
      console.log(total, "first");
      const walletBalance = await walletDB.findOne({});
      
      if (!walletBalance || walletBalance.wallet < total) {
          // Redirect to checkout if wallet balance is insufficient
          console.log("wallet error");
          return res.status(500).json({ error: "insufficient wallet amount" });
      }

      walletBalance.wallet -= total;
      console.log(total, "second");
      await walletBalance.save();
      res.status(200).json({ success: walletBalance });
  } catch (error) {
      console.error(error);
      res.status(500).json({ error: error.message });
  }
},
couponCodeApply: async (req, res) => {
  try {
    const couponCode = req.body.coupon.trim();
    const productId = req.session.productIdInCheckout;
    let total = req.body.total;

    const products = await productDB.find({
_id:productId
    });

    // Validate coupon code format
    const couponRegex = /^[a-zA-Z0-9]+$/;
    if (!couponRegex.test(couponCode)) {
      return res.status(400).json({ error: "The coupon code should contain only alphanumeric characters." });
    }

    let categoryId = 0;
    if (products && products.length > 0) {
      categoryId = products[0].category.toString();
    } 
   
    // Check if the entered coupon code matches the one stored in the database
    const coupons = await couponDB.findOne({couponCode:couponCode, active: true, expired: false });
    const couponId =  coupons._id.toString() 
    if ( !coupons ) {
      return res.status(400).json({ error: "The entered coupon code is not valid." });
    }

    if(categoryId !== coupons.category){
      return res.status(500).json({ error: "The product Category is not matching so this coupon doesn't apply" });
    }

  // Check if the coupon has already been applied
  const appliedCoupon = await orderDB.findOne({ 'coupon.couponApplied': couponId });
  if (appliedCoupon) {
    return res.status(400).json({ error: "The coupon has already been applied." });
  }

    // Calculate discount and update total
    const discount = coupons.discount;
    const discountAmount = (total * discount) / 100;
    total -= discountAmount;

    if(total < coupons.maxAmount ){
      return res.status(500).json({ error: "The coupon doesn't apply the total amount is less than Maximum Coupon Amount" });
    }

    // Send response with discount and updated total
    return res.status(200).json({ discount: discount, updatedTotal: total });
  } catch (error) {
    console.error(error);
    return res.status(400).json({ error: "Server error" });
  }
},

submitOrder: async (req,res)=>{
  try{
   // clear session
req.session.errorfullName = "";
req.session.minFullName = "";
req.session.errorAddress = "";
req.session.addressRegexError = "";
req.session.errorCity = "";
req.session.cityRegex = "";
req.session.errorZipCode = "";
req.session.zipCodeRegex = "";
req.session.errorHouseNo  = '';
 req.session.houseNoRegex = '';
 req.session.erroralternateNumber  = '';
 req.session.alternateNumberRegex = '';
 req.session.errorPhone = '';
 req.session.phoneRegex = '';
 req.session.errorEmail = '';
 req.session.emailRegex = '';


// const { formData} = req.body;
const user = req.session.userId;
console.log(user);

// Remove white space 
const fullName = req.body.formData.name;
const phone = req.body.formData.phone;
const email = req.body.formData.email;
const address = req.body.formData.address;
const city = req.body.formData.city;
const zipCode = req.body.formData.postalCode;
const houseNo = req.body.formData.houseNo;
const alternateNumber = req.body.formData.alternateNumber;
const paymentMethod = req.body.formData.payment;
const total = req.body.total;
const couponCode = req.body.couponCode;

// check if name have 3 to 20 characters
// Regular expression to allow only characters
const nameRegex = /^[A-Za-z\s]+$/;

if (!fullName) {
  req.session.errorfullName = "Name is required!";
} else if (!(fullName.length >= 3 && fullName.length <= 30 && nameRegex.test(fullName))) {
  req.session.minFullName = "Name should be between 3 and 30 characters and contain only letters!";
}

if (!phone) {
  req.session.errorPhone = "phone is required!";

  }  

  const phoneRegex = /^\d{10,}$/;

if(!(phoneRegex).test(phone)){
  req.session.phoneRegex = "phone field should only contain numbers"
  }

if (!email) {
   req.session.errorEmail = "email is required!";
 
  }  

  const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z]+\.(com|in)$/;
  if(!(emailRegex).test(email)){
    req.session.emailRegex = "Invalid email pattern"
    }

// check if address field is empty
if(!address){
req.session.errorAddress = "Address is required!";

}

// Address Regular Expression
const addressRegex = /^[A-Za-z0-9\s.,()-]+$/;

// Example usage within validation logic
if (!addressRegex.test(address)) {
    req.session.addressRegexError = "Only letters, numbers, spaces, and .,()- characters are allowed in the address.";
 
}

// check if city field is empty
if(!city){
req.session.errorCity = "city is required!"

}

// city Regeular expression
const cityRegex = /^[A-Za-z]+$/;

if(!(cityRegex).test(city)){
req.session.cityRegex = "city Field should only contain characters";

}

if(!houseNo){
  req.session.errorHouseNo = "House number is required"
 
}

const houseNoRegex = /^[a-zA-Z0-9/\\-]+$/;
if(!(houseNoRegex).test(houseNo)){
  req.session.houseNoRegex = "wrong house no pattern"
}

// check if zipCode field is empty
if(!zipCode){
req.session.errorZipCode = "postalCode is required!"

}

// zipCode Regeular expression
const zipCodeRegex = /^[0-9]+$/;

if(!(zipCodeRegex).test(zipCode)){
req.session.zipCodeRegex = "postalcode Field should only contain numbers";

}

if(!alternateNumber){
  req.session.erroralternateNumber = "mobile is required"
 
}

const alternateNumberRegex = /^\d{10,}$/;

if(!(alternateNumberRegex).test(alternateNumber)){
  req.session.alternateNumberRegex = "alternateNumber field should only contain numbers"
}


if(req.session.errorfullName ||
 req.session.minFullName  ||
 req.session.errorAddress ||
 req.session.addressRegexError ||
 req.session.errorCity ||
 req.session.cityRegex ||
 req.session.errorZipCode ||
 req.session.zipCodeRegex ||
 req.session.errorHouseNo ||
 req.session.houseNoRegex ||
 req.session.erroralternateNumber  ||
 req.session.alternateNumberRegex ||
 req.session.errorPhone ||
 req.session.phoneRegex||
 req.session.errorEmail ||
 req.session.emailRegex
 ){

 return res.redirect("/checkout");
 }

  const cartProducts = await cartDB.findOne({userId:req.session.userId}).populate('product.productId')
  req.session.cartProducts = cartProducts;
  // const productDBId = await productDB.find({})


  console.log(couponCode,"ccd")
  let couponDiscount = 0; // Initialize coupon discount to 0
  let couponId = ""; // Initialize coupon name to an empty string
  
  // Check if a coupon code is provided
  if (couponCode) {
      // Find the coupon in the database
      const coupon = await couponDB.findOne({ couponCode: couponCode, active: true, expired: false });
      if (!coupon) {
          return res.json({ error: "Coupon does not exist" });
      }
      // Assign coupon details
      couponDiscount = coupon.discount;
      couponId = coupon._id;
  }

// const products = cartProducts.product.map(item => {
//   return item.productId; // We're assuming 'productId' is properly populated
// });

    // Check stock availability and create orders
    for (const product of cartProducts.product) {
      const productInDB = await productDB.findById(product.productId._id); // Fetch product from DB

      // Check if stock is available
      if (productInDB.stock < product.quantity) {
        req.session.stockError = `Insufficient stock for ${product.productId.pName}. Available: ${productInDB.stock}`;
        console.log(`Insufficient stock for ${product.productId.name}`);
        return res.redirect("/checkout");
      }
    }

      let paymentStatus = "";
      if (paymentMethod === "COD") {
        paymentStatus = "Pending";
      } else {
        paymentStatus = "Received";
      }
    

// Create new order document
const newOrder = new orderDB({
  user: {
    userId: req.session.userId,
    name: fullName,
    email: email,
    phone: phone,
  },
  products: cartProducts.product.map(item => ({
    productId: item.productId._id, // Assuming you're storing the ID of the product
    pName: item.productId.pName,
    pImages: item.productId.pImages[0],
    category: item.productId.category,
    description: item.productId.description,
    price: item.productId.price,
    discount: item.productId.discount,
    quantity: item.quantity, // Use the quantity from cart directly
    status: 'Pending',
    // Include other necessary fields from product as needed
  })),
  totalAmount: total,
  shippingAddress: {
    addresses: address,
    city: city,
    houseNo: houseNo,
    postalCode: zipCode,
    alternativeNumber: alternateNumber,
  },
  paymentMethod: paymentMethod,
  paymentStatus: paymentStatus,
  orderDate: Date.now(),
    // Include coupon details if a coupon was applied
    coupon: {
      code: couponId,
      discount: couponDiscount,
      couponApplied:[couponId],
  }
});

      // Save the order document to the database
      const savedOrder = await newOrder.save();
      req.session.orderId = savedOrder._id;
console.log(savedOrder)
// Decrease stock for the products in the order
for (const product of cartProducts.product) {
  const productInDB = await productDB.findById(product.productId._id);

  // Update stock for the product
  productInDB.stock -= product.quantity;
  await productInDB.save();
}

 // Remove all products from the cart after successfully placing an order
   await cartDB.updateOne(
      { userId: req.session.userId },
      { $set: { product: [] } } // Clear the 'product' array in the cart
    );
console.log('cart cleared')
 return res.redirect("/order")
  }catch(error){
    console.error(error);
  return  res.status(500).send('Server error');
  }
},
cancelOrder : async (req,res)=>{
  try {
    const { orderId, productId,reason, customReason} = req.body; // Assuming you are passing orderId and productId in the request body
console.log(orderId, productId,reason, customReason,"all")
    // Fetch the order from the database using orderId
  let order = await orderDB.findOne({_id:orderId});
    if (!order) {
        return res.status(404).send("Order not found");
    }
    console.log("order")
     
           // Find the product within the order's products array
           const productToCancel = order.products.find(item => item.productId.toString() === productId);

           if (!productToCancel) {
               return res.json({ success: false, message: 'Product not found in order' });
           }
console.log("product to cancel")
            const productInDB = await productDB.findById(productId);

            productInDB.stock += productToCancel.quantity;
console.log("stock updated")
            if(order.paymentMethod === "wallet" || order.paymentMethod === "Online_Payment"){

              let shippingCost = 40;

              const totalPrice = productInDB.price * productToCancel.quantity;

              const totalDiscount =(productInDB.price * productInDB.discount / 100) * productToCancel.quantity;

              let overallTotalPrice = totalPrice - totalDiscount ;

              if (order.products.length < 2) {
                overallTotalPrice += shippingCost;  // shipping cost
              }

              let ttlsum =  order.totalAmount -= overallTotalPrice;
              console.log(ttlsum,"ordertotal")

             let walletBalance = await walletDB.findOne({});
  console.log("wallet")
             if (!walletBalance) {
              walletBalance = new walletDB(); // Create a new wallet document if none exists
            }else{
              walletBalance.wallet += overallTotalPrice;
              await walletBalance.save();
            }
            // Save the updated wallet and other documents
      await Promise.all([order.save(), productInDB.save()]);
  console.log("saved order and product")
            }
        
           // Update the status of the specific product to "Cancelled"
           productToCancel.status = 'Cancelled';
        console.log("Canlcelled")
           productToCancel.cancelReason = reason === 'Other' ? customReason : reason; // Set the cancellation reason
           // Save the updated order
           await order.save();
           return res.json({ success: true, message: 'Product successfully cancelled' });
           
           
} catch (error) {
    console.error(error);
  return  res.status(500).send("Server error");
}
},
returnOrder  : async (req,res)=>{
  try {
    const { orderId, productId,reason,customReason} = req.body; // Assuming you are passing orderId and productId in the request body
    
    console.log(orderId,"order",productId,"product");
    // Fetch the order from the database using orderId
  let order = await orderDB.findOne({_id:orderId});
    console.log(order,"details")
    if (!order) {
        return res.status(404).send("Order not found");
    }
     
           // Find the product within the order's products array
           const productToReturn = order.products.find(item => item.productId.toString() === productId);

           if (!productToReturn) {
               return res.json({ success: false, message: 'Product not found in order' });
           }
   
           // Update the return of the specific product to "Pending"
           productToReturn.return = 'Pending';
           productToReturn.returnReason = reason === 'Other' ? customReason : reason; // Set the cancellation reason
           // Save the updated order
           await order.save();
   
           console.log('Product is returing');
           return res.json({ success: true, message: 'Product is returing' });
   
} catch (error) {
    console.error(error);
    res.status(500).send("Server error");
}
},

};


