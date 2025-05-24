// Files within the Routes folder are responsible for organizing and registering Express route endpoints, connecting them to the controllers.
// dogRoutes.js is for registering, adopting, etc.

const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

const {
  registerDog,
  adoptDog,
  deleteDog,
  getRegisteredDogs,
  getAdoptedDogs
} = require("../controllers/dogController");

const authenticateToken = require("../middlewares/authMiddleware");
const Dog = require("../models/Dog");

//  Register a dog
router.post("/register", authenticateToken, registerDog);

//  Adopt a dog
router.post("/adopt/:id", authenticateToken, adoptDog);

//  Delete a dog (if not adopted and owned by requester)
router.delete("/:id", authenticateToken, deleteDog);

//  Get dogs registered by the logged-in user
router.get("/registered", authenticateToken, getRegisteredDogs);

//  Get dogs adopted by the logged-in user
router.get("/adopted", authenticateToken, getAdoptedDogs);

//  Debug-only route to simulate adoption via browser
router.get("/adopt-debug/:id", async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return res.status(404).send("Dog not found.");
    if (dog.status === "adopted") return res.send("Dog is already adopted.");

    dog.status = "adopted";
    dog.adoptedBy = new mongoose.Types.ObjectId();
    dog.thankYouMessage = "Thanks for giving this pup a forever home!";
    await dog.save();

    res.send(`<h2>${dog.name} has been adopted!</h2><p>${dog.thankYouMessage}</p>`);
  } catch (error) {
    console.error("Error in adopt-debug route:", error);
    res.status(500).send("Server error");
  }
});

//  Confirmation for devs
console.log(" dogRoutes.js loaded");

module.exports = router;


