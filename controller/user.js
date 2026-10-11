const User = require("../Models/user.js");

module.exports.renderSignup = (req, res) => {
  return res.render("signup.ejs");
};

module.exports.signupLogic = async (req, res, next) => {
  let { username, email, password } = req.body;
  const newUser = new User({ username, email });
  const registeredUser = await User.register(newUser, password);
  req.login(registeredUser, (err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "New user registered successfully");
    return res.redirect("/listings");
  });
};

module.exports.renderLogin = (req, res) => {
  return res.render("login.ejs");
};

module.exports.login = (req, res) => {
  console.log("LOGIN CONTROLLER REACHED");
  console.log("Authenticated:", req.isAuthenticated());
  console.log("User:", req.user);
  console.log("Session ID:", req.sessionID);

  req.flash("success", "Welcome back to Airbnb");

  let prevPath = res.locals.prevPath || "/listings";

  if (prevPath.includes("delete") || prevPath.includes("review")) {
    let parts = prevPath.split("/");
    let id = parts[2];
    return res.redirect(`/listings/${id}`);
  }

  return res.redirect(prevPath);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "You are successfully logged out");
    return res.redirect("/listings");
  });
};