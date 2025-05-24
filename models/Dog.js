// The purpose of the models folder is to define data schemas and directly interact with MongoDB.
// Dog.js represents dogs (name, description, owner, status, etc.)

const mongoose = require("mongoose");

const dogSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true // Removes trailing spaces
  },
  description: {
    type: String,
    trim: true
  },
  status: {
    type: String,
    enum: ["available", "adopted"], // Prevents invalid values caused by typos
    default: "available"
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  adoptedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User"
  },
  thankYouMessage: {
    type: String,
    trim: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Dog", dogSchema);
