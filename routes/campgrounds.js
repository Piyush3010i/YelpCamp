const express = require("express");
const Campground = require("../models/campground.js");
const wrapAsync = require("../utilities/wrapAsync.js");
const {isLoggedIn, isAuthor, validateCampground} = require("../middleware.js");
const {storeReturnTo} = require("../middleware.js");
const campgroundController = require("../controllers/campgrounds.js");
const router = express.Router();



router.route("/")
    .get(wrapAsync(campgroundController.index)) // route to find all campgrounds
    .post(isLoggedIn,validateCampground, wrapAsync(campgroundController.showNewCampground)) // post route to submit the data from new Campground form


// get route for render new campground form
// note this must be above the show route to avoid app crash
router.get("/new", isLoggedIn, campgroundController.renderNewCampground);


router.route("/:id")
    .get(wrapAsync(campgroundController.showCampground)) // route to show a particular campground
    .put(isLoggedIn,isAuthor,validateCampground, wrapAsync(campgroundController.putEditCampground)) // put route for updating the campground
    .delete(isLoggedIn,isAuthor,wrapAsync(campgroundController.deleteCampground)) // delete route for deleting the campground


// get route for rendering the edit campground form
router.get("/:id/edit", isLoggedIn,isAuthor,wrapAsync(campgroundController.renderEditCampground));


module.exports = router;
