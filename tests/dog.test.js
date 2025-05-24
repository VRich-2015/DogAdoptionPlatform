const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const expect = chai.expect;

chai.use(chaiHttp);

let token;
let dogId;

describe(" Dog Routes", () => {
  // Register and log in before running tests
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
        expect(res).to.have.status(201);
        expect(res.body.dog).to.have.property("_id");
        expect(res.body.dog.name).to.equal("Biscuit");
        dogId = res.body.dog._id;
        done();
      });
  });

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
