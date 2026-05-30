const List = require("../Models/listing.js");
const Review = require("../Models/Review.js");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.prevPath = req.originalUrl;
    req.flash("error", "Please login first");
    return res.redirect("/login");
  }
  next();
};

module.exports.storePath = (req, res, next) => {
  if (req.session.prevPath) {
    res.locals.prevPath = req.session.prevPath;
  }
  next();
};

module.exports.isOwner = async (req, res, next) => {
  let { id } = req.params;
  let listing = await List.findById(id);
  if (!listing.owner.equals(req.user.id)) {
    req.flash("error", "You are not the owner of this listing");
    return res.redirect(`/listings/${id}`);
  }
  next();
};

module.exports.reviewAuthor = async (req, res, next) => {
  let { id, reviewid } = req.params;
  let review = await Review.findById(reviewid);
  if (!review.owner.equals(req.user._id)) {
    req.flash("error", "You are not the owner of this review");
    return res.redirect(`/listings/${id}`);
  }
  next();
};