const mongoose = require('mongoose');

const KindlySchema = mongoose.Schema({
  lat: Number,
  long: Number,
  kindly: String,
  createdDate: { type: Date, default: Date.now },
  creator: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  }
},
  {
   collection: 'kindlys'
  }
);



const Kindly = mongoose.model("Kindly", KindlySchema);
module.exports = Kindly;
