const express = require("express");
const Campground = require("../models/campground.js");
const { campgroundSchema } = require("../Schemas.js");
const wrapAsync = require("../utilities/wrapAsync.js");
const customError = require("../utilities/expressError.js");
const {isLoggedIn}= require("../middleware.js");
const router = express.Router();


//campground postman validation
const validateCampground = (req, res, next) => {
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

// route to find all campgrounds
router.get("/", wrapAsync(async (req, res) => {
    const campgrounds = await Campground.find({});
    res.render("campgrounds/index.ejs", { campgrounds });
  }),
);

// get route for render new campground form
router.get("/new", isLoggedIn, (req, res) => {
  res.render("campgrounds/new.ejs");
}); // note this must be above the show route to avoid app crash

// post route to submit the data from new Campground form
router.post("/", isLoggedIn,validateCampground, wrapAsync(async (req, res) => {
    // if(!req.body.campground){
    //     throw new customError("Invalid Campground Data!", 400);
    // }

    const newCampground = new Campground(req.body.Campground);
    await newCampground.save();
    req.flash('success','Successfully created new Campground!');
    res.redirect(`/campgrounds/${newCampground._id}`); // this will redirect to the show page with the new campground data
  }),
);

// route to show a particular campground
router.get("/:id", wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id).populate("reviews",); // finding campgrounds through their id
    if(!campground){
      req.flash('error','Cannot find that Campground!');
      return res.redirect('/campgrounds');
    }
    res.render("campgrounds/show.ejs", { campground });
  }),
);

// get route for rendering the edit campground form
router.get("/:id/edit", isLoggedIn,wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id); // finding campgrounds through their id
    if (!campground) {
      req.flash("error", "Cannot find that Campground!");
      return res.redirect("/campgrounds");
    }
    res.render("campgrounds/edit.ejs", { campground });
  }),
);

// put route for updating the campground
router.put("/:id",isLoggedIn,validateCampground, wrapAsync(async (req, res) => {
    const { id } = req.params;
    const campground = await Campground.findByIdAndUpdate(id, {...req.body.campground});
    req.flash("success", "Successfully updated the Campground!");
    res.redirect(`/campgrounds/${campground._id}`);
  }),
);

// delete route for deleting the campground
router.delete("/:id", isLoggedIn,wrapAsync(async (req, res) => {
    const { id } = req.params;
    await Campground.findByIdAndDelete(id);
    req.flash("success", "Successfully deleted the Campground!");
    res.redirect("/campgrounds");
  }),
);

module.exports = router;
