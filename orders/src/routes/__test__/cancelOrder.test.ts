import { OrderStatusEnum } from "@thabet-ticketing/common";
import request from "supertest";
import { app } from "../../app";
import { Order } from "../../models/Order";
import { natsWrapper } from "../../NatsClient";
import {
    createTestOrder,
    createTestTicket,
    getAuthCookiesForTest,
} from "../../test/helpers";
import mongoose from "mongoose";

it("requires authentication", async () => {
    // make a request to cancel the order
    await request(app).delete(`/api/orders/123`).send().expect(401);
});

it("requires order to belong to user before cancelling it", async () => {
    // create a ticket with Ticket Model
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20,
    });

    const userId = "123";

    const order = await createTestOrder({
        userId,
        ticket,
        expiresAt: new Date(),
        status: OrderStatusEnum.Created,
    });

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", getAuthCookiesForTest("not123"))
        .send()
        .expect(401);

    // expectation to make sure the order is not cancelled
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatusEnum.Created);
});

it("marks an order as cancelled", async () => {
    // create a ticket with Ticket Model
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20,
    });

    const userId = "123";

    const order = await createTestOrder({
        userId,
        ticket,
        expiresAt: new Date(),
        status: OrderStatusEnum.Created,
    });

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", getAuthCookiesForTest(userId))
        .send()
        .expect(204);

    // expectation to make sure the thing is cancelled
    const updatedOrder = await Order.findById(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatusEnum.Cancelled);
});

it("emits an order cancelled event", async () => {
    // create a ticket with Ticket Model
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20,
    });

    const userId = "123";

    const order = await createTestOrder({
        userId,
        ticket,
        expiresAt: new Date(),
        status: OrderStatusEnum.Created,
    });

    // make a request to cancel the order
    await request(app)
        .delete(`/api/orders/${order.id}`)
        .set("Cookie", getAuthCookiesForTest(userId))
        .send()
        .expect(204);

    expect(natsWrapper.client.publish).toHaveBeenCalled();
});
