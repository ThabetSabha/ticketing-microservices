import request from "supertest";
import { app } from "../../app";
import { createTestTicket } from "../../test/helpers";

describe("Tests the get all tickets route", () => {
  it("returns a 200", async () => {
    await request(app).get("/api/tickets").expect(200);
  });

  it("returns all the existing tickets", async () => {
    let ticketsArray = [
      {
        userId: "123",
        title: "test1",
        price: 5,
      },
      {
        userId: "1234",
        title: "test2",
        price: 5,
      },
      {
        userId: "12345",
        title: "test3",
        price: 5,
      },
    ];

    for (let i = 0; i < ticketsArray.length; i++) {
      await createTestTicket(ticketsArray[i]);
    }

    const res = await request(app).get("/api/tickets").expect(200);
    expect(res.body.length).toEqual(ticketsArray.length);
  });
});
