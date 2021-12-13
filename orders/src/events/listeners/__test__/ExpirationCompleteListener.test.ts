import {
    ExpirationCompleteEvent,
    OrderStatusEnum,
} from "@thabet-ticketing/common";
import mongoose from "mongoose";
import { natsWrapper } from "../../../NatsClient";
import {
    createTestOrder,
    createTestTicket,
    getTestOrder,
} from "../../../test/helpers";
import { ExpirationCompleteListener } from "../ExpirationCompleteListener";

const setup = async () => {
    const listener = new ExpirationCompleteListener(natsWrapper.client);

    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        title: "concert",
        price: 20,
    });

    const order = await createTestOrder({
        status: OrderStatusEnum.Created,
        userId: "alskdfj",
        expiresAt: new Date(),
        ticket,
    });

    const data: ExpirationCompleteEvent["data"] = {
        orderId: order.id,
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return { listener, order, ticket, data, msg };
};

it("updates the order status to cancelled", async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedOrder = await getTestOrder(order.id);

    expect(updatedOrder!.status).toEqual(OrderStatusEnum.Cancelled);
});

it("emit an OrderCancelled event", async () => {
    const { listener, order, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const eventData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );
    expect(eventData.id).toEqual(order.id);
});

it("ack the message", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});
