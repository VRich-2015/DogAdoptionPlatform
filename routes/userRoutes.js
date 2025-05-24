// Files within the Routes folder are responsible for organizing and registering Express route endpoints, 
// connecting them to controllers.
// userRoutes.js is for registering, logging in, and protecting routes
const express = require("express");
const router = express.Router();
console.log("VANESHA IS HERE! (userRoutes.js)"); // Confirms in the terminal that userRoutes.js is successfully loaded when the app starts

const { registerUser, loginUser } = require("../controllers/authController"); // Brings in registerUser and loginUser logic the controllers
const authenticateToken = require("../middlewares/authMiddleware"); // Checks for valid authorization

// Register
router.post("/register", registerUser); // Calls registerUser to add new users

// Login
router.post("/login", loginUser); // Returns JWT if credentials match

// Tests that POST requests are reaching route file correctly
router.post("/debug", (req, res) => {
  console.log(" POST /api/users/debug hit");
  res.json({ message: "Debug route is working!" });
});

// Protected route for token check... Only accessible with a valid token and returns info about the current user
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!`, user: req.user });
});

// Debug test route: Confirms that the route file is connected and accessible
router.get("/test", (req, res) => {
  res.json({ message: "User routes are working!" });
});

// Dev console message to confirm this file is loaded
console.log("userRoutes.js loaded");

module.exports = router;


