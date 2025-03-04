const mongoose = require("mongoose");

const userSchema = mongoose.Schema({
  name: {
    type: String,
  },
  handle: {
    type: String,
  },
  survival: {
    type: Boolean,
  },
  number: {
    type: Number,
  },
  local: {
    type: Number,
  },
  startCnt: {
    type: Number,
  },
  curCnt: {
    type: Number,
  },
  tier: {
    type: Number,
  },
  imgSrc: {
    type: String,
  },
});

const User = mongoose.model("User", userSchema);

module.exports = { User };
