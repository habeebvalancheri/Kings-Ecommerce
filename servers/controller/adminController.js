const userDB = require('../model/userSchema');
const productDB = require("../model/productSchema");
const dotenv = require('dotenv');
const upload = require("../controller/multerSetup");
const categoryDB = require('../model/categorySchema');
const multer = require('multer');
dotenv.config();

module.exports = {

  adminSignin: async (req, res) => {
    try {
      if (!req.body.email) {
        req.session.emailEmpty = "This field is required";
      }
      if (!req.body.password) {
        req.session.passwordEmpty = "This field is required";
      }
      if (req.body.password !== process.env.Admin_PASS) {
        req.session.passNotValid = "Invalid Password";
      }
      if (req.body.email !== process.env.Admin_EMAIL) {
        req.session.emailNotValid = "Invalid Email";
      }
      if (req.session.emailEmpty ||
        req.session.passwordEmpty ||
        req.session.passNotValid ||
        req.session.emailNotValid
      ) {
        return res.redirect('/adminLogin');
      }

      const { email, password } = req.body;

      if (email === process.env.Admin_EMAIL && password === process.env.Admin_PASS) {
        res.render('adminDashboard');
      }

    } catch (error) {
      console.error(error);
      res.status(500).json({
        status: "FAILED",
        message: error.message,
      });
    }
  },

  users: async (req, res) => {
    try {
      const users = await userDB.find();
      console.log(users);
      res.render('adminUsers', { users });
    } catch (error) {
      console.error('Invalid Users');
      res.status(500).send('Server Error');
    }
  },

  blockUser: async (req, res) => {
    try {
      const id = req.query.id;
      console.log(typeof id);
      const user = await userDB.findOne({ _id: id });
      console.log("hi");
      console.log(user);

      if (user.block === false) {
        await userDB.updateOne({ _id: id }, { $set: { block: true } });
        req.session.userBlocked = true
        return res.redirect('/admin-Users');
      } else if (user.block === true) {
        return res.status(400).send("User is already blocked");
      } else {
        return res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  unblockUser: async (req, res) => {
    try {
      const id = req.query.id;
      console.log(typeof id);
      const user = await userDB.findOne({ _id: id });
      console.log("hi");
      console.log(user);

      if (user.block === true) {
        await userDB.updateOne({ _id: id },{ $set: { block: false } });
        return res.redirect('/admin-Users');
      } else if (user.block === false) {
        res.status(400).send("User is already unblocked");
      } else {
        res.status(404).send("User not found");
      }
    } catch (error) {
      console.error("Error blocking user:", error);
      res.status(500).send("Internal Server Error");
    }
  },

  products: async (req, res) => {
    try {
      const products = await productDB.find({ active: true }).populate('category');
      console.log(products);
      return res.render('adminProducts', { products });
    } catch (error) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  },

  addProducts: async (req, res) => {
    try {
      const { pName, description, price, stock, discound, category } = req.body;

      const productImages = req.files.map((file) => file.filename);

      const categoryId = await categoryDB.findOne({name:category,active : true });

      if (!category) {
        return res.status(404).send('Category not found or category not added');
      }
      if(!categoryId){
        return res.redirect('/add-Products');
      }

      const newProduct = new productDB({
        pName: pName,
        description: description,
        price: price,
        stock: stock,
        discound: discound,
        category: categoryId._id,
        pImages: productImages,
      });

      await newProduct.save();
      res.redirect('/admin-Products');

    } catch (error) {
      console.error(error);
      res.status(500).send('Server error');
    }
  },

  update: async (req, res) => {
    try {
      const id = req.query.id;
      const products = await productDB.findById(id);
      const data = await categoryDB.find({active:true});
      return res.render('updateProducts', { products, data });
    } catch (error) {
      console.log(error);
    }
  },

  updateProducts: async (req, res) => {
    try {
      const { name, description, price, stock, discound, category } = req.body;

      const categoryId = await categoryDB.findOne({ name: category });

      await productDB.updateOne({
        pName: name,
        description: description,
        price: price,
        stock: stock,
        discound: discound,
        category: categoryId._id,
      });

      res.redirect('/admin-Products');
    } catch (error) {
      console.log(error);
    }
  },

  image: async (req, res) => {
    try {
      const id = req.query.id;
      const image = req.files.map((file) => file.filename);

      await productDB.findByIdAndUpdate(id, { pImages: image });

      res.redirect('/admin-Products');

    } catch (error) {
      console.log(error);
      res.status(500).send('Server Error');
    }
  },

  unlistProduct: async (req, res) => {
    try {
      const id = req.query.id;

      await productDB.updateMany({ category: id }, { $set: { categoryStats: false } });
      await productDB.updateOne({ _id: id }, { $set: { active: false } });

      return res.redirect('/admin-Products');

    } catch (error) {
      console.error(error);
      return res.status(500).send('Server Error');
    }
  },

  restoreProduct: async (req, res) => {
    try {
      const id = req.query.id;

      await productDB.updateMany({ category: id }, { $set: { categoryStats: true } });
      await productDB.findOneAndUpdate({ _id: id }, { $set: { active: true } });
      console.log(id);
      return res.redirect('/unlisted-products');

    } catch (error) {
      console.error(error);
      return res.status(500).send('Server Error');
    }
  },
};
