const Campground = require("../models/campground");
const Review = require("../models/review");

// controller for posting reviews
module.exports.postReview = async (req, res) => {
    const campground = await Campground.findById(req.params.id);
    
    // conditions for 0 rating
    if (Number(req.body.review.rating) === 0) {
      req.flash("error", "Please select a rating of at least 1 star!");
      return res.redirect(`/campgrounds/${campground._id}`);
    }
    const review = new Review(req.body.review);
    review.author = req.user._id;
    campground.reviews.push(review);
    await review.save();
    req.flash('success',"You've made a new Review!");
    await campground.save();
    res.redirect(`/campgrounds/${campground._id}`);
  };

// controller for deleting reviews
module.exports.deleteReview = async (req, res) => {
  const { id, reviewsId } = req.params;
  console.log("id:", id);
  console.log("reviews._id:", reviewsId);
  await Campground.findByIdAndUpdate(id, { $pull: { reviews: reviewsId } });
  await Review.findByIdAndDelete(reviewsId);
  req.flash("success", "You've deleted a review!");
  res.redirect(`/campgrounds/${id}`);
};
