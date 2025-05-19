// The purpose of the models folder is to define data schemas and directly interact with MongoDB.
// User.js represents users (username, password)
const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  password: { type: String, required: true },
});

module.exports = mongoose.model("User", userSchema);
