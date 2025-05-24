// Files within the controller folder contain logic for handling incoming requests and returning appropriate responses.
// Handles user registration and login including input validation, password hashing, JWT token generation and error handling.
// Interacts eith the User model. 
const User = require("../models/User");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

//  Register a new user... triggered when a POST request hits /api/users/register.
const registerUser = async (req, res) => {
  console.log(" Incoming registration request");

try {
  const { username, password } = req.body;

// Validate input... If either field is missing, sends back a 400 Bad Request response.
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

// Checks if username is already taken... If so, returns a 400 error saying the username is already taken.
  const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res.status(400).json({ message: "Username already taken." });
    }

// Uses bcrypt to hash the password before storing it... 10 is the salt rounds (security complexity).
   const hashedPassword = await bcrypt.hash(password, 10);

// Creates a new user instance using the hashed password. Saves the user to MongoDB.
  const newUser = new User({ username, password: hashedPassword });
  await newUser.save();

// Responds with a success message if registration is complete
  res.status(201).json({ message: "User registered with hashed password!" });
  } catch (error) { // Logs unexpected errors and sends a 500 Internal Server Error
    console.error("Registration error:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Controller for logging in users via /api/users/login.
 const loginUser = async (req, res) => {
  try {
    const { username, password } = req.body;

    // Validate input... ensures the username and password fields are present
    if (!username || !password) {
      return res.status(400).json({ message: "Username and password are required." });
    }

// Find the user by username in the database... If not found, returns a generic error (avoids revealing if username or password was wrong).
  const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Invalid username or password." });
    }
  
// Compares provided password with the hashed one in the database... Sends back error if passwords don't match.
  const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid username or password." });
    }

// Creates a signed JWT containing the user’s ID and username... JWT_SECRET is stored in your .env file... Token expires in 24 hours.
  try {
    const token = jwt.sign(
        { userId: user._id, username: user.username },
        process.env.JWT_SECRET,
        { expiresIn: "24h" }
      );

// Returns the token on success so it can be used for authenticated routes.  
      res.status(200).json({ message: "Login successful!", token });
    } catch (tokenError) { // Handles failure of token creation separately.
      console.error("Token generation failed:", tokenError);
      res.status(500).json({ message: "Token generation failed." });
    }

// Handles all other unexpected errors
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({ message: "Server error" });
  }
};
// Makes controller functions available to be imported and used in the routes
module.exports = {
  registerUser,
  loginUser,
};
