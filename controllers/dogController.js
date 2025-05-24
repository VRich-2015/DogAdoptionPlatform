// Files within the controller folder contain logic for handling incoming requests and returning appropriate responses.
// dogController handles dog registration, adoption, and eventually dog listing, filtering, etc. CRUD and adoption logic implemented
const Dog = require("../models/Dog");

// Define registerDog first
const registerDog = async (req, res) => {
  try {
    const { name, description } = req.body;

    const newDog = new Dog({
      name,
      description,
      owner: req.user.userId,
    });

    await newDog.save();

    res.status(201).json({ message: "Dog registered successfully!", dog: newDog });
  } catch (error) {
    console.error("🐶 Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Define adoptDog second
const adoptDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found." });
    }

    if (dog.status === "adopted") {
      return res.status(400).json({ message: "This dog has already been adopted." });
    }

    if (dog.owner.toString() === req.user.userId) {
      return res.status(400).json({ message: "You cannot adopt your own dog." });
    }

    dog.status = "adopted";
    dog.adoptedBy = req.user.userId;
    dog.thankYouMessage = req.body.thankYouMessage;

    await dog.save();

    res.status(200).json({
      message: "You adopted the dog!",
      dog,
    });
  } catch (error) {
    console.error("🐾 Adoption error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const deleteDog = async (req, res) => {
  try {
    const dog = await Dog.findById(req.params.id);

    if (!dog) {
      return res.status(404).json({ message: "Dog not found." });
    }

    if (dog.owner.toString() !== req.user.userId) {
      return res.status(403).json({ message: "You can only delete your own dogs." });
    }

    if (dog.status === "adopted") {
      return res.status(400).json({ message: "Cannot delete an adopted dog." });
    }

    await Dog.findByIdAndDelete(dog._id);

    res.status(200).json({ message: "Dog removed from the platform." });
  } catch (error) {
    console.error("Delete error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// GET /api/dogs/registered
const getRegisteredDogs = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const query = { owner: req.user.userId };

    if (status) {
      query.status = status; // optional filter: available or adopted
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

// GET /api/dogs/adopted
const getAdoptedDogs = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const dogs = await Dog.find({ adoptedBy: req.user.userId })
      .sort({ createdAt: -1 })
      .skip((page - 1) * Number(limit))
      .limit(Number(limit));

    res.json({ message: "Your adopted dogs", dogs });
  } catch (error) {
    console.error(" Adopted dogs error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export all functions AFTER declaring them
module.exports = {
  registerDog,
  adoptDog,
  deleteDog,
  getRegisteredDogs,
  getAdoptedDogs
};
