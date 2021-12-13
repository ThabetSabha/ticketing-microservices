import {
    Listener,
    OrderCancelledEvent,
    Subjects,
} from "@thabet-ticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { TicketUpdatedPublisher } from "../publishers/TicketUpdatedPublisher";
import { queueGroupName } from "./queueGroupName";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;

    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        // find the ticket
        const ticket = await Ticket.findOne({
            _id: data.ticket.id,
            orderId: data.id,
        });

        if (!ticket) {
            throw new Error("ticket not found");
        }

        // remove the order id
        ticket.set({ orderId: undefined });
        await ticket.save();

        // publish ticket updated event
        const { id, version, price, title, userId, orderId } = ticket;
        await new TicketUpdatedPublisher(this.client).publish({
            id,
            version,
            price,
            title,
            userId,
            orderId,
        });

        // ack the message.
        msg.ack();
    }
}
