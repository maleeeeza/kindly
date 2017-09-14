const mongoose, {Schema} = require("mongoose");

const KindlySchema = new Schema({
  lat: Number,
  long: Number,
  description: String,
  createdDate: Date
});


const Kindly = mongoose.model("Kindly", KindlySchema);
module.exports = Kindly;
