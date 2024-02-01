const express = require("express");
const router = express.Router();
const adminController = require('../controller/adminController');
const adminService = require('../services/adminRender');
const categoryController = require('../controller/categoryController');
const upload = require('../controller/multerSetup');

// Admin Authentication
router.get('/adminLogin', adminService.admin);
router.post('/api/adminSignin', adminController.adminSignin);

// Admin Dashboard
router.get('/admin-Dashboard', adminService.dashboard);

// Admin Orders
router.get('/admin-Orders', adminService.order);

// Admin Coupon
router.get('/admin-Coupon', adminService.coupon);

// Admin Banners
router.get('/admin-Banners', adminService.banner);

// Admin User Management
router.get('/admin-Users', adminController.users);
router.get('/block-User', adminController.blockUser);
router.get('/unblock-User', adminController.unblockUser);

// Admin Product Management
router.get('/admin-Products', adminController.products);
router.get('/add-Products', adminService.addProductsPage);
router.post('/api/add-Products', upload.array('image', 4), adminController.addProducts);
router.get('/update-Product', adminController.update);
router.post("/api/update-product", adminController.updateProducts);
router.get('/update-Image', adminService.updateImage);
router.post('/upload-image', upload.array('image', 4), adminController.image);
router.get('/unlisted-Products', adminService.unlistedProducts);
router.get('/unlist-Product', adminController.unlistProduct);
router.get('/restore-product', adminController.restoreProduct);

// Admin Category Management
router.get('/admin-Category', categoryController.category);
router.get('/add-Category', categoryController.addCategoryPage);
router.post('/add-Category', categoryController.addCategory);
router.get('/unlisted-Categories', categoryController.unlisted);
router.get('/unlist-Category', categoryController.unlistCategory);
router.get('/restore-category', categoryController.restoreCategory);

// Admin Logout
router.get('/adminLogout', adminService.logout);

module.exports = router;
