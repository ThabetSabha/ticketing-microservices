import request from "supertest";
import { app } from "../../app";

describe("It should test the sign out route", () => {
  it("returns 200 on sign out", async () => {
    await request(app).post("/api/users/signout").expect(200);
  });

  it("removes cookie and returns 200 on sign out", async () => {
    const response = await request(app).post("/api/users/signout").expect(200);
    expect(response.get("Set-Cookie")[0]).toBe(
      "express:sess=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; httponly"
    );
  });
});
