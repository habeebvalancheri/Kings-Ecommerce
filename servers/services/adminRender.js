const categoryDB = require('../model/categorySchema');
const productDB = require("../model/productSchema");

exports.admin = (req, res) => {
  res.render('adminLogin');
};

exports.addProductsPage = async (req, res) => {
  try {
    const data = await categoryDB.find();
    console.log(data);
    res.render('addProducts', { data });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

exports.addCategory = (req, res) => {
  res.render('add-Category');
};

exports.unlistedProducts = async (req, res) => {
  try {
    const data = await productDB.find({ active: false }).populate('category');
    console.log(data);
    res.render('unlistedProducts', { data });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.updateImage = async (req, res) => {
  try {
    const id = req.query.id;
    const image = await productDB.findById(id);
    console.log(image);
    res.render('updateImages', { id, image });
  } catch (error) {
    console.log(error);
    res.status(500).send("Server error");
  }
};

exports.dashboard = (req, res) => {
  res.render("adminDashboard");
};

exports.order = (req, res) => {
  res.render("adminOrders");
};

exports.category = async (req, res) => {
  try {
    const category = await categoryDB.find();
    res.render("adminCategory", { category });
  } catch (error) {
    console.error(error);
    res.status(500).send("Server Error");
  }
};

exports.coupon = (req, res) => {
  res.render("adminCoupon");
};

exports.banner = (req, res) => {
  res.render("adminBanners");
};

exports.logout = (req, res) => {
  res.render("adminLogin");
};
