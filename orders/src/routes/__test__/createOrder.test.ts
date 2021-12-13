import request from "supertest";
import { app } from "../../app";
import {
    createTestOrder,
    createTestTicket,
    getAuthCookiesForTest,
} from "../../test/helpers";
import mongoose from "mongoose";
import { OrderStatusEnum } from "@thabet-ticketing/common";
import { natsWrapper } from "../../NatsClient";

it("rejects unautorized users with status 401", async () => {
    const ticketId = "12412";

    await request(app).post("/api/orders").send({ ticketId }).expect(401);
});

it("rejects invalid ticketIds", async () => {
    const ticketId = "12412";

    await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({ ticketId })
        .expect(400);
});

it("rejects tickets that are not found with 404", async () => {
    const ticketId = new mongoose.Types.ObjectId();

    await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({ ticketId })
        .expect(404);
});

it("rejects tickets that are already reserved", async () => {
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 124,
    });

    const order = await createTestOrder({
        userId: "122",
        status: OrderStatusEnum.AwaitingPayment,
        expiresAt: new Date(),
        ticket: ticket,
    });

    await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({ ticketId: ticket.id })
        .expect(400);
});

it("responds with 201 if user is authenticated and ticket is not reserved", async () => {
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 124,
    });

    const response = await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({ ticketId: ticket.id })
        .expect(201);
});

it("successfully creates an order and reserves a ticket", async () => {
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 124,
    });

    await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({ ticketId: ticket.id })
        .expect(201);

    await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({ ticketId: ticket.id })
        .expect(400);
});

it("it emits an order created event if order was created and ticket was reserved", async () => {
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 124,
    });

    await request(app)
        .post("/api/orders")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({ ticketId: ticket.id })
        .expect(201);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
