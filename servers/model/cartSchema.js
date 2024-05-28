const mongoose = require('mongoose');

const cartSchema = new mongoose.Schema({
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

const cartDB = mongoose.model("cartDB",cartSchema);
module.exports = cartDB;