const List = require("../Models/listing");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapToken = process.env.MAP_TOKEN;
const geocodingClient = mbxGeocoding({ accessToken: mapToken });

module.exports.index = async (req, res) => {
  const listings = await List.find({});
  res.render("index.ejs", { listings });
};

module.exports.get_create = async (req, res) => {
  res.render("create.ejs");
};

module.exports.termsAndConditions = async (req, res) => {
  const isTerms = req.path === "/terms";
  res.render("privacy.ejs", { isTerms });
};

module.exports.post_create = async (req, res) => {
  let response = await geocodingClient
    .forwardGeocode({
      query: req.body.listing.location,
      limit: 1,
    })
    .send();

  let url = req.file.path;
  let filename = req.file.filename;
  let newlisting = new List(req.body.listing);
  newlisting.owner = req.user._id;
  newlisting.image = { url, filename };
  newlisting.geometry = response.body.features[0].geometry;
  await newlisting.save();
  req.flash("success", "You have successfully created a listing");
  return res.redirect("/listings");
};

module.exports.read = async (req, res) => {
  let { id } = req.params;
  let listing = await List.findById(id)
    .populate({ path: "reviews", populate: { path: "owner" } })
    .populate("owner");
  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }
  return res.render("read.ejs", { listing });
};

module.exports.get_update = async (req, res) => {
  let { id } = req.params;
  let listing = await List.findById(id);
  if (!listing) {
    req.flash("error", "Listing does not exist");
    return res.redirect("/listings");
  }
  let originalImage = listing.image.url;
  let originalImageUrl = originalImage.replace("/upload", "/upload/w_250,h_300");
  return res.render("update.ejs", { listing, originalImageUrl });
};

module.exports.put_update = async (req, res) => {
  let { id } = req.params;
  let newlisting = await List.findByIdAndUpdate(id, { ...req.body.listing });
  if (typeof req.file !== "undefined") {
    let url = req.file.path;
    let filename = req.file.filename;
    newlisting.image = { url, filename };
    await newlisting.save();
  }
  req.flash("success", "Changes saved successfully");
  return res.redirect("/listings");
};

module.exports.delete = async (req, res) => {
  let { id } = req.params;
  await List.findByIdAndDelete(id);
  req.flash("success", "Listing is successfully deleted");
  return res.redirect("/listings");
};