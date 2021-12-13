import { natsWrapper } from "../../../NatsClient";
import mongoose from "mongoose";
import { Message } from "node-nats-streaming";
import { createTestTicket, getTicketForTest } from "../../../test/helpers";
import { TicketUpdatedListener } from "../TicketUpdatedListener";
import { TicketUpdatedEvent } from "@thabet-ticketing/common";

const setup = async () => {
    const listener = new TicketUpdatedListener(natsWrapper.client);

    const ticket = await createTestTicket({
        id: new mongoose.Types.ObjectId().toHexString(),
        price: 20,
        title: "test",
    });

    const data: TicketUpdatedEvent["data"] = {
        id: ticket.id,
        version: ticket.version + 1,
        price: 50,
        title: "test2",
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

it("Correctly updates a ticket with valid information", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    const updatedTicket = await getTicketForTest(data.id);

    expect(updatedTicket).toBeDefined();
    expect(updatedTicket!.price).toEqual(data.price);
    expect(updatedTicket!.title).toEqual(data.title);
    expect(updatedTicket!.version).toEqual(data.version);
});

it("acks the message after a successful operation", async () => {
    const { listener, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

it("doesn't ack the message if id is invalid", async () => {
    const { listener, data, msg } = await setup();
    let incorrectData = {
        ...data,
        id: "invalidId",
    };

    try {
        await listener.onMessage(incorrectData, msg);
    } catch (e) {}

    expect(msg.ack).not.toHaveBeenCalled();
});

it("doesn't ack the message if version is invalid", async () => {
    const { listener, data, msg } = await setup();
    let incorrectData = {
        ...data,
        version: 2,
    };

    try {
        await listener.onMessage(incorrectData, msg);
    } catch (e) {}

    expect(msg.ack).not.toHaveBeenCalled();
});
