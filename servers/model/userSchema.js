const mongoose = require("mongoose");
const addressSchema = require('../model/addressSchema');

const detailsSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
  },
  confirmpassword: {
    type: String,
  },
  phone: {
    type: Number,
  },
  block: {
    type: Boolean,
    default:false,
  },
  addresses: [{type : mongoose.Schema.Types.ObjectId, ref : 'addressdb'}], // changed to reference another collection
  wallet: {
    type: Number,
    default: 0.0,
  },
  verified:{
    type:Boolean,
    default:false,
  } 
});

const userDB = mongoose.model('userdb', detailsSchema);
module.exports = userDB;
