// const mongoose, {Schema} = require("mongoose");

const mongoose = require('mongoose');

const KindlySchema = mongoose.Schema({
  lat: Number,
  long: Number,
  kindly: String,
  createdDate: { type: Date, default: Date.now }
},
  {
   collection: 'kindlys'
  }
);


const Kindly = mongoose.model("Kindly", KindlySchema);
module.exports = Kindly;
