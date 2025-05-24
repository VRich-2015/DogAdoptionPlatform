// Mocha provides the core structure for organizing and running API tests while Chai is an assertion library 
// providing various ways to make assertions about the behavior of your API.

// Loads testing librairies and your app... 
const chai = require("chai");
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");

const expect = chai.expect;
chai.use(chaiHttp); // Enables chaiHTTP which allows HTTP requests in tests.

 // Defines a test suite for all user-related routes... A token variable is declared for use in protected route tests.
describe("User Routes", () => {
  let token; 

 // Clean up users collection before each test to ensure clean environment
  beforeEach(async () => {
    await User.deleteMany({});
  });

 // Disconnect Mongoose after all tests
  after(async () => {
    await mongoose.disconnect();
  });

  // Group of tests for user registration endpoint
  describe("POST /api/users/register", () => {
    it("should register a new user", async () => { // Send a valid user registration request...expects a 201 status and message
      const res = await chai.request(app).post("/api/users/register").send({
        username: "testuser",
        password: "testpass123",
      });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("message").eql("User registered with hashed password!");
    });

  // Registers a user twice with the same username... Expects a 400 status and "Username already taken." message.
    it("should not register an existing user", async () => { 
      await chai.request(app).post("/api/users/register").send({
        username: "testuser",
        password: "testpass123",
      });

      const res = await chai.request(app).post("/api/users/register").send({
        username: "testuser",
        password: "newpass",
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message").eql("Username already taken.");
    });
  });

  // Group of tests for login endpoint...Ensures a user is registered before login tests.
  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      await chai.request(app).post("/api/users/register").send({
        username: "testuser",
        password: "testpass123",
      });
    }); 

  // Sends valid login credentials... Expects a 200 status and a JWT token.
    it("should login a valid user and return token", async () => { 

      const res = await chai.request(app).post("/api/users/login").send({
        username: "testuser",
        password: "testpass123",
      });

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("message").eql("Login successful!");
      expect(res.body).to.have.property("token");
      token = res.body.token;
    });

  // Tries logging in with invalid credentials... Expects a 400 status and error message.
    it("should not login with invalid credentials", async () => { 
      const res = await chai.request(app).post("/api/users/login").send({
        username: "wronguser",
        password: "wrongpass",
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message").eql("Invalid username or password.");
    });
  });

  // Group of tests for a protected route that requires a token
  describe("GET /api/users/protected", () => {
    beforeEach(async () => { // Registers and logs in a user to retrieve a token for the next tests.
      await chai.request(app).post("/api/users/register").send({
        username: "testuser",
        password: "testpass123",
      });
      const res = await chai.request(app).post("/api/users/login").send({
        username: "testuser",
        password: "testpass123",
      });
      token = res.body.token;
    });

  // Sends a GET request with a valid Bearer token in the header...Expects a 200 status and welcome message.
    it("should allow access to protected route with valid token", async () => {
      const res = await chai
        .request(app)
        .get("/api/users/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("message").that.includes("Welcome");
    });

  // Sends a request without a token... Expects a 401 error and "Access denied. No token provided." message.
    it("should deny access without token", async () => { 
      const res = await chai.request(app).get("/api/users/protected");

      expect(res).to.have.status(401);
      expect(res.body).to.have.property("message").eql("Access denied. No token provided.");
    });
  });
});
