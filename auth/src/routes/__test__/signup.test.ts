import request from "supertest";
import { app } from "../../app";

describe("It should test the sign up route", () => {
  process.env.JWT_KEY = "WHATT";

  it("returns a 201 on successful signup", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(201);
  });

  it("sets a cookie after successful signup", async () => {
    const response = await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(201);

    expect(response.get("Set-Cookie")).toBeDefined();
  });

  it("returns a 400 if email is missing, or invalid", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test",
        password: "password",
      })
      .expect(400);

    await request(app)
      .post("/api/users/signup")
      .send({
        email: "",
        password: "password",
      })
      .expect(400);

    await request(app)
      .post("/api/users/signup")
      .send({
        password: "password",
      })
      .expect(400);
  });

  it("returns a 400 if password is missing, or invalid", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "123",
      })
      .expect(400);

    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "5125214124124444444444512512515125",
      })
      .expect(400);

    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
      })
      .expect(400);
  });

  it("disallows duplicate emails", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(201);

    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(400);
  });
});
