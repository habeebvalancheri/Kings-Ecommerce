const categoryDB = require("../model/categorySchema");
const productDB = require("../model/productSchema");

module.exports = {
  addCategory: async (req, res) => {
    try {
      req.session.emptyName = "";
      req.session.duplicate = "";
      req.session.categoryPattern = "";

      let { categoryName } = req.body;
      // Trim leading and trailing spaces
      categoryName = categoryName.trim();

      // Validate category name
      if (!categoryName) {
        req.session.emptyName = "Enter a Category Name";
        req.session.categoryName = categoryName;
        return res.redirect(
          "/add-Category?error=Category Not Added Check The Field"
        );
      }

      if (!/^[a-zA-Z][a-zA-Z\s]*[a-zA-Z]$/.test(categoryName.trim())) {
        req.session.categoryPattern =
          "Category name must contain only letters and spaces, with no spaces at the beginning or end.";
        req.session.categoryName = categoryName;
        return res.redirect(
          "/add-Category?error=Category Not Added Check The Field"
        );
      }

      const existingCategory = await categoryDB.findOne({ name: categoryName });

      if (existingCategory) {
        req.session.duplicate = "Category with this name already exists";
        req.session.categoryName = categoryName;
        return res.redirect(
          "/add-Category?error=Category Not Added Category Not Added Check The Field"
        );
      }

      const category = new categoryDB({
        name: categoryName,
      });

      await category.save();

      return res.redirect(
        "/admin-Category?success=Category Added successfully"
      );
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  unlistCategory: async (req, res) => {
    try {
      const id = req.query.category;

      await productDB.updateMany(
        { category: id },
        { $set: { categoryStats: false } }
      );
      await categoryDB.updateOne({ _id: id }, { $set: { active: false } });

      return res.redirect(
        "/admin-Category?success=Category unlisted successfully"
      );
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },

  restoreCategory: async (req, res) => {
    try {
      const id = req.query.category;

      await productDB.updateMany(
        { category: id },
        { $set: { categoryStats: true } }
      );
      await categoryDB.updateOne({ _id: id }, { $set: { active: true } });

      return res.redirect(
        "/unlisted-Categories?success=Category restored successfully"
      );
    } catch (error) {
      return res.redirect("/AdminServer-Error");
    }
  },
};
