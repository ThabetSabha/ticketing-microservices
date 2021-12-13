import { OrderCreatedEvent, OrderStatusEnum } from "@thabet-ticketing/common";
import { natsWrapper } from "../../../NatsClient";
import { OrderCreatedListener } from "../OrderCreatedListener";
import { createTestTicket } from "../../../test/helpers";
import { Ticket } from "../../../models/Ticket";

const setup = async () => {
    const listener = new OrderCreatedListener(natsWrapper.client);

    const ticket = await createTestTicket({
        userId: "123",
        price: 50,
        title: "test",
    });

    const data: OrderCreatedEvent["data"] = {
        id: "1",
        version: 0,
        userId: "abc",
        expiresAt: new Date().toISOString(),
        status: OrderStatusEnum.Created,
        ticket: {
            id: ticket.id,
            price: ticket.price,
        },
    };

    // @ts-ignore
    const msg: Message = {
        ack: jest.fn(),
    };

    return {
        listener,
        data,
        msg,
        ticket,
    };
};

it("sets the orderId of the ticket", async () => {
    const { listener, ticket, data, msg } = await setup();

    await listener.onMessage(data, msg);

    const updatedTicket = await Ticket.findById(ticket.id);

    expect(updatedTicket!.orderId).toEqual(data.id);
});

it("acks the message", async () => {
    const { listener, ticket, data, msg } = await setup();
    await listener.onMessage(data, msg);

    expect(msg.ack).toHaveBeenCalled();
});

// TODO add other .toEquals to toHaveBeenCalledWitj
it("publishes a ticket updated event", async () => {
    const { listener, data, msg } = await setup();

    await listener.onMessage(data, msg);

    expect(natsWrapper.client.publish).toHaveBeenCalled();

    const ticketUpdatedData = JSON.parse(
        (natsWrapper.client.publish as jest.Mock).mock.calls[0][1]
    );

    expect(data.id).toEqual(ticketUpdatedData.orderId);
});
