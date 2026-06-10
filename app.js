if(process.env.NODE_ENV!=="production"){
  require('dotenv').config({quiet:true});
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const { campgroundSchema, reviewSchema } = require("./Schemas.js");
const morgan = require("morgan");
const customError = require("./utilities/expressError.js");
const wrapAsync = require("./utilities/wrapAsync.js");
const Campground = require("./models/campground");
const Review = require("./models/review");
const User = require("./models/user.js");
const campgroundRoutes = require("./routes/campgrounds.js");
const reviewRoutes = require("./routes/reviews.js");
const userRoutes = require("./routes/user.js");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// mongoose connect and error handling
mongoose.connect("mongodb://127.0.0.1:27017/Yelp-Camp");
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
  console.log("Database connected");
});

// ejs engine and views set up
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

// middleware setup
app.use(express.urlencoded({ extended: true })); // middleware to parse the url as our data for req.body
app.use(methodOverride("_method")); // middleware for method override for put,patch, delete method
app.use(express.static(path.join(__dirname, "public")));
app.use(morgan("dev"));

// session setup
const sessionConfig = {
  secret: "Secret Code!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    age: 1000 * 60 * 60 * 24 * 7
  },
};

// below method is used to create session and flash in every app routes
app.use(session(sessionConfig));
app.use(flash());

// below methods are used to authenticate, manage session and flash using passport 
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));

passport.serializeUser(User.serializeUser()); // serialization is a static method that is already present inside the passport, and it is used to store user data into a session
passport.deserializeUser(User.deserializeUser()); // deserialization tells us how a user session is destroyed after session ends.

// middleware to flash msg on routes like create new camp, delete camp, update camp etc
app.use((req, res, next)=>{
  res.locals.currentUser= req.user; // this will provide the data of the current user, which is logged in, in global or every routes.
  res.locals.success= req.flash('success');
  res.locals.error= req.flash('error');
  next();
})


// routes setup
app.use('/campgrounds', campgroundRoutes); // campgrounds router
app.use('/campgrounds/:id/reviews', reviewRoutes); // reviews router
app.use('/', userRoutes); // user routes for authentication

// home yelpcamp route
app.get("/", (req, res) => {
  res.render("home.ejs");
});


app.all("*", (req, res, next) => {
  next(new customError("Page not found!", 404));
});
app.use((err, req, res, next) => {
  // const {status= 500, message= "Something went wrong!"}= err;
  const { status = 500 } = err;
  if (!err.message) {
    err.message = "Oh no! Something went wrong!";
  }
  res.status(status).render("error.ejs", { err });
});

// port information
app.listen(4000, () => {
  console.log("Serving on port: 4000");
});
