// test/user.test.js
const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");

const expect = chai.expect;
chai.use(chaiHttp);

describe("User Routes", () => {
  let token;

  // Clean up users before each test
  beforeEach(async () => {
    await User.deleteMany({});
  });

  // Disconnect Mongoose after all tests
  after(async () => {
    await mongoose.disconnect();
  });

  describe("POST /api/users/register", () => {
    it("should register a new user", async () => {
      const res = await chai.request(app).post("/api/users/register").send({
        username: "testuser",
        password: "testpass123",
      });

      expect(res).to.have.status(201);
      expect(res.body).to.have.property("message").eql("User registered with hashed password!");
    });

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

  describe("POST /api/users/login", () => {
    beforeEach(async () => {
      await chai.request(app).post("/api/users/register").send({
        username: "testuser",
        password: "testpass123",
      });
    });

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

    it("should not login with invalid credentials", async () => {
      const res = await chai.request(app).post("/api/users/login").send({
        username: "wronguser",
        password: "wrongpass",
      });

      expect(res).to.have.status(400);
      expect(res.body).to.have.property("message").eql("Invalid username or password.");
    });
  });

  describe("GET /api/users/protected", () => {
    beforeEach(async () => {
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

    it("should allow access to protected route with valid token", async () => {
      const res = await chai
        .request(app)
        .get("/api/users/protected")
        .set("Authorization", `Bearer ${token}`);

      expect(res).to.have.status(200);
      expect(res.body).to.have.property("message").that.includes("Welcome");
    });

    it("should deny access without token", async () => {
      const res = await chai.request(app).get("/api/users/protected");

      expect(res).to.have.status(401);
      expect(res.body).to.have.property("message").eql("Access denied. No token provided.");
    });
  });
});
