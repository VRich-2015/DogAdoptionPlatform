   // Mocha provides the core structure for organizing and running tests for API testing while Chai is an assertion library providing various ways to make assertions about your about your API's behavior. 
    
   // The dog.test.js test suite verifies that a dog can be registered, listed by its owner, cannot be adopted by its own owner, and can be deleted by the owner if it has not been adopted.
    const chai = require("chai");
    const chaiHttp = require("chai-http");
    const app = require("../app");
    const expect = chai.expect;

    chai.use(chaiHttp); // Enables HTTP methods in assertions like chai.request(...).get/post/etc.

    let token; // Holds the JWT token for authenticated requests
    let dogId;// Stores the MongoDB ID of the newly registered dog

    // Creates a wrapper for all dog related API tests
    describe(" Dog Routes", () => {

    // Setup: Register + Login a user before running any dog tests
    before((done) => {
        chai
        .request(app)
        .post("/api/users/register")
        .send({ username: "testuser", password: "testpass" })
        .end(() => {
            chai
            .request(app)
            .post("/api/users/login")
            .send({ username: "testuser", password: "testpass" })
            .end((err, res) => {
                token = res.body.token;
                done();
            });
        });
    });

    // Register a new dog... Sends a POST to /api/dogs/register... Includes the token in the Authorization header
    it("should register a new dog", (done) => {
        chai
        .request(app)
        .post("/api/dogs/register")
        .set("Authorization", `Bearer ${token}`)
        .send({
            name: "Biscuit",
            description: "Loves naps and squeaky toys",
        })
        .end((err, res) => {
            expect(res).to.have.status(201); // 201 Created
            expect(res.body.dog).to.have.property("_id");
            expect(res.body.dog.name).to.equal("Biscuit");
            dogId = res.body.dog._id; // Save dogId for other tests
            done();
        });
    });

    // Get all registered dogs...Sends a GET request to /api/dogs/registered... Ensures the returned data is an array
    it("should list registered dogs", (done) => {
        chai
        .request(app)
        .get("/api/dogs/registered")
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.dogs).to.be.an("array");
            done();
        });
    });
   // Prevent user from adopting their own dog... Attempts to adopt the dog the same user registered... Should fail with a 400 status and a helpful message
    it("should not allow a user to adopt their own dog", (done) => {
        chai
        .request(app)
        .post(`/api/dogs/adopt/${dogId}`)
        .set("Authorization", `Bearer ${token}`)
        .send({ thankYouMessage: "You're the best!" })
        .end((err, res) => {
            expect(res).to.have.status(400);
            expect(res.body.message).to.include("cannot adopt your own dog");
            done();
        });
    });

    // Delete the dog... Sends a DELETE request to /api/dogs/:id... Verifies a successful 200 status response with a deletion message
    it("should delete the dog", (done) => {
        chai
        .request(app)
        .delete(`/api/dogs/${dogId}`)
        .set("Authorization", `Bearer ${token}`)
        .end((err, res) => {
            expect(res).to.have.status(200);
            expect(res.body.message).to.include("Dog removed");
            done();
        });
    });
    });
