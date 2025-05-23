// Files within the Routes folder are responsible for organizing and registering Express route endpoints, connecting them to the controllers.
// dogRoutes.js is for registering, adopting, etc.

const express = require("express");
const router = express.Router();
const { registerDog, adoptDog, deleteDog, getRegisteredDogs, getAdoptedDogs} = require("../controllers/dogController"); // Destructures and imports registerDog and adoptDog functions from the controller...
const authenticateToken = require("../middlewares/authMiddleware"); // Checks for a valid JWT token... ensures the user is authenticated before allowing access to protected routes
const mongoose = require("mongoose"); // Imports Mongoose so you can use mongoose.Types.ObjectId() for generating a fake but a valid one
const Dog = require("../models/Dog");

// Register a dog-Defines a POST route at /api/dogs/register... Requires valid token via authenticateToken... Calls registerDog to save the dog info to MongoDB
router.post("/register", authenticateToken, registerDog); 

// Adopt a dog-Defines a POST route at /api/dogs/adopt/:id... Requires authentication... Calls adoptDog to handle adoption logic (ex. can't adopt own dog or one already adopted)
router.post("/adopt/:id", authenticateToken, adoptDog);

// Remove a dog-Defines a DELETE route at /api/dogs/:id... Only dog owner can delete... Adopted dogs cannot be deleted
router.delete("/:id", authenticateToken, deleteDog);

// Get dogs registered by the current user
router.get("/registered", authenticateToken, getRegisteredDogs);

// Get dogs adopted by the current user
router.get("/adopted", authenticateToken, getAdoptedDogs);


router.get("/adopt-debug/:id", async (req, res) => { // Sets up a temporary route for GET requests at /api/dogs/adopt-debug/:id... Allows you to simulate adoption from the browser
  const Dog = require("../models/Dog"); // Loads Dog model to interact with the dogs collection in MongoDB

  try {
    const dog = await Dog.findById(req.params.id);
    if (!dog) return res.status(404).send("Dog not found.");

    if (dog.status === "adopted") return res.send("Dog is already adopted."); // Prevents a dog from being adopted more than once

    dog.status = "adopted";

    // Use a fake ObjectId (valid format, not tied to a real user)
    dog.adoptedBy = new mongoose.Types.ObjectId(); // Assigns ObjectId as the adopter
    dog.thankYouMessage = "Thanks for giving this pup a forever home!";
    await dog.save(); // Saves the update to MongoDB

    // Sends HTML response for easy viewing in the browser
    res.send(`<h2>${dog.name} has been adopted!</h2><p>${dog.thankYouMessage}</p>`);

    // Handles errors if something goes wrong like bad IDs or DB issues
  } catch (error) {
    console.error("Error in adopt-debug route:", error);
    res.status(500).send("Server error");
  }
});


module.exports = router;

