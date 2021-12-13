import request from "supertest";
import { app } from "../../app";
import { getAuthCookiesForTest } from "../../test/helpers";

describe("It should test the currenctUser route", () => {
  it("returns 200 and null if no user is signed in", async () => {
    const response = await request(app)
      .get("/api/users/currentuser")
      .expect(200);

    expect(response.body.currentUser).toEqual(null);
  });

  it("returns 200 and the correct user if user is signed in", async () => {
    const email = "test@test.com";
    const password = "password";
    const cookie = await getAuthCookiesForTest(email, password);
    const response = await request(app)
      .get("/api/users/currentuser")
      .set("Cookie", cookie[0])
      .expect(200);

    expect(response.body.currentUser.email).toEqual(email);
  });
});
