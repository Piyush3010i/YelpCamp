const express= require('express');
const { reviewSchema } = require("../Schemas.js");
const wrapAsync = require("../utilities/wrapAsync.js");
const Campground = require("../models/campground");
const Review = require("../models/review");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");


const router= express.Router({mergeParams: true});




// post route for posting reviews
router.post("/", isLoggedIn,validateReview, wrapAsync(async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    req.flash('success',"You've made a new Review!");
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  }),
);

// delete route for deleting specific reviews
router.delete("/:reviewsId", isLoggedIn,isReviewAuthor, wrapAsync(async (req, res) => {
    const { id, reviewsId } = req.params;
    console.log("id:", id);
    console.log("reviews._id:", reviewsId);
    await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } });
    await Review.findByIdAndDelete(reviewsId);
    req.flash("success", "You've deleted a review!");  
    res.redirect(`/campgrounds/${id}`);
  }),
);

module.exports= router;