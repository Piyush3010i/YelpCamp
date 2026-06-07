const { campgroundSchema } = require("./Schemas.js");
const { reviewSchema } = require("./Schemas.js");
const customError = require("./utilities/expressError.js");
const Campground = require("./models/campground.js");




// middleware to store session to check if user is logged in or not
module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You must be signed in first !");
    return res.redirect("/login");
  }
  next();
};

//middleware to store current url and redirect to current url
module.exports.storeReturnTo = (req, res, next) => {
  if (req.session.returnTo) {
    res.locals.returnTo = req.session.returnTo;
  }
  next();
};

//campground postman validation
module.exports.validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(","); // either we can do it like this
    // const msg = result.error.details[0].message; // or like this
    throw new customError(msg, 400);
  } else {
    next();
  }
  //  console.log(result.error.details[0].message);
};

//authorization middleware
module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await Campground.findById(id);
  if (!campground.author.equals(req.user._id)) {
    req.flash("error", "You do not have to access it!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

//review postman validation
module.exports.validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new customError(msg, 400);
  } else {
    next();
  }
};
