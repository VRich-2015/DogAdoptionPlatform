// Files within the controller folder contain logic for handling incoming requests and returning appropriate responses.
// Handles dog registration, adoption, and eventually dog listing, filtering, etc.
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
    console.error("Registration error:", error);
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
    console.error("Adoption error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Export both functions after declaring them
module.exports = {
  registerDog,
  adoptDog,
};
