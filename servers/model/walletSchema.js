const mongoose = require("mongoose");

const walletSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
    unique: true,
  },
  walletBalance: {
    type: Number,
    default: 0.0,
  },
  transactions: [
    {
      amount: {
        type: Number,
        required: true,
      },
      timestamp: {
        type: Date,
        default: Date.now,
      },
      debit: {
        type: Boolean,
        default: false,
      },
      credit: {
        type: Boolean,
        default: false,
      },
      status: {
        type: String,
        default: null,
      },
      transactionId: {
        type: String,
        required: true,
      },
      razorpay_payment_id: {
        type: String,
        default: null,
      },
      razorpay_order_id: {
        type: String,
        default: null,
      },
      razorpay_signature: {
        type: String,
        default: null,
      },
    },
  ],
});

const wallet = new mongoose.model("Wallet", walletSchema);
module.exports = wallet;
