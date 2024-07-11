const mongoose = require("mongoose");

const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      unique: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    // You can add more fields as needed for your specific use case
  },
  { timestamps: true }
); // Add this line to enable timestamps

const Category = mongoose.model("Category", categorySchema);

module.exports = Category;
