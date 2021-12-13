import { OrderStatusEnum } from "@thabet-ticketing/common";
import request from "supertest";
import { app } from "../../app";
import {
    createTestOrder,
    createTestTicket,
    getAuthCookiesForTest,
} from "../../test/helpers";
import mongoose from "mongoose";

it("only fetches the orders that belong to a user", async () => {
    const ticketOneAttrs = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 123,
    };

    const ticketTwoAttrs = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 123,
    };

    const ticketThreeAttrs = {
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "test",
        price: 123,
    };

    // Create three tickets
    const ticketOne = await createTestTicket(ticketOneAttrs);
    const ticketTwo = await createTestTicket(ticketTwoAttrs);
    const ticketThree = await createTestTicket(ticketThreeAttrs);

    const userOneId = "1";
    const userTwoId = "2";

    const orderOne = await createTestOrder({
        userId: userTwoId,
        status: OrderStatusEnum.AwaitingPayment,
        expiresAt: new Date(),
        ticket: ticketOne,
    });

    const orderTwo = await createTestOrder({
        userId: userTwoId,
        status: OrderStatusEnum.AwaitingPayment,
        expiresAt: new Date(),
        ticket: ticketTwo,
    });

    const orderThree = await createTestOrder({
        userId: userOneId,
        status: OrderStatusEnum.AwaitingPayment,
        expiresAt: new Date(),
        ticket: ticketThree,
    });

    // Make request to get orders for User #2
    const response = await request(app)
        .get("/api/orders")
        .set("Cookie", getAuthCookiesForTest(userTwoId))
        .expect(200);

    // Make sure we only got the orders for User #2
    expect(response.body.length).toEqual(2);
    expect(response.body[0].id).toEqual(orderOne.id);
    expect(response.body[1].id).toEqual(orderTwo.id);
});
