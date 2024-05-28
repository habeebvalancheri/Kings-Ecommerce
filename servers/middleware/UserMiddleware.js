

exports.redirectIfUserLoggedIn = (req,res,next)=>{
  if(req.session.userLoggedIn){
    res.redirect("/");
  }else{
    next()
  }
};

exports.userLoggedOut = (req,res,next)=>{
  if(req.session.userLoggedIn){
    next()
  }else{
    res.redirect("/signin");
  }
};

