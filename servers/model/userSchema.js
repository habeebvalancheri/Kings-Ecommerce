const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const addressSchema = new Schema({
  Address: String,
  City: String,
  House_no: String,
  State: String,
  altr_number: Number,
  Postcode: Number,
});

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
  },
  address: [addressSchema], // Changed to an array if a user can have multiple addresses
  wallet: {
    type: Number,
    default: 0.0,
  },
  verified: Boolean,
});

const userDB = mongoose.model('userdb', detailsSchema);
module.exports = userDB;
