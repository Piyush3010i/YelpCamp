const User = require("../models/user");

// controller for rendering registeration/signin form
module.exports.renderRegisterForm = (req, res) => {
  res.render("users/register.ejs");
};

//controller for saving new user
module.exports.saveRegister = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const registeredUser = await User.register(user, password);
    req.login(registeredUser, function (err) {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelpcamp!");
      const redirectUrl = res.locals.returnTo || "/campgrounds";
      delete req.session.returnTo;
      res.redirect(redirectUrl);
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("register");
  }
};

// controller for rendering login page
module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

// controller for login
module.exports.login = (req, res) => {
  req.flash("success", `Welcome Back ${req.user.username} !`);
  const redirectUrl = res.locals.returnTo || "/campgrounds";
  delete req.session.returnTo;
  res.redirect(redirectUrl);
};

// controller for logout
module.exports.logout = (req, res, next)=>{
  req.logout(function (err) {
    if (err) {
      return next(err);
    }
    req.flash("success", "Goodbye!");
    res.redirect("/campgrounds");
  });
};