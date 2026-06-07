const express = require("express");
const router = express.Router({mergeParams: true});
const passport = require("passport");
const wrapAsync = require('../utilities/wrapAsync');
const User = require("../models/user");
const {storeReturnTo} = require("../middleware");

router.get('/register',( req, res)=>{
    res.render('users/register.ejs');
})

router.post('/register',storeReturnTo,wrapAsync(async( req, res )=>{
    try{
        const{username,email,password}= req.body;
        const user = new User({username,email});
        const registeredUser = await User.register(user,password);
        req.login(registeredUser,function(err){
            if(err) return next(err);
            req.flash("success", "Welcome to Yelpcamp!");
            const redirectUrl = res.locals.returnTo || "/campgrounds";
            delete req.session.returnTo;
            res.redirect(redirectUrl);
        })
    }catch(e){
        req.flash('error', e.message);
        res.redirect('register');
    }
}))

router.get('/login',(req, res)=>{
    res.render('users/login.ejs');
})

router.post('/login',storeReturnTo,
    passport.authenticate('local', {failureFlash: true, failureRedirect:'/login'}),
    (req, res)=>{
        req.flash('success', `Welcome Back ${req.user.username} !`);
        const redirectUrl = res.locals.returnTo || '/campgrounds';
        delete req.session.returnTo;
        res.redirect(redirectUrl);
})

router.get('/logout', (req, res, next)=>{
    req.logout(function(err){
        if(err){
            return next(err);
        }
        req.flash('success', 'Goodbye!');
        res.redirect('/campgrounds');
    });
    });


module.exports = router;