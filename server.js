const express = require("express");
const app = express();
const dotenv = require("dotenv");
const mongoose = require('mongoose');





 // connect mongodb

 
// enviorment variable
dotenv.config();
const PORT = process.env.PORT | 7000 ;

// set view engine
app.set('view engine',"ejs")



// PORT 
app.listen(PORT,()=>{
  console.log(`PORT ${PORT} is Running`);
});

