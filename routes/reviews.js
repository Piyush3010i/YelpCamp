const express= require('express');
const { reviewSchema } = require("../Schemas.js");
const wrapAsync = require("../utilities/wrapAsync.js");
const Campground = require("../models/campground");
const Review = require("../models/review");
const reviewController = require("../controllers/reviews.js");
const {validateReview, isLoggedIn, isReviewAuthor} = require("../middleware.js");

const router= express.Router({mergeParams: true});


// post route for posting reviews
router.post("/", isLoggedIn,validateReview, wrapAsync(reviewController.postReview));

// delete route for deleting specific reviews
router.delete("/:reviewsId", isLoggedIn,isReviewAuthor, wrapAsync(reviewController.deleteReview));

module.exports= router;