import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { createTestTicket } from "../../test/helpers";

describe("Tests the get ticket route", () => {
  it("returns a 404 if ticket doesn't exist", async () => {
    let ticketId = new mongoose.Types.ObjectId().toHexString();
    await request(app).get(`/api/tickets/${ticketId}`).expect(404);
  });

  it("returns 200 if ticket exists", async () => {
    let title = "test";
    let price = 5;
    let userId = "123";

    const ticket = await createTestTicket({
      title,
      price,
      userId,
    });

    await request(app).get(`/api/tickets/${ticket.id}`).expect(200);
  });

  it("returns the correct ticket if it exists", async () => {
    let title = "test";
    let price = 5;
    let userId = "123";

    const ticket = await createTestTicket({
      title,
      price,
      userId,
    });

    const responseTicket = await request(app)
      .get(`/api/tickets/${ticket.id}`)
      .expect(200);
    expect(responseTicket.body.title).toEqual(title);
    expect(responseTicket.body.price).toEqual(price);
    expect(responseTicket.body.userId).toEqual(userId);
  });
});
