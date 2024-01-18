


exports.signup = (req,res)=>{
  console.log("hyy");
 const exist = req.session.emailExist;
  req.session.emailExist = true;
  // storing form validation errors and messages in session
 res.render('signup',{
  exist,
  nameRequired : req.session.errorName,
  emailRequired : req.session.errorEmail,
  invalidEmail : req.session.errorPattern,
  savedEmail : req.session.email,
  passwordRequired : req.session.errorPassword,
  passwordRequired2 : req.session.errorPassword2,
  invalidPassword : req.session.checkPassword,
  phoneRequired : req.session.errorPhone,
  invalidPhone : req.session.errorDigits,
  savedPhone   : req.session.phone,
  userExists : req.session.userExists,
 },
 )
}

exports.otpLogin = (req,res) =>{
  res.render('otpLogin')
}

exports.signin = (req, res) => {
  console.log("hi");

  res.render('signin', {
    notExists : req.session.userNotRegistered,
    invalidEmail: req.session.errorPattern,
    emailRequired: req.session.errorEmail,
    passwordRequired: req.session.errorPassword,
    passwordNotValid : req.session.isNotValidate ,
  });
}; 