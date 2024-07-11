const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const productSchema = new Schema(
  {
    pName: {
      type: String,
    },
    pImages: {
      type: [String],
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
    },
    description: {
      type: String,
    },
    reviews: [
      {
        feedback: String,
        rating: String,
      },
    ],
    price: {
      type: Number,
    },
    discount: {
      type: Number,
    },
    active: {
      type: Boolean,
      default: true,
    },
    stock: {
      type: Number,
      default: 0,
    },
    categoryStats: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
); // Add this line to enable timestamps

const ProductDB = mongoose.model("Product", productSchema);

module.exports = ProductDB;
