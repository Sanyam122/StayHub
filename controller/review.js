const Review = require("../Models/Review");
const List = require("../Models/listing");

module.exports.createReview = async (req, res) => {
  let { id } = req.params;
  let listing = await List.findById(id);
  let newreview = new Review({
    comment: req.body.review.comment,
    rating: req.body.rating,
    owner: req.user.id,
  });
  listing.reviews.push(newreview);
  await newreview.save();
  await listing.save();
  req.flash("success", "Shared review successfully");
  return res.redirect(`/listings/${id}`);
};

module.exports.destroyReview = async (req, res) => {
  let { id, reviewid } = req.params;
  await List.findByIdAndUpdate(id, { $pull: { reviews: reviewid } });
  await Review.findByIdAndDelete(reviewid);
  req.flash("success", "Review deleted successfully");
  return res.redirect(`/listings/${id}`);
};