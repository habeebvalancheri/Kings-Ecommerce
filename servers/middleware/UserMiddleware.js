

exports.isUserLogged = (req,res,next)=>{
  if(req.session.isLogged){
    next()
  }else{
    res.redirect('/signin');
  }
};

exports.isUserLoggedOut = (req,res,next)=>{
  if(req.session.isLogged){
    res.redirect('/home');
  }else{
    next();
  }
}

exports.userBlocked = (req,res,next)=>{
  if(req.session.userBlocked){
    res.redirect('/sigin');
  }else{
    next();
  }
}
