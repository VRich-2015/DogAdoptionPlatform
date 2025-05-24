// This middleware file provides JWT-based authentication logic ensuring that only users with valid tokens can access protected routes in your application.
const jwt = require("jsonwebtoken"); // jsonwebtoken is used to verify and decode the tokens users send with their requests

const authenticateToken = (req, res, next) => { // middleware function that receives the request, response, and next() function to continue to the next middleware or route handler.
const authHeader = req.headers.authorization; // Looks for the Authorization header in the incoming request.

// If no header is present or it doesn't start with "Bearer ", the request is denied.
  if (!authHeader || !authHeader.startsWith("Bearer ")) { 

// 401 status: "Unauthorized"...client didn’t provide proper authentication
    return res.status(401).json({ message: "Access denied. No token provided." });
  }
// Extracts token string by splitting the header and getting the second part (after "Bearer").
  const token = authHeader.split(" ")[1]; 

 // Tries to verify the token using secret key (JWT_SECRET from .env). If valid, attaches the decoded user info to req.user so it’s available to other parts of the app...then calls next() to move on to the actual route logic. 
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Makes user data available to next handlers
    next(); 
  } catch (error) {
    return res.status(403).json({ message: "Invalid or expired token." });
  } // If the token is invalid or expired, it sends a 403 Forbidden error.
};

module.exports = authenticateToken; // Exports for use in other files
