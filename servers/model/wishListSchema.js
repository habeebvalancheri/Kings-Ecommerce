const mongoose = require('mongoose');

const wishListSchema = new mongoose.Schema({
  userId:{
    type:mongoose.Schema.Types.ObjectId,
    ref:'userdb'
  },
  product:[{
    productId:{
      type:mongoose.Schema.Types.ObjectId,
      ref:'Product'
    },
    quantity:{
      type:Number,
      default:1
    }
  }]
})

const wishListDB = mongoose.model("wishListDB",wishListSchema);
module.exports = wishListDB;