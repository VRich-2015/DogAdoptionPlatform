// Establishes connection to MongoDB using mongoose.
const mongoose = require("mongoose");

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log(" Connected to MongoDB"))
  .catch((err) => {
    console.error(" MongoDB connection error:", err);
    process.exit(1);
  });
