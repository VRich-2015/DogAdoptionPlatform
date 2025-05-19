// Files within the Routes folder are responsible for organizing and registering Express route endpoints, 
// connecting them to controllers.
// dogRoutes.js is for registering, adopting, listing, etc.
const express = require("express");
const router = express.Router();
const { registerDog, adoptDog } = require("../controllers/dogController");
const authenticateToken = require("../middlewares/authMiddleware");

// Register a dog
router.post("/register", authenticateToken, registerDog);

// Adopt a dog
router.post("/adopt/:id", authenticateToken, adoptDog);

module.exports = router;
