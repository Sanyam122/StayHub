const mongoose = require("mongoose");
const Review = require("./Review");
const { boolean } = require("joi");
const Schema = mongoose.Schema;

const listSchema = new Schema({
  title: {
    type: String,
  },
  description: String,

  image: {
    url: String,
    filename: String,
  },

  price: {
    type: Number,
  },
  location: {
    type: String,
  },
  country: {
    type: String,
  },

  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: "Review",
    },
  ],

  owner: {
    type: Schema.Types.ObjectId,
    ref: "User",
  },

  geometry: {
    type: {
      type: String,
      enum: ["Point"],
      require: true,
    },
    coordinates: {
      type: [Number],
      require: true,
    },
  },

  liked: {
    type: Boolean,
    default: false,
  },
});

const List = mongoose.model("List", listSchema);
module.exports = List;
