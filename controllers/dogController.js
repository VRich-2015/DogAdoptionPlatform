// Files within the controller folder contains logic for handling incoming requests and returning appropriate responses.
// dogController handles dog registration, adoption, deletion, and viewing registered and sdopted dogs. 
const Dog = require("../models/Dog");

// Adds a new dog to the platform...Triggered by POST /api/dogs/register... Requires authentication
const registerDog = async (req, res) => {
  try {
// Extracts dog details from the request body... Sets owner to the currently logged-in user (req.user.userId added by authMiddleware).
    const { name, description } = req.body;
    const newDog = new Dog({
      name,
      description,
      owner: req.user.userId,
    });
// Saves to MongoDB and returns success message plus the new dog.
    await newDog.save();
    res.status(201).json({ message: "Dog registered successfully!", dog: newDog });
  } 
  catch (error) {
    console.error(" Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Allows user to adopt a dog... Triggered by POST /api/dogs/adopt/:id... Requires authentication
const adoptDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id); // Fetchcs dog by id from URL

    if (!dog) { // If dog doesn't exist
      return res.status(404).json({ message: "Dog not found." });
    }

    if (dog.status === "adopted") { // Cannot adopt an already adopted dog
      return res.status(400).json({ message: "This dog has already been adopted." });
    }

    if (dog.owner.toString() === req.user.userId) { // Cannot adopt your own dog
      return res.status(400).json({ message: "You cannot adopt your own dog." });
    }

  // Adoption logic: Updates adoption status, assigns adopter, stores thank-you message
    dog.status = "adopted";
    dog.adoptedBy = req.user.userId;
    dog.thankYouMessage = req.body.thankYouMessage;

    await dog.save();

    res.status(200).json({
      message: "You adopted the dog!",
      dog,
    });
  } catch (error) {
    console.error(" Adoption error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Allows owners to delete their unadopted dogs... Triggered by DELETE /api/dogs/:id... Authentication required
const deleteDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found." });
    }

    if (dog.owner.toString() !== req.user.userId) { // Only owners can delete a dog
      return res.status(403).json({ message: "You can only delete your own dogs." });
    }

    if (dog.status === "adopted") { // Adopted dogs can't be deleted
      return res.status(400).json({ message: "Cannot delete an adopted dog." });
    }

    await Dog.findByIdAndDelete(dog._id);

    res.status(200).json({ message: "Dog removed from the platform." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Returns dogs registered by the logged-in user... Triggered by GET /api/dogs/registered... Authentication required
const getRegisteredDogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { owner: req.user.userId };

    if (status) {
      query.status = status; // Optional filter: available or adopted
    }

    const dogs = await Dog.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ message: "Your registered dogs", dogs });
  } catch (error) {
    console.error("Registered dogs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Lists dogs the current user has adopted... Triggered by GET /api/dogs/adopted... Authentication required... Pagination supported
const getAdoptedDogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const dogs = await Dog.find({ adoptedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit)); // Returns paginated list of adopted dogs, starting with most recent.

    res.json({ message: "Your adopted dogs", dogs });
  } catch (error) {
    console.error(" Adopted dogs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export all functions after declaring them...Makes all functions available to the dogRoutes.js file.
module.exports = {
  registerDog,
  adoptDog,
  deleteDog,
  getRegisteredDogs,
  getAdoptedDogs
};
