import request from "supertest";
import { app } from "../../app";
import { natsWrapper } from "../../NatsClient";
import { getAuthCookiesForTest, getTicketForTest } from "../../test/helpers";

describe("Tests the create ticket route", () => {
  it("returns a 401 if user is not authorized", async () => {
    let title = "test";
    let price = 5;

    await request(app)
      .post("/api/tickets")
      .send({
        title,
        price,
      })
      .expect(401);
  });

  it("returns a 400 if ticket title is invalid or does not exist", async () => {
    let title = "";
    let price = 5;
    let userId = "12512";

    const cookie = getAuthCookiesForTest(userId);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title,
        price,
      })
      .expect(400);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        price,
      })
      .expect(400);
  });

  it("returns a 400 if ticket price is invalid", async () => {
    let title = "test";
    let price = -1;
    let userId = "12512";

    const cookie = getAuthCookiesForTest(userId);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title,
        price,
      })
      .expect(400);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title,
      })
      .expect(400);
  });

  it("returns a 201 if user is authorized and ticket title and price are valid", async () => {
    let title = "test";
    let price = 10;
    let userId = "12512";

    const cookie = getAuthCookiesForTest(userId);

    await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title,
        price,
      })
      .expect(201);
  });

  it("creates a ticket if user is authorized and input is valid", async () => {
    let title = "test";
    let price = 10;
    let userId = "12512";

    const cookie = getAuthCookiesForTest(userId);

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title,
        price,
      })
      .expect(201);

    let ticketId = response.body.id;
    let newlyCreatedTicket = await getTicketForTest(ticketId);
    expect(newlyCreatedTicket?.price).toEqual(price);
    expect(newlyCreatedTicket?.title).toEqual(title);
  });

  it("it publishes an event after creating the ticket", async () => {
    let title = "test";
    let price = 10;
    let userId = "12512";

    const cookie = getAuthCookiesForTest(userId);

    const response = await request(app)
      .post("/api/tickets")
      .set("Cookie", cookie)
      .send({
        title,
        price,
      })
      .expect(201);

    expect(natsWrapper.client.publish).toBeCalled();
  });
});
