const categoryDB = require("../../model/categorySchema");
const productDB = require("../../model/productSchema");
const userDB = require("../../model/userSchema");
const orderDB = require("../../model/orderSchema");
const couponDB = require("../../model/couponSchema");
const offerDB = require("../../model/offerSchema");

//  Admin Login Render
exports.adminLoginPage = (req, res) => {
  try {
    return res.render("admin/adminLogin", {
      adminPassword: process.env.Admin_PASS,
      adminEmail: process.env.Admin_EMAIL,
      userPassword: req.body.password,
      userEmail: req.body.email,
      emailEmpty: req.session.emailEmpty,
      passwordEmpty: req.session.passwordEmpty,
      passNotValid: req.session.passNotValid,
      emailNotValid: req.session.emailNotValid,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

exports.adminDashboardPage = async (req, res) => {
  try {
    // Fetch the count of users from the database
    const userCount = await userDB.countDocuments();
    const orderCount = await orderDB.countDocuments();

    const orders = await orderDB.find({}); // Retrieve all orders
    let totalSalesCount = 0;

    orders.forEach((order) => {
      order.products.forEach((product) => {
        totalSalesCount += product.quantity;
      });
    });

    const topSellingCategories = await orderDB.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.category",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "categoryDetails",
        },
      },
      { $unwind: "$categoryDetails" },
    ]);

    const topSellingProducts = await orderDB.aggregate([
      { $unwind: "$products" },
      {
        $group: {
          _id: "$products.productId",
          totalSold: { $sum: "$products.quantity" },
        },
      },
      { $sort: { totalSold: -1 } },
      { $limit: 10 },
      {
        $lookup: {
          from: "products",
          localField: "_id",
          foreignField: "_id",
          as: "productDetails",
        },
      },
      { $unwind: "$productDetails" },
    ]);

    // Render the adminDashboard page with the userCount
    return res.render("admin/adminDashboard", {
      topSellingCategories: topSellingCategories,
      topSellingProducts: topSellingProducts,
      userCount,
      orderCount,
      totalSalesCount,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin Product Page Render
exports.adminProductsPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const offset = (page - 1) * size;
    const limit = size;

    const products = await productDB
      .find({ active: true })
      .populate("category")
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(limit);

    const totalProducts = await productDB.countDocuments({ active: true });

    const totalPages = Math.ceil(totalProducts / size);

    // Get success and error messages from query parameters
    const successMessage = req.query.success;
    //  Pass success message to the view and clear it from session
    return res.render("admin/adminProducts", {
      products: products,
      success: successMessage,
      page: page,
      totalProducts: totalProducts,
      totalPages: totalPages,
      limit: limit,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin Add Product Page Render
exports.addProductsPage = async (req, res) => {
  try {
    const data = await categoryDB.find({ active: true });

    // Retrieve the form values from session
    const formData = {
      pName: req.session.pName || "",
      description: req.session.description || "",
      price: req.session.price || "",
      stock: req.session.stock || "",
      discount: req.session.discount || "",
      category: req.session.category || "",
    };

    const pNameRegexerror = req.session.pNameRegexerror;
    const descriptionRegexerror = req.session.descriptionRegexerror;
    const priceRegexerror = req.session.priceRegexerror;
    const stockRegexerror = req.session.stockRegexerror;
    const discountRegexerror = req.session.discountRegexerror;
    const categoryError = req.session.categoryError;
    const imageError = req.session.imageError;

    if (!req.query.error) {
      // Clear session errors after rendering
      req.session.pName = "";
      req.session.description = "";
      req.session.price = "";
      req.session.stock = "";
      req.session.discount = "";
      req.session.category = "";
      req.session.pNameRegexerror = "";
      req.session.descriptionRegexerror = "";
      req.session.priceRegexerror = "";
      req.session.stockRegexerror = "";
      req.session.discountRegexerror = "";
      req.session.categoryError = "";
      req.session.imageError = "";
    }
    return res.render("admin/addProducts", {
      data: data,
      formData,
      pNameRegexerror,
      descriptionRegexerror,
      priceRegexerror,
      stockRegexerror,
      discountRegexerror,
      categoryError,
      imageError,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin Update Product Page Render
exports.updateProductsPage = async (req, res) => {
  try {
    const id = req.query.id;

    const products = await productDB.findById({ _id: id });
    const pImages = products.pImages;

    const data = await categoryDB.find({ active: true });

    const category = await categoryDB
      .findOne({ _id: products.category, active: true })
      .lean();

    const categoryName = category.name;

    // Read the session error messages
    const imageError2 = req.session.imageError2;
    // Read the session error messages
    const pNameRegexerror2 = req.session.pNameRegexerror2;
    const descriptionRegexerror2 = req.session.descriptionRegexerror2;
    const priceRegexerror2 = req.session.priceRegexerror2;
    const stockRegexerror2 = req.session.stockRegexerror2;
    const discountRegexerror2 = req.session.discountRegexerror2;
    const categoryError2 = req.session.categoryError2;
    const generalError = req.session.generalError;

    // Read the session form data
    const formData = req.session.formData || {};

    // Clear session error messages
    req.session.pNameRegexerror2 = "";
    req.session.descriptionRegexerror2 = "";
    req.session.priceRegexerror2 = "";
    req.session.stockRegexerror2 = "";
    req.session.discountRegexerror2 = "";
    req.session.categoryError2 = "";
    req.session.generalError = "";
    // Clear the session error message after reading
    req.session.imageError2 = "";

    return res.render("admin/updateProducts", {
      id: id,
      images: pImages,
      imageError2,
      products: products,
      data: data,
      pNameRegexerror2,
      descriptionRegexerror2,
      priceRegexerror2,
      stockRegexerror2,
      discountRegexerror2,
      categoryError2,
      generalError,
      categoryName,
      formData,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin Unlist Product Page Render
exports.unlistedProductPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const data = await productDB
      .find({ active: false })
      .populate("category")
      .skip(skip)
      .limit(limit);

    const total = await productDB.countDocuments({ active: false });
    const totalPages = Math.ceil(total / limit);

    // Get success and error messages from query parameters
    const successMessage = req.query.success;
    const errorMessage = req.query.error;

    return res.render("admin/unlistedProducts", {
      data,
      success: successMessage,
      error: errorMessage,
      page,
      totalPages,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin Orders Page Render
exports.adminOrdersPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Changed 'size' to 'limit' for clarity

    const offset = (page - 1) * limit;

    const orders = await orderDB
      .find()
      .populate("user")
      .populate("products.productId")
      .skip(offset)
      .limit(limit)
      .sort({ orderDate: -1 });

    const totalOrders = await orderDB.countDocuments();

    const totalPages = Math.ceil(totalOrders / limit);

    return res.render("admin/adminOrders", {
      orders: orders,
      totalPages: totalPages,
      page: page,
      limit: limit,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin Orders details Page Render
exports.adminOrderDetailsPage = async (req, res) => {
  try {
    // Fetch orderId and productId from query parameters
    const { productId, orderId } = req.query;

    let orderDetails = await orderDB
      .find({ _id: orderId })
      .populate("products.productId");

    const user = await userDB.find();

    const product = orderDetails[0].products.filter(
      (value) => value.productId._id == productId
    );

    return res.render("admin/adminOrderDetails", {
      orderDetails: orderDetails[0],
      user: user[0],
      product: product[0],
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin Users Page Render
exports.adminUsersPage = async (req, res) => {
  try {
    // Retrieve the page and size parameters from the query string
    const page = parseInt(req.query.page) || 1; // Current page, default is 1
    const size = parseInt(req.query.size) || 5; // Page size, default is 10

    // Calculate the offset and limit for pagination
    const offset = (page - 1) * size;
    const limit = size;

    const users = await userDB
      .find()
      .sort({ _id: -1 })
      .skip(offset)
      .limit(limit);

    // Count the total number of orders for the user
    const totalUsers = await userDB.countDocuments();

    // Calculate the total number of pages
    const totalPages = Math.ceil(totalUsers / size);

    return res.render("admin/adminUsers", {
      users,
      page: page,
      limit: limit,
      totalPages: totalPages,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin Categorys Page Render
exports.adminCategorysPage = async (req, res) => {
  try {
    // Get page and size from query parameters or set default values
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const offset = (page - 1) * size;

    const category = await categoryDB
      .find({ active: true })
      .sort({ createdAt: -1 })
      .skip(offset)
      .limit(size);

    // Get total count of categories
    const totalCategories = await categoryDB.countDocuments({ active: true });
    const totalPages = Math.ceil(totalCategories / size);

    // Get success and error messages from query parameters
    const successMessage = req.query.success;
    const errorMessage = req.query.error;

    return res.render("admin/adminCategory", {
      category: category,
      success: successMessage,
      error: errorMessage,
      page: page,
      totalCategories: totalCategories,
      totalPages: totalPages,
      limit: size,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Add Category Page Render
exports.addCategoryPage = async (req, res) => {
  try {
    const emptyName = req.session.emptyName;
    const duplicate = req.session.duplicate;
    const categoryPattern = req.session.categoryPattern;
    const categoryName = req.session.categoryName || "";
    // Get success and error messages from query parameters
    const successMessage = req.query.success;
    const errorMessage = req.query.error;

    req.session.emptyName = "";
    req.session.duplicate = "";
    req.session.categoryPattern = "";
    req.session.categoryName = "";

    return res.render("admin/addCategory", {
      emptyName,
      duplicate,
      categoryPattern,
      categoryName,
      success: successMessage,
      error: errorMessage,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Unlisted Category Page
(exports.unlistedCategoryPage = async (req, res) => {
  try {
    // Get page and size from query parameters or set default values
    const page = parseInt(req.query.page) || 1;
    const size = parseInt(req.query.size) || 10;

    const offset = (page - 1) * size;

    const data = await categoryDB
      .find({ active: false })
      .skip(offset)
      .limit(size);

    // Get total count of unlisted categories
    const totalCategories = await categoryDB.countDocuments({ active: false });
    const totalPages = Math.ceil(totalCategories / size);

    // Get success and error messages from query parameters
    const successMessage = req.query.success;
    const errorMessage = req.query.error;

    return res.render("admin/unlistedCategory", {
      category: data,
      success: successMessage,
      error: errorMessage,
      page: page,
      totalCategories: totalCategories,
      totalPages: totalPages,
      limit: size,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
}),
  // Admin Coupons Page Render
  (exports.adminCouponsPage = async (req, res) => {
    try {
      const page = parseInt(req.query.page) || 1;
      const limit = parseInt(req.query.limit) || 10;

      const offset = (page - 1) * limit;

      // Fetch active and non-expired coupons
      const coupons = await couponDB
        .find({ active: true, expired: false })
        .sort({ createdAt: -1 })
        .skip(offset)
        .limit(limit);

      // Count the total number of active and non-expired coupons
      const totalCoupons = await couponDB.countDocuments({
        active: true,
        expired: false,
      });

      const totalPages = Math.ceil(totalCoupons / limit);

      return res.render("admin/adminCoupon", {
        coupons,
        totalPages: totalPages,
        page: page,
        limit: limit,
      });
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  });

//  Add Coupons Page Render
exports.addCouponPage = async (req, res) => {
  try {
    const categories = await categoryDB.find({ active: true });

    const couponCode = req.session.couponCode;
    const discount = req.session.discount;
    const couponCount = req.session.couponCount;
    const maxAmount = req.session.maxAmount;
    const validFromValue = req.session.validFromValue;
    const validToValue = req.session.validToValue;

    const couponCodeError = req.session.couponCodeError;
    const couponCodeRegex = req.session.couponCodeRegex;
    const discountError = req.session.discountError;
    const discountRegex = req.session.discountRegex;
    const categoryNotFound = req.session.categoryError;
    const couponCountError = req.session.couponCountError;
    const couponCountRegex = req.session.couponCountRegex;
    const maxAmountError = req.session.maxAmountError;
    const maxAmountRegex = req.session.maxAmountRegex;
    const categoryError = req.session.categoryCouponExists;
    const validFromError = req.session.validFromError;
    const validToError = req.session.validToError;
    const couponExists = req.session.couponExists;
    const validFrom = req.session.validFrom;
    const validTo = req.session.validTo;

    req.session.couponCodeError = "";
    req.session.couponCodeRegex = "";
    req.session.discountError = "";
    req.session.discountRegex = "";
    req.session.categoryError = "";
    req.session.couponCountError = "";
    req.session.couponCountRegex = "";
    req.session.maxAmountError = "";
    req.session.maxAmountRegex = "";
    req.session.categoryCouponExists = "";
    req.session.validFromError = "";
    req.session.validToError = "";
    req.session.couponExists = "";
    req.session.validFrom = "";
    req.session.validTo = "";

    return res.render("admin/addCoupon", {
      couponCodeError,
      couponCodeRegex,
      discountError,
      discountRegex,
      categoryNotFound,
      couponCountError,
      couponCountRegex,
      maxAmountError,
      maxAmountRegex,
      categoryError,
      validFromError,
      validToError,
      couponExists,
      validFrom,
      validTo,
      categories,
      couponCode,
      discount,
      couponCount,
      maxAmount,
      validFromValue,
      validToValue,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

// Admin Deleted Coupons Page Render
exports.deleteCouponPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;

    const offset = (page - 1) * limit;

    // Fetch inactive and expired coupons, sorted by expiration date in descending order
    const unlistedCoupons = await couponDB
      .find({ active: false, expired: true })
      .sort({ expiresAt: -1 })
      .skip(offset)
      .limit(limit);

    // Count the total number of inactive and expired coupons
    const totalCoupons = await couponDB.countDocuments({
      active: false,
      expired: true,
    });

    const totalPages = Math.ceil(totalCoupons / limit);

    return res.render("admin/deleteCoupon", {
      unlistedCoupons,
      totalPages: totalPages,
      page: page,
      limit: limit,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Admin offer Page Render
exports.adminOfferPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Set default limit if not provided

    // Fetch the total number of offers
    const totalOffers = await offerDB.countDocuments({
      active: true,
      expired: false,
    });

    const offers = await offerDB
      .find({ active: true, expired: false })
      .sort({ createdAt: -1 })
      .limit(limit);

    const totalPages = Math.ceil(totalOffers / limit);
    // Success and error messages
    const successMessage = req.session.successMessage;

    return res.render("admin/adminOffer", {
      offers,
      currentPage: page,
      totalPages,
      limit,
      successMessage,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Add offer Page Render
exports.addOfferPage = async (req, res) => {
  try {
    const categories = await categoryDB.find({ active: true });

    const categoryCode = req.session.categoryCode;
    const discount = req.session.discount;
    const validFromValue = req.session.validFromValue;
    const validToValue = req.session.validToValue;

    const categoryError = req.session.req.session.categoryCodeError;
    const discountError = req.session.discountError;
    const discountRegex = req.session.discountRegex;
    const validationFrom = req.session.validFromError;
    const validationTo = req.session.validToError;
    const categoryMatch = req.session.categoryCodeNotMatch;
    const offerExists = req.session.offerExists;
    const validFrom = req.session.validFrom2;
    const validTo = req.session.validTo2;

    const errorMessage = req.session.errorMessage;

    // Clear the message after fetching it
    req.session.categoryCodeError = "";
    req.session.discountError = "";
    req.session.discountRegex = "";
    req.session.validFromError = "";
    req.session.validToError = "";
    req.session.categoryCodeNotMatch = "";
    req.session.offerExists = "";
    req.session.validFrom2 = "";
    req.session.validTo2 = "";

    return res.render("admin/addOffer", {
      categoryError,
      discountError,
      discountRegex,
      validationFrom,
      validationTo,
      categoryMatch,
      offerExists,
      validFrom,
      validTo,
      categories,
      errorMessage,
      categoryCode,
      discount,
      validFromValue,
      validToValue,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

//  Update offer Page Render
exports.updateOfferPage = async (req, res) => {
  try {
    const id = req.query.id;

    const offers = await offerDB.find({ _id: id });
    const categories = await categoryDB.find({ active: true });

    const categoryError = req.session.req.session.categoryCodeError;
    const discountError = req.session.discountError;
    const discountRegex = req.session.discountRegex;
    const validationFrom = req.session.validFromError;
    const validationTo = req.session.validToError;
    const categoryMatch = req.session.categoryCodeNotMatch;
    const offerExists = req.session.offerExists;
    const validFrom = req.session.validFrom2;
    const validTo = req.session.validTo2;

    const errorMessage = req.session.errorMessage;

    // Clear the message after fetching it
    req.session.categoryCodeError = "";
    req.session.discountError = "";
    req.session.discountRegex = "";
    req.session.validFromError = "";
    req.session.validToError = "";
    req.session.categoryCodeNotMatch = "";
    req.session.offerExists = "";
    req.session.validFrom2 = "";
    req.session.validTo2 = "";

    return res.render("admin/updateOffer", {
      offers,
      categoryError,
      discountError,
      discountRegex,
      validationFrom,
      validationTo,
      categoryMatch,
      offerExists,
      validFrom,
      validTo,
      categories,
      errorMessage,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

exports.deleteOfferPage = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10; // Set default limit if not provided

    // Fetch the total number of offers
    const totalOffers = await offerDB.countDocuments({
      active: false,
      expired: true,
    });

    // Fetch the offers with pagination
    const offers = await offerDB
      .find({ active: false, expired: true })
      .sort({ expiresAt: -1 })
      .limit(limit);

    const totalPages = Math.ceil(totalOffers / limit);

    return res.render("admin/deleteOffer", {
      offers,
      currentPage: page,
      totalPages,
      limit,
    });
  } catch (error) {
    return res.redirect("/AdminServer-Error");
  }
};

// In adminService or wherever you handle admin-side errors
exports.ServerError = (req, res, context) => {
  return res.render("500", {
    context: context,
    buttonText: "Go Admin Dashboard",
    buttonLink: "/admin-Dashboard",
  });
};

//  Admin Logout Render
exports.adminLogout = (req, res) => {
  req.session.adminLoggedIn = false;

  return res.render("admin/adminLogin", {
    emailEmpty: req.session.emailEmpty,
    passwordEmpty: req.session.passwordEmpty,
    passNotValid: req.session.passNotValid,
    emailNotValid: req.session.emailNotValid,
  });
};
