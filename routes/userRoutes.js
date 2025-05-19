// Files within the Routes folder are responsible for organizing and registering Express route endpoints, 
// connecting them to controllers.
// userRoutes.js is for registering, logging in, and protecting routes
const express = require("express");
const router = express.Router();
console.log("🧪 VANESHA IS HERE! (userRoutes.js)");

const { registerUser, loginUser } = require("../controllers/authController");
const authenticateToken = require("../middlewares/authMiddleware");

// ✅ Register
router.post("/register", registerUser);

// ✅ Login
router.post("/login", loginUser);

router.post("/debug", (req, res) => {
  console.log("🧪 POST /api/users/debug hit");
  res.json({ message: "Debug route is working!" });
});

// ✅ Protected route for token check
router.get("/protected", authenticateToken, (req, res) => {
  res.json({ message: `Welcome, ${req.user.username}!`, user: req.user });
});

// ✅ Debug test route
router.get("/test", (req, res) => {
  res.json({ message: "User routes are working!" });
});

module.exports = router;
