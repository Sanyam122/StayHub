const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const { reviewSchema } = require("../Schema.js");
const { storePath, isLoggedIn, reviewAuthor } = require("../utils/middlewares.js");
const r_controller = require("../controller/review.js");

const validateMyReview = (req, res, next) => {
  let { error } = reviewSchema.validate({
    comment: req.body.review.comment,
    rating: req.body.rating,
  });
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(".");
    throw new ExpressError(500, errMsg);
  }
  next();
};

router.post(
  "/reviews",
  isLoggedIn,
  storePath,
  validateMyReview,
  wrapAsync(r_controller.createReview)
);

router.delete(
  "/reviews/:reviewid/delete",
  isLoggedIn,
  storePath,
  reviewAuthor,
  wrapAsync(r_controller.destroyReview)
);

module.exports = router;