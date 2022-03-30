import mongoose from "mongoose";

const dishSchema = mongoose.Schema({
  name: String,
  ingredients: [String],
  duration : String,
  cooktime: String,
});

var Dish = mongoose.model("Dish", dishSchema);

export default Dish;
