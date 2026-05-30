const Joi = require("joi");

module.exports.listingSchema = Joi.object({
  listing: Joi.object({
    title: Joi.string()
      .required()
      .messages({ "any.required": "Title is required" }),
    description: Joi.string()
      .required()
      .messages({ "any.required": "Description is required" }),
    image: Joi.string()
      .allow("", null)
      .messages({ "any.required": "Image URL is required" }),
    price: Joi.number()
      .required()
      .min(0)
      .messages({ "any.required": "Price is required" }),
    location: Joi.string()
      .required()
      .messages({ "any.required": "Location is required" }),
    country: Joi.string()
      .required()
      .messages({ "any.required": "Country is required" }),
  })
    .required()
    .messages({ "any.required": "Listing is required" }),
});

module.exports.reviewSchema = Joi.object({
  comment: Joi.string().required(),
  rating: Joi.number().min(1).max(5).required(),
});
