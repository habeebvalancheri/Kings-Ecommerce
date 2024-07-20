const express = require("express");
const router = express.Router();
const userController = require("../controller/userController");
const userService = require("../services/userRender");
const middlewares = require("../middleware/UserMiddleware");
const addressController = require("../controller/AddressController");

// Home
router.get("/", userService.homePage); // Render home page Route

// Signup
router.get("/signup", userService.signupPage); // Render signup page Route
router.post("/api/signupUser", userController.newUser); // Save new user Route

// Signin
router.get(
  "/signin",
  middlewares.redirectIfUserLoggedIn,
  userService.signinPage
); // Render signin page Route
router.post("/api/signinUser", userController.alreadyUser); // Already User Route

// OTP Page Routes
router.get("/otpLogin", userService.otpLoginPage); //Render otp page
router.post("/verifyOTP", userController.otp);
router.get("/resendOTP", userController.resendOTP);

// Forgot password Routes
router.get("/forgot-password", userService.forgotPasswordPage);
router.post("/sendResetPasswordOTP", userController.checkEmail);
router.get("/changePassword", userService.changePasswordPage);
router.post("/changePassword", userController.forgotPassword);

// Product Page Routes
router.get("/product-Details", userService.productDetailsPage);
router.get("/products", userController.productsInShop);

// User Account Details Page Route
router.get(
  "/account-details",
  middlewares.userLoggedOut,
  userService.accountDetailsPage
);

//profile
router.post("/updateProfile", userController.updateUserProfile);

// User Address add
router.get("/address", middlewares.userLoggedOut, userService.addressPage);
router.get(
  "/addAddress",
  middlewares.userLoggedOut,
  userService.addAddressPage
);
router.post("/add-address", addressController.address);
router.get("/edit-address", middlewares.userLoggedOut, userService.addressEdit);
router.post("/update-address", addressController.updateAddress);
router.get("/remove-address", addressController.removeAddress);

//  User Wishlist Page Route
router.get("/wish-list", middlewares.userLoggedOut, userService.wishlistPage);
router.post("/addToWishList", userController.addToWishList);
router.get("/getTotalItemsInWishList", userController.getTotalItemsInWishList);
router.get("/remove-wishlist", userController.removeFromWishlist);

//  User Cart Page Route
router.get("/cart", middlewares.userLoggedOut, userService.cartPage);
router.post("/addToCart", userController.addToCart);
router.post("/updateCart", userController.updateCart);
router.get("/getTotalItemsInCart", userController.getTotalItemsInCart);
router.get("/remove-cart", userController.removeFromCart);

// check out
router.get("/checkout", middlewares.userLoggedOut, userService.checkoutPage);
router.post("/check-out", userController.checkOut);

//  User Order Page Route
router.get("/order", middlewares.userLoggedOut, userService.orderPage);
router.get(
  "/order-details",
  middlewares.userLoggedOut,
  userService.orderDetails
);

router.get("/wallet", middlewares.userLoggedOut, userService.walletPage);

router.post("/onlinePayment", userController.onlinePayment);
router.post("/walletPayment", userController.walletPayment);
router.post("/couponCode", userController.couponCodeApply);
router.post("/removeCoupon", (req, res) => {
  req.session.shippinCostAdded = false;
  res.json({ success: true });
});
router.post("/submit-Order", userController.submitOrder);
router.post("/cancelOrder", userController.cancelOrder);
router.post("/returnOrder", userController.returnOrder);

router.get("/download-invoice", userController.invoiceDownload);

// Error Pages
router.get(
  "/NotFound-Error",
  middlewares.userLoggedOut,
  userService.notFoundError
);
router.get("/ClientServer-Error", middlewares.userLoggedOut, (req, res) => {
  userService.ServerError(req, res, "client");
});

//  User Logout Route
router.get("/logout", middlewares.userLoggedOut, userService.userLogout);

module.exports = router;
