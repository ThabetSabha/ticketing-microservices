import {
    Listener,
    OrderCreatedEvent,
    Subjects,
} from "@thabet-ticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { TicketUpdatedPublisher } from "../publishers/TicketUpdatedPublisher";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;

    queueGroupName = queueGroupName;

    async onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        // find the ticket
        const ticket = await Ticket.findById(data.ticket.id);

        if (!ticket) {
            throw new Error("ticket not found");
        }

        // Mark the ticket as being reserved by setting its orderId property
        ticket.set({ orderId: data.id });
        await ticket.save();

        // publish a ticket updated event:
        const { id, version, price, title, userId, orderId } = ticket;
        await new TicketUpdatedPublisher(this.client).publish({
            id,
            version,
            price,
            title,
            userId,
            orderId,
        });

        // ack the message
        msg.ack();
    }
}
