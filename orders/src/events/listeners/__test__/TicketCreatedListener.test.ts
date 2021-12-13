import { TicketCreatedListener } from "../TicketCreatedListener";
import { natsWrapper } from "../../../NatsClient";
import { TicketCreatedEvent } from "@thabet-ticketing/common";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { getTicketForTest } from "../../../test/helpers";

const setup = () => {
    const listener = new TicketCreatedListener(natsWrapper.client);

    const data: TicketCreatedEvent["data"] = {
        id: new mongoose.Types.ObjectId().toHexString(),
        version: 0,
        price: 20,
        title: "test",
        userId: "123",
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {
        listener,
        data,
        msg,
    };
};

it("Correctly saves a ticket with valid information", async () => {
    const { listener, data, msg } = setup();
    await listener.onMessage(data, msg);

    const ticket = await getTicketForTest(data.id);

    expect(ticket).toBeDefined();
    expect(ticket!.price).toEqual(data.price);
});

it("acks the message after a successful operation", async () => {
    const { listener, data, msg } = setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it("doesn't ack the message if data is invalid", async () => {
    const { listener, data, msg } = setup();
    let incorrectData = {
        ...data,
        id: "invalidId",
    };

    try {
        await listener.onMessage(incorrectData, msg);
    } catch (e) {}

    expect(msg.ack).not.toHaveBeenCalled();
});
