import { OrderStatusEnum } from "@thabet-ticketing/common";
import request from "supertest";
import { app } from "../../app";
import {
    createTestOrder,
    createTestTicket,
    getAuthCookiesForTest,
} from "../../test/helpers";
import mongoose from "mongoose";

it("fetches the correct order", async () => {
    // Create a ticket
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 10,
    });

    const userId = "1";

    const order = await createTestOrder({
        userId: userId,
        status: OrderStatusEnum.AwaitingPayment,
        expiresAt: new Date(),
        ticket: ticket,
    });

    // make request to fetch the order
    const { body: fetchedOrder } = await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", getAuthCookiesForTest(userId))
        .send()
        .expect(200);

    expect(fetchedOrder.id).toEqual(order.id);
});

it("returns an error if one user tries to fetch another users order", async () => {
    // Create a ticket
    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 10,
    });

    const userOneId = "1";
    const userTwoId = "2";

    const order = await createTestOrder({
        userId: userOneId,
        status: OrderStatusEnum.AwaitingPayment,
        expiresAt: new Date(),
        ticket: ticket,
    });

    // make request to fetch the order as the other user
    await request(app)
        .get(`/api/orders/${order.id}`)
        .set("Cookie", getAuthCookiesForTest(userTwoId))
        .send()
        .expect(401);
});
