import request from "supertest";
import mongoose from "mongoose";
import { app } from "../../app";
import { createTestOrder, getAuthCookiesForTest } from "../../test/helpers";
jest.mock("../../Stripe.ts");
import { stripe } from "../../Stripe";
import { OrderStatusEnum } from "@thabet-ticketing/common";
import { Payment } from "../../models/Payment";
import { natsWrapper } from "../../NatsClient";

const token = "test_token";
const orderId = new mongoose.Types.ObjectId().toHexString();

it("rejects unauthorized users", async () => {
    const res = await request(app).post("/api/payments").send({
        orderId: "124",
        token: "test_token",
    });

    expect(res.status).toEqual(401);
});

it("rejects requests that don't include orderId, or with invalid orderId", async () => {
    const firstRes = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({
            token: "test_token",
        });

    expect(firstRes.status).toEqual(400);

    const secondRes = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({
            token: "test_token",
            orderId: 123,
        });

    expect(secondRes.status).toEqual(400);
});

it("rejects requests that don't include token, or include invalid token", async () => {
    const firstRes = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({
            token: 12,
            orderId: "123",
        });

    expect(firstRes.status).toEqual(400);

    const secondRes = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({
            orderId: "123",
        });

    expect(secondRes.status).toEqual(400);
});

it("returns 404 when order doesn't exist", async () => {
    const res = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("123"))
        .send({
            token,
            orderId,
        });

    expect(res.status).toEqual(404);
});

it("returns 401 when order doesn't belong to user", async () => {
    const order = await createTestOrder({
        userId: "1",
        id: orderId,
        status: OrderStatusEnum.Created,
        price: 20,
        version: 0,
    });

    const res = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("2"))
        .send({
            token,
            orderId: order.id,
        });

    expect(res.status).toEqual(401);
});

it("returns 400 when order was already cancelled", async () => {
    const order = await createTestOrder({
        userId: "1",
        id: orderId,
        status: OrderStatusEnum.Cancelled,
        price: 20,
        version: 0,
    });

    const res = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("1"))
        .send({
            token,
            orderId: order.id,
        });

    expect(res.status).toEqual(400);
});

it("tries to create a charge with the correct arguments if orderId and token are valid", async () => {
    const order = await createTestOrder({
        userId: "1",
        id: orderId,
        status: OrderStatusEnum.Created,
        price: 20,
        version: 0,
    });

    const res = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("1"))
        .send({
            token,
            orderId: order.id,
        });

    expect(stripe.charges.create).toHaveBeenCalled();
    expect(stripe.charges.create).toBeCalledWith({
        amount: order.price * 100,
        currency: "usd",
        source: token,
    });
});

it("creates a payment document with the correct props", async () => {
    const order = await createTestOrder({
        userId: "1",
        id: orderId,
        status: OrderStatusEnum.Created,
        price: 20,
        version: 0,
    });

    const res = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("1"))
        .send({
            token,
            orderId: order.id,
        });

    expect(stripe.charges.create).toHaveBeenCalled();
    const payment = await Payment.findOne({ orderId: order.id });

    expect(payment).not.toBeNull();
});

it("publishes a payment created event and returns 201 if all goes well", async () => {
    const order = await createTestOrder({
        userId: "1",
        id: orderId,
        status: OrderStatusEnum.Created,
        price: 20,
        version: 0,
    });

    const res = await request(app)
        .post("/api/payments")
        .set("Cookie", getAuthCookiesForTest("1"))
        .send({
            token,
            orderId: order.id,
        });

    expect(stripe.charges.create).toHaveBeenCalled();
    const payment = await Payment.findOne({ orderId: order.id });

    expect(payment).not.toBeNull();

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    expect(res.status).toEqual(201);
});
