const express = require("express");
const router = express.Router({ mergeParams: true });
const wrapAsync = require("../utils/wrapasync.js");
const ExpressError = require("../utils/ExpressError.js");
const { listingSchema } = require("../Schema.js");
const { isLoggedIn, isOwner, storePath } = require("../utils/middlewares.js");
const multer = require("multer");
const { storage } = require("../cloudConfig.js");
const upload = multer({ storage });
const controller = require("../controller/listing.js");

const validateMyListing = (req, res, next) => {
  let { error } = listingSchema.validate(req.body);
  if (error) {
    let errMsg = error.details.map((el) => el.message).join(".");
    console.log(error.details);
    throw new ExpressError(500, errMsg);
  }
  next();
};

router.get("/", wrapAsync(controller.index));

router
  .route("/createlisting")
  .get(isLoggedIn, storePath, wrapAsync(controller.get_create))
  .post(
    upload.single("listing[image]"),
    isLoggedIn,
    storePath,
    validateMyListing,
    wrapAsync(controller.post_create)
  );

router.get("/privacy", wrapAsync(controller.termsAndConditions));

router
  .route("/:id")
  .get(storePath, wrapAsync(controller.read))
  .put(
    isLoggedIn,
    storePath,
    isOwner,
    upload.single("listing[image]"),
    validateMyListing,
    wrapAsync(controller.put_update)
  );

router.get("/:id/edit", isLoggedIn, storePath, isOwner, wrapAsync(controller.get_update));
router.delete("/:id/delete", isLoggedIn, isOwner, wrapAsync(controller.delete));

module.exports = router;