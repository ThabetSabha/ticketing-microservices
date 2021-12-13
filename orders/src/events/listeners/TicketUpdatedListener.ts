import {
  Listener,
  Subjects,
  TicketUpdatedEvent,
} from "@thabet-ticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketUpdatedListener extends Listener<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;

  queueGroupName = queueGroupName;

  async onMessage(data: TicketUpdatedEvent["data"], msg: Message) {
    const { id, price, title, version } = data;
    const ticket = await Ticket.findByIdAndVersion(id, version);

    if (!ticket) {
      throw new Error("ticket was not found, event might be out of order.");
    }

    ticket.set({
      price,
      title,
    });

    await ticket.save();

    msg.ack();
  }
}
