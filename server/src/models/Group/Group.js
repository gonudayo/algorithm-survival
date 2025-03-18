const mongoose = require('mongoose');

const groupSchema = mongoose.Schema({
  groupName: {
    type: String,
    unique: true,
    require: true,
  },
  admin: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
  ],
  description: {
    type: String,
    default: null,
  },
  dailyProblemCount: {
    type: Number,
    default: 1,
  },
  dailyProblemDifficulty: {
    type: Number,
    default: 1,
  },
  score: {
    type: Number,
    default: 0
  },
  created: {
    type: Date,
  },
});

const Group = mongoose.model("Group", groupSchema);

module.exports = { Group };