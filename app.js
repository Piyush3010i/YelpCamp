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
const campgrounds = require("./routes/campgrounds.js");
const reviews= require("./routes/reviews.js");
const session= require("express-session");
const flash= require("connect-flash");

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

app.use(session(sessionConfig));
app.use(flash());

// middleware to flash msg on routes like create new camp, delete camp, update camp etc
app.use((req, res, next)=>{
  res.locals.success= req.flash('success');
  res.locals.error= req.flash('error');
  next();
})


// routes setup
app.use('/campgrounds', campgrounds); // campgrounds router
app.use('/campgrounds/:id/reviews', reviews); // reviews router

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
