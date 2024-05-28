const productDB = require("../model/productSchema");
const userDB = require("../model/userSchema");
const categoryDB = require("../model/categorySchema");
const cartDB = require("../model/cartSchema");
const wishListDB = require("../model/wishListSchema");
const addressDB = require("../model/addressSchema");
const orderDB = require('../model/orderSchema');
const walletDB = require('../model/walletSchema');
const couponDB = require("../model/couponSchema");
const {RAZORPAY_ID_KEY,RAZORPAY_SECRET_KEY} = process.env;

exports.signupPage = async (req, res) => {
  try {
    console.log("Refreshed");
    // storing form validation errors and messages in session
    return res.render("signup", {
      nameRequired: req.session.errorName,
      minCharacter: req.session.minName,
      emailRequired: req.session.errorEmail,
      invalidEmail: req.session.errorPattern,
      savedEmail: req.session.email,
      phoneRequired: req.session.errorPhone,
      invalidPhone: req.session.errorDigits,
      savedPhone: req.session.phone,
      passwordRequired: req.session.errorPassword,
      confirmPasswordRequired2: req.session.errorconfirmPassword,
      invalidPassword: req.session.checkPassword,
      passInclude: req.session.passInclude,
      confirmPassInclude: req.session.confirmPassInclude,
      userExists: req.session.userExists,
      terms: req.session.terms,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.otpLoginPage = async (req, res) => {
  try {
    return res.render("otpLogin", {
      email: req.session.email,
      id: req.session.id,
      emptyField: req.session.emptyDetails,
      noRecords: req.session.noRecords,
      codeExpired: req.session.codeExpired,
      invalidCode: req.session.InvalidCode,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.signinPage = async (req, res) => {
  try {
    console.log("signinPage");

    return res.render("signin", {
      notExists: req.session.userNotRegistered,
      invalidEmail2: req.session.errorPattern2,
      emailRequired2: req.session.errorEmail2,
      passwordRequired2: req.session.errorPassword2,
      passwordNotValid: req.session.isNotValidate,
      passInclude2: req.session.passInclude2,
      accountBlocked : req.session.accountBlocked,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.forgotPasswordPage = async (req, res) => {
  try {
    // email = req.body.email;
    // const user = await userDB.findOne({ email: email });
    return res.render("verifyEmail", {
      noUserFound: req.session.noUserFound,
      errorEmail3: req.session.errorEmail3,
      errorPattern3: req.session.errorPattern3,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};
exports.changePasswordPage = async (req, res) => {
  try {
    return res.render("changePassword", {
      errorPassword3: req.session.errorPassword3,
      errorPassword4: req.session.errorPassword4,
      newPasswordNotMatch: req.session.newPasswordNotMatch,
      email: req.session.email,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};
exports.homePage = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;
    const newUser = req.session.isAuthenticated;
    // Find the user with the provided email
    const user = await userDB.findOne({ email: userLoggedEmail, block: false, verified: true });

    // Find all active categories
    const categories = await categoryDB.find({ active: true });

    // Find all active products
    const products = await productDB.find({ active: true });
    console.log(user)
    // Render the home page with the retrieved data
    return res.render("home", {
      products,
      users: user || null, // If user is not found, set it to null
      categories,
      newUser,
      userEmail: req.session.email, // Assuming you want to pass the email to the view
    });

  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.productDetailsPage = async (req, res) => {
  try {
    id = req.query.id;
    console.log(id)
    const productsDetails = await productDB.findById(id);
    const users = await userDB.find({ verified: true }, { block: false });
    const category = await categoryDB.find({ active: true });
    console.log(category);
    console.log(users);
    console.log(productsDetails);
    return res.render("productDetails", {
      products: productsDetails,
      users,
      category,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).send("Server Error");
  }
};

exports.accountDetailsPage = async (req,res)=>{
  try{
    const userId = req.session.userId
    const user = await userDB.findById({_id:userId}).populate('addresses')
    console.log(user)
        // Pagination
        const page = parseInt(req.query.page) || 1; // Current page, default is 1
        const pageSize = 2; // Number of addresses per page
        const totalAddresses = user.addresses.length;
        const totalPages = Math.ceil(totalAddresses / pageSize);
        const startIndex = (page - 1) * pageSize;
        const endIndex = Math.min(startIndex + pageSize - 1, totalAddresses - 1);
    
        // Slice the addresses array to get addresses for the current page
        const addressesOnPage = user.addresses.slice(startIndex, endIndex + 1);

        
    const category = await categoryDB.find({active:true});

    const defaultAddress =  user.addresses.find(address=> address.default);

    const wallet = await walletDB.findOne({})
    const validationErrors = {
      userFullNameRequired: req.session.userFullNameRequired,
      fullNameRegex: req.session.fullNameRegex,
      userPhoneRequired: req.session.userPhoneRequired,
      phoneRegex: req.session.phoneRegex,
      errorCurrentPassword: req.session.errorCurrentPassword,
      currentPasswordRegex: req.session.currentPasswordRegex,
      notMatchingCurrentPassword: req.session.notMatchingCurrentPassword,
      errorNewPassword: req.session.errorNewPassword,
      newPasswordRegex: req.session.newPasswordRegex,
      errorConfirmPassword: req.session.errorConfirmPassword,
      confirmPasswordRegex: req.session.confirmPasswordRegex,
      notEqualPassword:req.session.notEqualPassword,
      alreadyUsedPassword:req.session.alreadyUsedPassword,
    };

       // Clear session errors after passing them to the view
       req.session.userFullNameRequired = '';
       req.session.fullNameRegex = '';
       req.session.userEmailRequired = '';
       req.session.emailRegex = '';
       req.session.userPhoneRequired = '';
       req.session.phoneRegex = '';
       req.session.errorCurrentPassword = '';
       req.session.currentPasswordRegex = '';
       req.session.notMatchingCurrentPassword = '';
       req.session.errorNewPassword = '';
       req.session.newPasswordRegex = '';
       req.session.errorConfirmPassword = '';
       req.session.confirmPasswordRegex = '';
       req.session.notEqualPassword = '';
       req.session.alreadyUsedPassword = '';

       return res.render("accountDetails",{
        category : category,
        user:user,
        defaultAddress:defaultAddress,
        addressesOnPage: addressesOnPage,
        totalPages: totalPages,
        currentPage: page,
        validationErrors : validationErrors,
        wallet,
      });
  }catch(error){
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.wishlistPage = async (req,res)=>{
  try{
    const userId = req.session.userId
    const wishListItems = await wishListDB.findOne({ userId }).populate(
    'product.productId'
    );
  
console.log(wishListItems,"whisitems")
    const category = await categoryDB.find({active:true});
    return res.render("wishlist",{
      category : category,
      wishListItems:wishListItems,
    });
  }catch(error){
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.cartPage = async (req,res)=>{
  try{
    const userId = req.session.userId
    
    const cartItems = await cartDB.findOne({ userId }).populate(
    'product.productId'
       // Assuming your Product model is named 'Product'
);
      console.log(cartItems,"ci")
    const category = await categoryDB.find({active:true});
    return res.render("cart",{
      category : category,
      cartItems : cartItems,
    });
  }catch(error){
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.addressPage = async (req,res)=>{
  try{

    const errorfullName = req.session.errorfullName;
    const minFullName = req.session.minFullName;
    const errorAddress = req.session.errorAddress;
    const addressRegex = req.session.addressRegexError;
    const errorCity = req.session.errorCity;
    const cityRegex = req.session.cityRegex;
    const errorState = req.session.errorState;
    const stateRegex = req.session.stateRegex;
    const errorZipCode = req.session.errorZipCode;
    const zipCodeRegex = req.session.zipCodeRegex;
    const errorCountry = req.session.errorCountry;
    const countryRegex = req.session.countryRegex;
    const errorHouseNo =req.session.errorHouseNo;
    const houseNoRegex =req.session.houseNoRegex;
    const errorMobile =req.session.errorMobile;
    const mobileRegex =req.session.mobileRegex;

    const category = await categoryDB.find({active:true});

    
    req.session.errorfullName = "";
     req.session.minFullName = "";
 req.session.errorAddress = "";
   req.session.addressRegexError = "";
    req.session.errorCity = "";
    req.session.cityRegex = "";
    req.session.errorState = "";
    req.session.stateRegex = "";
   req.session.errorZipCode = "";
   req.session.zipCodeRegex = "";
   req.session.errorCountry = "";
   req.session.countryRegex = "";
   req.session.errorHouseNo = "";
  req.session.houseNoRegex = "";
  req.session.errorMobile = "";
req.session.mobileRegex = "";

    return res.render('addAddress',{
        errorfullName,
        minFullName,
        errorAddress,
        addressRegex,
        errorCity,
        cityRegex,
        errorState,
        stateRegex,
        errorZipCode,
        zipCodeRegex,
        errorCountry,
        countryRegex,
        errorHouseNo,
        houseNoRegex,
        errorMobile,
        mobileRegex,
      category : category,
      errorAddressExists:req.session.errorAddressExists
    })
  }catch(error){
    res.status(500).send("Server error")
  }
};

exports.addressEdit = async(req,res)=>{
  try{

    const errorfullName = req.session.errorfullName;
    const minFullName = req.session.minFullName;
    const errorAddress = req.session.errorAddress;
    const addressRegex = req.session.addressRegexError;
    const errorCity = req.session.errorCity;
    const cityRegex = req.session.cityRegex;
    const errorState = req.session.errorState;
    const stateRegex = req.session.stateRegex;
    const errorZipCode = req.session.errorZipCode;
    const zipCodeRegex = req.session.zipCodeRegex;
    const errorCountry = req.session.errorCountry;
    const countryRegex = req.session.countryRegex;
    const errorHouseNo =req.session.errorHouseNo;
    const houseNoRegex =req.session.houseNoRegex;
    const errorMobile =req.session.errorMobile;
    const mobileRegex =req.session.mobileRegex;

    const addressId = req.query.id
    console.log(addressId)
    const address = await addressDB.findOne({_id:addressId})
    const category = await categoryDB.find({active:true});
    console.log(address,"address")

    req.session.errorfullName = "";
     req.session.minFullName = "";
 req.session.errorAddress = "";
   req.session.addressRegexError = "";
    req.session.errorCity = "";
    req.session.cityRegex = "";
    req.session.errorState = "";
    req.session.stateRegex = "";
   req.session.errorZipCode = "";
   req.session.zipCodeRegex = "";
   req.session.errorCountry = "";
   req.session.countryRegex = "";
   req.session.errorHouseNo = "";
  req.session.houseNoRegex = "";
  req.session.errorMobile = "";
req.session.mobileRegex = "";


    return res.render("editAddress",{
      errorfullName,
      minFullName,
      errorAddress,
      addressRegex,
      errorCity,
      cityRegex,
      errorState,
      stateRegex,
      errorZipCode,
      zipCodeRegex,
      errorCountry,
      countryRegex,
      errorHouseNo,
      houseNoRegex,
      errorMobile,
      mobileRegex,
      category : category,
      errorAddressExists:req.session.errorAddressExists,
      address:address,
    });
  }catch(error){
    console.error(error)
    res.status(500).send("Server error")
  }
}
exports.checkoutPage = async(req,res)=>{
  try{
  
   
  const  errorfullName = req.session.errorfullName;
  const  minFullName = req.session.minFullName;
  const  errorAddress = req.session.errorAddress;
  const  addressRegexError = req.session.addressRegexError;
  const  errorCity = req.session.errorCity;
  const  cityRegex = req.session.cityRegex;
  const  errorZipCode = req.session.errorZipCode;
  const  zipCodeRegex = req.session.zipCodeRegex;
  const  errorHouseNo = req.session.errorHouseNo;
  const  houseNoRegex = req.session.houseNoRegex;
  const  errorAlternateNumber = req.session.erroralternateNumber;
  const  alternateNumberRegex = req.session.alternateNumberRegex;
  const  errorPhone = req.session.errorPhone;
  const  phoneRegex = req.session.phoneRegex;
  const  errorEmail = req.session.errorEmail;
  const  emailRegex = req.session.emailRegex;
  const  stockError = req.session.stockError;
  const couponPatterError = req.session.couponPatterError; 
  const  couponCodeIsNotMatch = req.session.couponCodeIsNotMatch;
 
    const userId = req.session.userId;
    console.log(userId,"id")
    const user = await userDB.findById(userId).populate('addresses')
    const cart = await cartDB.findOne({ userId: userId }).populate('product.productId');

    const category = await categoryDB.find({active:true});
      // clear session
req.session.errorfullName = "";
req.session.minFullName = "";
req.session.errorEmail = '';
req.session.emailRegex = '';
req.session.errorAddress = "";
req.session.addressRegexError = "";
req.session.errorCity = "";
req.session.cityRegex = "";
req.session.errorState = "";
req.session.stateRegex = "";
req.session.errorZipCode = "";
req.session.zipCodeRegex = "";
req.session.errorHouseNo  = '';
 req.session.houseNoRegex = '';
 req.session.errorMobile  = '';
 req.session.mobileRegex = '';
 req.session.couponCodeError = "";
 req.session.couponPatterError = ""; 
 req.session.couponCodeIsNotMatch = "";
    return res.render("checkOut",{
      category : category,
      user : user,
      cart:cart,
      errorfullName,
      minFullName,
      errorAddress, 
      addressRegexError,
      errorCity,
      cityRegex,
      errorZipCode,
      zipCodeRegex,
      errorHouseNo,
      houseNoRegex,
      errorAlternateNumber,
      alternateNumberRegex,
      errorPhone,
      phoneRegex,
      errorEmail,
      emailRegex,
      stockError,
      RAZORPAY_ID_KEY,
      couponPatterError,
      couponCodeIsNotMatch,
      couponDiscount:req.session.matchingCoupon ,
    })
  }catch(error){
    console.error(error);
    res.status(500).send("Server error");
  }
};

exports.orderPage = async (req,res)=>{
  try{
    const userId = req.session.userId
   
        // Retrieve the page and size parameters from the query string
        const page = parseInt(req.query.page) || 1; // Current page, default is 1
        const size = parseInt(req.query.size) || 5; // Page size, default is 10

        // Calculate the offset and limit for pagination
    const offset = (page - 1) * size;
    const limit = size;

    const category = await categoryDB.find({active:true})
    const  orders = await orderDB
      .find({'user.userId':userId})
      .sort({ orderDate: -1 }) 
      .skip(offset)
      .limit(limit)

       // Count the total number of orders for the user
       const totalOrders = await orderDB.countDocuments();

               // Calculate the total number of pages
    const totalPages = Math.ceil(totalOrders / size);

    return res.render("order",{
      category : category,
      orders : orders,
      page:page,
      limit:limit,
      totalPages:totalPages,
    })
  }catch(error){
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.orderDetails = async (req,res)=>{
  try{
    const orderId = req.query.orderId
   
    const category = await categoryDB.find({active:true});

    
    const orderDetails = await orderDB.findOne({_id:orderId})
    .populate('products.productId')
   console.log(orderDetails);
   
    return res.render("orderDetails",{
      category : category,
      orderDetails:orderDetails,
    })
  }catch(error){
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.userLogout = async ( req,res)=>{
  try{
    req.session.destroy((err) => {
      if (err) {
          console.error('Error destroying session:', err);
          return res.status(500).json({ error: 'Server Error' });
      }
      // Redirect or respond after destroying the session
    return  res.redirect('/signin'); // Redirect to the sign in page
  });
  }catch(error){
    console.log(error);
    return res.status(500).send("Server Error");
  }
}

