// Main entry point of the app. It initializes Express, connects middleware and routes, and starts the server.
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

// ✅ Debug test route to verify POST works
app.post("/test-direct-post", (req, res) => {
  res.json({ success: true, data: req.body });
});

// Start server
const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
