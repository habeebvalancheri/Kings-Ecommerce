const express = require("express");
const router = express.Router();
const adminController = require("../../controller/adminController");
const adminService = require("../../services/admin/adminRender");
const categoryController = require("../../controller/categoryController");
const categoryService = require("../../services/admin/adminRender");
const upload = require("../../controller/multerSetup");
const adminMiddleware = require("../../middleware/adminMiddleware");

// Admin Authentication
router.get(
  "/adminLogin",
  adminMiddleware.redirectIfAdminLoggedIn,
  adminService.adminLoginPage
);
router.post("/api/adminSignin", adminController.adminSignin);

// Admin Dashboard
router.get(
  "/admin-Dashboard",
  adminMiddleware.adminLoggedOut,
  adminService.adminDashboardPage
);

// Admin Orders
router.get(
  "/admin-Orders",
  adminMiddleware.adminLoggedOut,
  adminService.adminOrdersPage
);
router.get(
  "/admin-Order-Details",
  adminMiddleware.adminLoggedOut,
  adminService.adminOrderDetailsPage
);
router.post(
  "/admin-ChangeOrder",
  adminMiddleware.adminLoggedOut,
  adminController.adminChangeOrder
);
router.post(
  "/admin-ChangeReturn",
  adminMiddleware.adminLoggedOut,
  adminController.adminChangeReturn
);
router.get(
  "/exportOrder",
  adminMiddleware.adminLoggedOut,
  adminController.exportOrder
);
router.get(
  "/exportOrderPDF",
  adminMiddleware.adminLoggedOut,
  adminController.exportOrderPDF
);
// Route to fetch sales data based on date range
router.get("/sales", adminController.getSalesData);
// Admin Coupon
router.get(
  "/admin-Coupon",
  adminMiddleware.adminLoggedOut,
  adminService.adminCouponsPage
);
router.get(
  "/addCoupon",
  adminMiddleware.adminLoggedOut,
  adminService.addCouponPage
);
router.post("/add-Coupon", adminController.addCoupon);
router.get(
  "/deleteCoupon",
  adminMiddleware.adminLoggedOut,
  adminService.deleteCouponPage
);
router.get("/delete-Coupon", adminController.deleteCoupon);
// Admin offers
router.get(
  "/admin-offers",
  adminMiddleware.adminLoggedOut,
  adminService.adminOfferPage
);
router.get(
  "/addOffers",
  adminMiddleware.adminLoggedOut,
  adminService.addOfferPage
);
router.post("/add-Offers", adminController.addOffer);
router.get(
  "/deleteOffers",
  adminMiddleware.adminLoggedOut,
  adminService.deleteOfferPage
);
router.get("/delete-Offers", adminController.deleteOffer);
router.get(
  "/updateOffers",
  adminMiddleware.adminLoggedOut,
  adminService.updateOfferPage
);
router.post("/update-Offers", adminController.updateOffer);

// Admin User Management
router.get(
  "/admin-Users",
  adminMiddleware.adminLoggedOut,
  adminService.adminUsersPage
);
router.get("/block-User", adminController.blockUser);
router.get("/unblock-User", adminController.unblockUser);

// Admin Product Management
router.get(
  "/admin-Products",
  adminMiddleware.adminLoggedOut,
  adminService.adminProductsPage
);
router.get(
  "/add-Products",
  adminMiddleware.adminLoggedOut,
  adminService.addProductsPage
);
router.post(
  "/api/add-Products",
  upload.array("image", 4),
  adminController.addProducts
);
router.get(
  "/update-Product",
  adminMiddleware.adminLoggedOut,
  adminService.updateProductsPage
);
router.post("/api/update-product", adminController.updateProducts);
router.post(
  "/upload-image",
  upload.array("image", 4),
  adminController.imageUploaded
);
router.post("/remove-image", adminController.removeImages);
router.get(
  "/unlisted-Products",
  adminMiddleware.adminLoggedOut,
  adminService.unlistedProductPage
);
router.get("/unlist-Product", adminController.unlistProduct);
router.get("/restore-product", adminController.restoreProduct);

// Admin Category Management
router.get(
  "/admin-Category",
  adminMiddleware.adminLoggedOut,
  categoryService.adminCategorysPage
);
router.get(
  "/add-Category",
  adminMiddleware.adminLoggedOut,
  categoryService.addCategoryPage
);
router.post("/add-Category", categoryController.addCategory);
router.get(
  "/unlisted-Categories",
  adminMiddleware.adminLoggedOut,
  adminService.unlistedCategoryPage
);
router.get("/unlist-Category", categoryController.unlistCategory);
router.get("/restore-category", categoryController.restoreCategory);

// Error Pages
router.get(
  "/AdminServer-Error",
  adminMiddleware.adminLoggedOut,
  adminService.ServerError
);
// Admin Logout
router.get(
  "/adminLogout",
  adminMiddleware.adminLoggedOut,
  adminService.adminLogout
);

module.exports = router;
