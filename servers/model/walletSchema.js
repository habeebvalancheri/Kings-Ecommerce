

const mongoose = require('mongoose');

const walletSchema = new mongoose.Schema({
  wallet :{
    type:Number,
    default:0.0,
  }
});

const wallet = new mongoose.model("Wallet",walletSchema);
module.exports = wallet;