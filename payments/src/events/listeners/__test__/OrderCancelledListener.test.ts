import { OrderCancelledEvent, OrderStatusEnum } from "@thabet-ticketing/common";
import { natsWrapper } from "../../../NatsClient";
import { OrderCancelledListener } from "../OrderCancelledListener";
import mongoose from "mongoose";
import { createTestOrder, getTestOrder } from "../../../test/helpers";
import { Message } from "node-nats-streaming";

const setup = async () => {
    const listener = new OrderCancelledListener(natsWrapper.client);

    const order = await createTestOrder({
        userId: "123",
        price: 20,
        status: OrderStatusEnum.Created,
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
    });

    const data: OrderCancelledEvent["data"] = {
        id: order.id,
        version: 1,
        ticket: {
            id: "123",
        },
    };

    //@ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {
        msg,
        data,
        listener,
    };
};

it("throws an error if the order doesn't exist", async () => {
    const { msg, data, listener } = await setup();
    let wrongOrder = {
        ...data,
        id: new mongoose.Types.ObjectId().toHexString(),
    };

    try {
        await listener.onMessage(wrongOrder, msg);
    } catch (e) {}

    expect(msg.ack).not.toBeCalled();
});

it("marks the order as cancelled", async () => {
    const { msg, data, listener } = await setup();

    await listener.onMessage(data, msg);

    const order = await getTestOrder(data.id);
    expect(order!.status).toEqual(OrderStatusEnum.Cancelled);
});

it("acks the message if the cancellation was successful", async () => {
    const { msg, data, listener } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await getTestOrder(data.id);
    expect(updatedOrder!.status).toEqual(OrderStatusEnum.Cancelled);
    expect(msg.ack).toHaveBeenCalled();
});
