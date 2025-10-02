const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const dotenv = require("dotenv");
const multer = require("multer");
const session = require("express-session");
const flash = require("connect-flash");


require("dotenv").config();
//import model
const SalesModel = require("./models/salesModel");

//import routes
const salesRoutes = require("./routes/salesRoutes");

const app = express();
const port = 3001;


// Middleware
app.use(express.static(path.join(__dirname,"public")));  //static files
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));



// setting view engine to pug
app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));

// Session and flash middleware
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(flash());

// Make flash messages available in all templates
app.use((req, res, next) => {
  res.locals.message = req.flash("message");
  next();
});
// Connect to MongoDB

mongoose.connect(process.env.MONGODB_URL, {});

     mongoose.connection
       .on("open", () => {
         console.log("MongoDB opened");
       })
       .on("error", (err) => {
         console.log(`Connection error: ${err.message}`);
       });
       

      // imported routes
       app.use("/", salesRoutes);

       //non existent route handler  the 2nd last one
       app.use((req, res) => {
         res.status(404).send("Oops!Route not found.");
       });



// Start server
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});

