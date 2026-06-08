const express = require("express");
const router = express.Router({mergeParams: true});
const passport = require("passport");
const wrapAsync = require('../utilities/wrapAsync');
const User = require("../models/user");
const userController = require("../controllers/users"); 
const {storeReturnTo} = require("../middleware");


router.route("/register")
  .get(userController.renderRegisterForm) // get route to render register form
  .post(storeReturnTo, wrapAsync(userController.saveRegister)) // post route to save user in our DBs


router.route('/login')
    .get(userController.renderLoginForm) // get route to render login form
    .post(storeReturnTo,passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}),userController.login);// post route for login 

// get route for logout
router.get('/logout', userController.logout);


module.exports = router;