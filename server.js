const express = require("express");
const app = express();
const path = require("path");
const cors = require("cors");
const session = require("express-session");
const dotenv = require("dotenv");
const connectDB = require("./servers/database/connection");
const userRouter = require("./servers/routes/userRouter");
const adminRouter = require("./servers/routes/adminRouter");
const morgan = require("morgan");
const flash = require("express-flash");

// Mongodb connection
connectDB();

// Environment variable
dotenv.config();

// Session
app.use(
  session({
    secret: "your-strong-random-secret",
    resave: false,
    saveUninitialized: true,
  })
);

// for flash message
app.use(flash());

// Logger (Morgan)
app.use(morgan(process.env.NODE_ENV === "production" ? "combined" : "dev"));

// Parse requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cors());

// Clear cache
app.use((req, res, next) => {
  res.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");
  res.setHeader("Pragma", "no-cache");
  res.setHeader("Expires", "0");
  next();
});

// Set view engine
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// Static assets
app.use(
  "/stylesheet",
  express.static(path.resolve(__dirname, "assets/stylesheet"))
);
app.use(
  "/javascript",
  express.static(path.resolve(__dirname, "assets/javascript"))
);
app.use("/images", express.static(path.resolve(__dirname, "assets/images")));

// Load Routers
app.use("/", userRouter);
app.use("/", adminRouter);

// Server
const PORT = 8000 || 7000;
app.listen(PORT, () => {
  console.log(`Server is running on PORT ${PORT}`);
});
