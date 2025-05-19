// The purpose of the models folder is to define data schemas and directly interact with MongoDB.
// Dog.js represents dogs (name, description, owner, status, etc.)
const mongoose = require("mongoose");

const dogSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String },
  status: { type: String, enum: ["available", "adopted"], default: "available" },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  adoptedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  thankYouMessage: { type: String }
}, { timestamps: true });

module.exports = mongoose.model("Dog", dogSchema);
