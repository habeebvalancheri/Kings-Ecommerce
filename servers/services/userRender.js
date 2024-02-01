const productDB = require("../model/productSchema");
const userDB = require("../model/userSchema");
const categoryDB = require('../model/categorySchema');

exports.signup = async (req, res) => {
  try {
    console.log("Refreshed");
    // storing form validation errors and messages in session
    res.render('signup', {
      nameRequired: req.session.errorName,
      emailRequired: req.session.errorEmail,
      invalidEmail: req.session.errorPattern,
      savedEmail: req.session.email,
      passwordRequired: req.session.errorPassword,
      passwordRequired2: req.session.errorPassword2,
      invalidPassword: req.session.checkPassword,
      phoneRequired: req.session.errorPhone,
      invalidPhone: req.session.errorDigits,
      savedPhone: req.session.phone,
      userExists: req.session.userExists,
      terms : req.session.terms,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.otpLogin = async (req, res) => {
  try {
    res.render('otpLogin');
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.signin = async (req, res) => {
  try {
    console.log("hi");

    res.render('signin', {
      notExists: req.session.userNotRegistered,
      invalidEmail: req.session.errorPattern,
      emailRequired: req.session.errorEmail,
      passwordRequired: req.session.errorPassword,
      passwordNotValid: req.session.isNotValidate,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};

exports.forgotPasswordPage = async (req,res)=>{
try{
  email = req.query.email
  const user = await userDB.findOne({email});
  res.render('verifyEmail')
}catch(error){
console.error(error);
res.status(500).send("Server Error");
}
}

exports.home = async (req, res) => {
  try {
    console.log('session',req.session.Id);
    const categorys = await categoryDB.find({ active: true });
    const users = await userDB.find({ block: false},{verified: true });
    const products = await productDB.find({ active: true });
    res.render('home', { products, users, categorys, user: req.session.email });
  } catch (error) {
    console.error(error);
    return res.status(500).send("Server Error");
  }
};
 
exports.productDetailsPage = async(req,res)=>{
  try{
    id = req.query.id
    console.log(id);
    const productsDetails = await productDB.findById(id);
    const users = await userDB.find({verified:true},{block:false});
    const category = await categoryDB.find({active:true});
    console.log(category)
    console.log(users)
    console.log(productsDetails);
    res.render('productDetails',{products : productsDetails,users,category});

  }catch(error){
    console.log(error);
    return res.status(500).send("Server Error");
  }
}