const mongoose = require("mongoose");
const sampledata = require("./data.js");
const List = require("../Models/listing.js");
mongoose.set("strictQuery", true);
mongoose.connect("mongodb://127.0.0.1:27017/Airbnb");

const initDb = async () => {
  await List.deleteMany({});
  const newdata = sampledata.data.map((obj) => ({
    ...obj,
    owner: "6936c21d50324dd86577c3f6",
  }));
  await List.insertMany(newdata);
  console.log("Data was initialised");
};

initDb();
