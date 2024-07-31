const productDB = require("../../model/productSchema");
const userDB = require("../../model/userSchema");
const categoryDB = require("../../model/categorySchema");
const cartDB = require("../../model/cartSchema");
const wishListDB = require("../../model/wishListSchema");
const addressDB = require("../../model/addressSchema");
const orderDB = require("../../model/orderSchema");
const walletDB = require("../../model/walletSchema");
const couponDB = require("../../model/couponSchema");
const offerDB = require("../../model/offerSchema");
const { RAZORPAY_ID_KEY, RAZORPAY_SECRET_KEY } = process.env;

exports.signupPage = async (req, res) => {
  try {
    const nameRequired = req.session.errorName;
    const minCharacter = req.session.minName;
    const emailRequired = req.session.errorEmail;
    const invalidEmail = req.session.errorPattern;
    const savedEmail = req.session.email;
    const phoneRequired = req.session.errorPhone;
    const invalidPhone = req.session.errorDigits;
    const savedPhone = req.session.phone;
    const passwordRequired = req.session.errorPassword;
    const confirmPasswordRequired2 = req.session.errorconfirmPassword;
    const invalidPassword = req.session.checkPassword;
    const passInclude = req.session.passInclude;
    const confirmPassInclude = req.session.confirmPassInclude;
    const userExists = req.session.userExists;
    const terms = req.session.terms;

    req.session.errorName = "";
    req.session.minName = "";
    req.session.errorEmail = "";
    req.session.errorPattern = "";
    req.session.email = "";
    req.session.errorPhone = "";
    req.session.errorDigits = "";
    req.session.phone = "";
    req.session.errorPassword = "";
    req.session.errorconfirmPassword = "";
    req.session.checkPassword = "";
    req.session.passInclude = "";
    req.session.confirmPassInclude = "";
    req.session.userExists = "";
    req.session.terms = "";

    // storing form validation errors and messages in session
    return res.render("user/signup", {
      nameRequired,
      minCharacter,
      emailRequired,
      invalidEmail,
      savedEmail,
      phoneRequired,
      invalidPhone,
      savedPhone,
      passwordRequired,
      confirmPasswordRequired2,
      invalidPassword,
      passInclude,
      confirmPassInclude,
      userExists,
      terms,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.otpLoginPage = async (req, res) => {
  try {
    const email = req.session.email;
    const id = req.session.id;
    const emptyField = req.session.emptyDetails;
    const noRecords = req.session.noRecords;
    const codeExpired = req.session.codeExpired;
    const invalidCode = req.session.InvalidCode;

    req.session.id = "";
    req.session.emptyDetails = "";
    req.session.noRecords = "";
    req.session.codeExpired = "";
    req.session.InvalidCode = "";

    return res.render("user/otpLogin", {
      email,
      id,
      emptyField,
      noRecords,
      codeExpired,
      invalidCode,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.signinPage = async (req, res) => {
  try {
    const notExists = req.session.userNotRegistered;
    const invalidEmail2 = req.session.errorPattern2;
    const emailRequired2 = req.session.errorEmail2;
    const passwordRequired2 = req.session.errorPassword2;
    const passwordNotValid = req.session.isNotValidate;
    const passInclude2 = req.session.passInclude2;
    const accountBlocked = req.session.accountBlocked;
    const userNotVerified = req.session.userNotVerified;

    req.session.userNotRegistered = "";
    req.session.errorPattern2 = "";
    req.session.errorEmail2 = "";
    req.session.errorPassword2 = "";
    req.session.isNotValidate = "";
    req.session.passInclude2 = "";
    req.session.accountBlocked = "";
    req.session.userNotVerified = "";

    return res.render("user/signin", {
      notExists,
      invalidEmail2,
      emailRequired2,
      passwordRequired2,
      passwordNotValid,
      passInclude2,
      accountBlocked,
      userNotVerified
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.forgotPasswordPage = async (req, res) => {
  try {
    return res.render("user/verifyEmail", {
      noUserFound: req.session.noUserFound,
      errorEmail3: req.session.errorEmail3,
      errorPattern3: req.session.errorPattern3,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.changePasswordPage = async (req, res) => {
  try {
    const errorPassword3 = req.session.errorPassword3;
    const errorPassword4 = req.session.errorPassword4;
    const newPasswordNotMatch = req.session.newPasswordNotMatch;
    const email = req.session.email;

    req.session.errorPassword3 = "";
    req.session.errorPassword4 = "";
    req.session.newPasswordNotMatch = "";
    req.session.email = "";

    return res.render("user/changePassword", {
      errorPassword3,
      errorPassword4: req.session.errorPassword4,
      newPasswordNotMatch,
      email,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};
exports.homePage = async (req, res) => {
  try {
    
    const userLoggedEmail = req.session.userLoggedIn;
    const newUser = req.session.isAuthenticated;
    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    // Find all active categories
    const categories = await categoryDB.find({ active: true });

    // Find all active products
    const products = await productDB.find({ active: true });

    // Render the home page with the retrieved data
    return res.render("user/home", {
      products,
      users: user || null, // If user is not found, set it to null
      categories,
      newUser,
      userEmail: req.session.email, // Assuming you want to pass the email to the view
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.productDetailsPage = async (req, res) => {
  try {
    id = req.query.id;

    const userLoggedEmail = req.session.userLoggedIn;

    const productsDetails = await productDB.findById(id);
    const users = await userDB.find({ verified: true }, { block: false });
    const category = await categoryDB.find({ active: true });

    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    return res.render("user/productDetails", {
      user: user || null,
      products: productsDetails,
      users,
      category,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.accountDetailsPage = async (req, res) => {
  try {
    const userId = req.session.userId;
    const user = await userDB.findById({ _id: userId }).populate("addresses");

    const category = await categoryDB.find({ active: true });

    const defaultAddress = user.addresses.find((address) => address.default);

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
      notEqualPassword: req.session.notEqualPassword,
      alreadyUsedPassword: req.session.alreadyUsedPassword,
    };

    // Clear session errors after passing them to the view
    req.session.userFullNameRequired = "";
    req.session.fullNameRegex = "";
    req.session.userEmailRequired = "";
    req.session.emailRegex = "";
    req.session.userPhoneRequired = "";
    req.session.phoneRegex = "";
    req.session.errorCurrentPassword = "";
    req.session.currentPasswordRegex = "";
    req.session.notMatchingCurrentPassword = "";
    req.session.errorNewPassword = "";
    req.session.newPasswordRegex = "";
    req.session.errorConfirmPassword = "";
    req.session.confirmPasswordRegex = "";
    req.session.notEqualPassword = "";
    req.session.alreadyUsedPassword = "";

    return res.render("user/accountDetails", {
      category: category,
      user: user,
      defaultAddress: defaultAddress,
      validationErrors: validationErrors,
      req: req,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.wishlistPage = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;
    const userId = req.session.userId;
    const wishListItems = await wishListDB
      .findOne({ userId })
      .populate("product.productId");

    // Filter out inactive products
    const activeWishListItems = wishListItems?.product.filter(
      (item) => item.productId.active
    );
    const category = await categoryDB.find({ active: true });

    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    return res.render("user/wishlist", {
      user: user || null,
      category: category,
      wishListItems: activeWishListItems,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.cartPage = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;
    const userId = req.session.userId;

    // Find cart items and populate product details
    const cartItems = await cartDB
      .findOne({ userId })
      .populate("product.productId");

    // Filter out inactive products from cart items
    const activeCartItems = cartItems?.product.filter(
      (item) => item.productId.active
    );

    const noProductsInCart = req.session.noProductInCart;

    // Fetch active categories
    const category = await categoryDB.find({ active: true });

    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    req.session.noProductInCart = "";

    return res.render("user/cart", {
      user: user || null,
      category: category,
      cartItems: activeCartItems, // Pass active cart items to the template
      noProductsInCart,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.addressPage = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;
    const userId = req.session.userId;

    const user = await userDB.findById({ _id: userId }).populate("addresses");

    // Pagination
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const pageSize = 2; // Number of addresses per page
    const totalAddresses = user.addresses.length;
    const totalPages = Math.ceil(totalAddresses / pageSize);
    const startIndex = (page - 1) * pageSize;
    const endIndex = Math.min(startIndex + pageSize - 1, totalAddresses - 1);

    // Slice the addresses array to get addresses for the current page
    const addressesOnPage = user.addresses.slice(startIndex, endIndex + 1);

    const category = await categoryDB.find({ active: true });

    // Find the user with the provided email
    const users = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    return res.render("user/addresses", {
      user: users || null,
      category,
      addressesOnPage: addressesOnPage,
      totalPages: totalPages,
      currentPage: page,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.addAddressPage = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;

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
    const errorHouseNo = req.session.errorHouseNo;
    const houseNoRegex = req.session.houseNoRegex;
    const errorMobile = req.session.errorMobile;
    const mobileRegex = req.session.mobileRegex;

    const category = await categoryDB.find({ active: true });

    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

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

    return res.render("user/addAddress", {
      user: user || null,
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
      category: category,
      errorAddressExists: req.session.errorAddressExists,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.addressEdit = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;

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
    const errorHouseNo = req.session.errorHouseNo;
    const houseNoRegex = req.session.houseNoRegex;
    const errorMobile = req.session.errorMobile;
    const mobileRegex = req.session.mobileRegex;

    const addressId = req.query.id;

    const address = await addressDB.findOne({ _id: addressId });
    const category = await categoryDB.find({ active: true });

    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

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

    return res.render("user/editAddress", {
      user: user || null,
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
      category: category,
      errorAddressExists: req.session.errorAddressExists,
      address: address,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.checkoutPage = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;

    req.session.shippinCostAdded = "";

    const userId = req.session.userId;

    const user = await userDB.findById(userId).populate("addresses");
    const cart = await cartDB.findOne({ userId }).populate("product.productId");

    // Filter out inactive products from cart items
    const activeCartItems = cart?.product.filter(
      (item) => item.productId.active
    );

    let total = 0;
    let totalDiscount = [];
    let subTotal = 0;
    let subDiscount = 0;
    let shippingCost = 40.0;
    let price = 0;
    let discount = 0;

    if (activeCartItems && activeCartItems.length > 0) {
      activeCartItems.forEach((items) => {
        price = items.productId.price;
        discount = items.productId.discount || 0; // Check if discount is available
        subTotal += price * items.quantity;
        subDiscount += ((price * discount) / 100) * items.quantity;
        totalDiscount.push(
          (items.productId.price * items.productId.discount) / 100
        );
      });

      total = subTotal - subDiscount + shippingCost;
    }

    const category = await categoryDB.find({ active: true });

    // Find the user with the provided email
    const users = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    const errorfullName = req.session.errorfullName;
    const minFullName = req.session.minFullName;
    const errorAddress = req.session.errorAddress;
    const addressRegexError = req.session.addressRegexError;
    const errorCity = req.session.errorCity;
    const cityRegex = req.session.cityRegex;
    const errorZipCode = req.session.errorZipCode;
    const zipCodeRegex = req.session.zipCodeRegex;
    const errorHouseNo = req.session.errorHouseNo;
    const houseNoRegex = req.session.houseNoRegex;
    const errorAlternateNumber = req.session.erroralternateNumber;
    const alternateNumberRegex = req.session.alternateNumberRegex;
    const errorPhone = req.session.errorPhone;
    const phoneRegex = req.session.phoneRegex;
    const errorEmail = req.session.errorEmail;
    const emailRegex = req.session.emailRegex;
    const stockError = req.session.stockError;
    const couponPatterError = req.session.couponPatterError;
    const couponCodeIsNotMatch = req.session.couponCodeIsNotMatch;
    const COD = req.session.COD;
    const errorActiveProducts = req.session.errorActiveProducts;

    // clear session
    req.session.errorfullName = "";
    req.session.minFullName = "";
    req.session.errorEmail = "";
    req.session.emailRegex = "";
    req.session.errorAddress = "";
    req.session.addressRegexError = "";
    req.session.errorCity = "";
    req.session.cityRegex = "";
    req.session.errorState = "";
    req.session.stateRegex = "";
    req.session.errorZipCode = "";
    req.session.zipCodeRegex = "";
    req.session.errorHouseNo = "";
    req.session.houseNoRegex = "";
    req.session.errorMobile = "";
    req.session.mobileRegex = "";
    req.session.couponCodeError = "";
    req.session.couponPatterError = "";
    req.session.couponCodeIsNotMatch = "";
    req.session.COD = "";
    req.session.errorActiveProducts = "";

    return res.render("user/checkOut", {
      user: users || null,
      category: category,
      user: user,
      cart: activeCartItems,
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
      COD,
      errorActiveProducts,
      RAZORPAY_ID_KEY,
      couponPatterError,
      couponCodeIsNotMatch,
      couponDiscount: req.session.matchingCoupon,
      total,
      totalDiscount,
      subTotal,
      subDiscount,
      shippingCost,
      price,
      discount,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.orderPage = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;

    const userId = req.session.userId;

    // Retrieve the page and size parameters from the query string
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const size = parseInt(req.query.size) || 5; // Page size, default is 10

    // Calculate the offset and limit for pagination
    const offset = (page - 1) * size;
    const limit = size;

    const category = await categoryDB.find({ active: true });
    const orders = await orderDB
      .find({ "user.userId": userId })
      .sort({ orderDate: -1 })
      .skip(offset)
      .limit(limit);

    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    // Count the total number of orders for the user
    const totalOrders = await orderDB.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalOrders / size);

    return res.render("user/order", {
      user: user || null,
      category: category,
      orders: orders,
      page: page,
      limit: limit,
      totalPages: totalPages,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.walletPage = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;

    const userId = req.session.userId;

    const category = await categoryDB.find({ active: true });

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const wallet = await walletDB.findOne({ userId }).lean();

    if (wallet) {
      const totalTransactions = wallet.transactions.length;
      const totalPages = Math.ceil(totalTransactions / limit);

      const transactions = wallet.transactions
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)) // Newest transactions first
        .slice((page - 1) * limit, page * limit);

      wallet.transactions = transactions;
      wallet.totalPages = totalPages;
      wallet.currentPage = page;
    }

    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    return res.render("user/wallet", {
      user: user || null,
      category: category,
      wallet: wallet || { transactions: [], totalPages: 0, currentPage: 1 },
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

exports.orderDetails = async (req, res) => {
  try {
    const userLoggedEmail = req.session.userLoggedIn;

    const orderId = req.query.orderId;

    const category = await categoryDB.find({ active: true });

    const orderDetails = await orderDB
      .findOne({ _id: orderId })
      .populate("products.productId");

    // Find the user with the provided email
    const user = await userDB.findOne({
      email: userLoggedEmail,
      block: false,
      verified: true,
    });

    return res.render("user/orderDetails", {
      user: user || null,
      category: category,
      orderDetails: orderDetails,
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};

//  notFound Error render
exports.notFoundError = (req, res) => {
  return res.render("404");
};

// In userService or wherever you handle client-side errors
exports.ServerError = (req, res, context) => {
  return res.render("500", {
    context: context,
    buttonText: "Go Home",
    buttonLink: "/",
  });
};

exports.userLogout = async (req, res) => {
  try {
    req.session.destroy((err) => {
      if (err) {
        return res.status(500).json({ error: "Server Error" });
      }
      // Redirect or respond after destroying the session
      return res.redirect("/signin"); // Render to the sign in page
    });
  } catch (error) {
    return res.redirect("/ClientServer-Error");
  }
};
