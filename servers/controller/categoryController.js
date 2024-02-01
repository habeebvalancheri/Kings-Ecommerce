const categoryDB = require('../model/categorySchema');
const productDB = require("../model/productSchema");

module.exports = {
  category: async (req, res) => {
    try {
      const category = await categoryDB.find({ active: true });
      console.log(category);
      res.render("adminCategory", { category });
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  addCategoryPage: async (req, res) => {
    try {
      res.render("addCategory");
    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  addCategory: async (req, res) => {
    try {
      const { categoryName } = req.body;

      if (!categoryName) {
        req.session.emptyName = "Enter a Category Name";
        return res.redirect('/addCategory');
      }

      const existingCategory = await categoryDB.findOne({ name: categoryName });

      if (existingCategory) {
        req.session.duplicate = "Category with this name already exists";
        return res.redirect('/add-Category');
      }

      const category = new categoryDB({
        name: categoryName,
      });

      await category.save();
      console.log(category);
      res.redirect('/admin-Category');

    } catch (error) {
      console.error(error);
      res.status(500).send("Server Error");
    }
  },

  unlisted: async (req, res) => {
    try {
      const data = await categoryDB.find({ active: false });
      res.render("unlistedCategory", { category: data });
    } catch (error) {
      console.log(error);
      res.status(500).send("Server Error");
    }
  },

  unlistCategory: async (req, res) => {
    try {
      const id = req.query.category;

      await productDB.updateMany({ category: id }, { $set: { categoryStats: false } });
      await categoryDB.updateOne({ _id: id }, { $set: { active: false } });

      return res.redirect('/admin-Category');

    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
  },

  restoreCategory: async (req, res) => {
    try {
      const id = req.query.category;

      await productDB.updateMany({ category: id }, { $set: { categoryStats: true } });
      await categoryDB.updateOne({ _id: id }, { $set: { active: true } });
      console.log(id);
      return res.redirect('/unlisted-Categories');

    } catch (error) {
      console.error(error);
      return res.status(500).send("Server Error");
    }
  },
};
