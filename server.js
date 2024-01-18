const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors")
const session = require('express-session');
const dotenv = require("dotenv");
const connectDB = require('./servers/database/connection');
const userRouter = require('./servers/routes/userRouter');


 //  mongodb connection
 connectDB();
 
// enviorment variable
dotenv.config();
const PORT = 8000
// session
app.use(
  session({
    secret : "secret-key",
    resave : true,
    saveUninitialized : true,
  })
);


// parse request to express
app.use(express.json());
app.use(express.urlencoded({extended : true}));
app.use(cors())

// set view engine
app.set('view engine',"ejs");

//load Routers
app.use("/",userRouter);

app.use('/stylesheet',express.static(path.resolve(__dirname,"assets/stylesheet")));
app.use('/javascript',express.static(path.resolve(__dirname,"assets/javascript")));
app.use('/images',express.static(path.resolve(__dirname,"assets/images")));

app.listen(PORT,()=>{
  console.log(`PORT ${PORT} is Running`);
});









