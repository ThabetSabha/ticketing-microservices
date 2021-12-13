import request from "supertest";
import { app } from "../../app";

describe("It should test the sign in route", () => {
  process.env.JWT_KEY = "WHATT";

  it("returns a 200 on successful signin", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(201);

    await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(200);
  });

  it("sets a cookie after successful signin", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(201);

    const response = await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(200);

    expect(response.get("Set-Cookie")).toBeDefined();
  });

  it("returns a 400 if email is not signed up", async () => {
    await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(400);
  });

  it("returns a 400 if password is invalid", async () => {
    await request(app)
      .post("/api/users/signup")
      .send({
        email: "test@gmail.com",
        password: "password",
      })
      .expect(201);

    await request(app)
      .post("/api/users/signin")
      .send({
        email: "test@gmail.com",
        password: "!password",
      })
      .expect(400);
  });
});
