const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const userOtpVerificationSchema = new Schema({
  email: String,
  userId: String,
  otp: String,
  createdAt: Date,
  expiredAt: Date,  
});


const UserOtpVerification = mongoose.model('UserOtpVerification', userOtpVerificationSchema);

module.exports = UserOtpVerification;
