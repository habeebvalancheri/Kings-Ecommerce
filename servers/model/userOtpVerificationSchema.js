const mongoose = require('mongoose');
const Schema = mongoose.Schema

const userOtpVerificationSchema = new Schema({
  email : String,
  userId : String,
  otp : String,
  createdAt : Date,
  expiredAt : Date,
});

const userOtpVerification = mongoose.model(
  "userOtpVerification",
  userOtpVerificationSchema
);

module.exports = userOtpVerification;

