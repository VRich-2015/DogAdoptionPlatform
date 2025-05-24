const express = require("express");
const cors = require("cors");
const app = express();
require("dotenv").config();

// Connect to MongoDB
require("./db");

// Middleware
app.use(cors());
app.use(express.json());

// Route imports
const userRoutes = require("./routes/userRoutes");
app.use("/api/users", userRoutes);
console.log("User routes loaded...");

const dogRoutes = require("./routes/dogRoutes");
app.use("/api/dogs", dogRoutes);
console.log("dogRoutes loaded...");

// Base route
app.get("/", (req, res) => {
  res.send("API is running");
});

//  Debug POST route
app.post("/test-direct-post", (req, res) => {
  res.json({ success: true, data: req.body });
});

//  Catch-all for unmatched routes
app.use((req, res) => {
  res.status(404).json({ message: "Route not found" });
});

//  Global error handler
app.use((err, req, res, next) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ message: "Internal server error" });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

module.exports = app;
