const express = require("express");
const router = express.Router();
const passport = require("passport");
const wrapAsync = require("../utils/wrapasync.js");
const { storePath } = require("../utils/middlewares.js");
const userController = require("../controller/user.js");

router
  .route("/signup")
  .get(userController.renderSignup)
  .post(wrapAsync(userController.signupLogic));

router
  .route("/login")
  .get(userController.renderLogin)
  .post(
    storePath,
    passport.authenticate("local", {
      failureRedirect: "/login",
      failureFlash: true,
    }),
    userController.login
  );

router.get("/logout", userController.logout);

module.exports = router;