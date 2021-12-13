import {
  Listener,
  Subjects,
  TicketCreatedEvent,
} from "@thabet-ticketing/common";
import { Message } from "node-nats-streaming";
import { Ticket } from "../../models/Ticket";
import { queueGroupName } from "./queueGroupName";

export class TicketCreatedListener extends Listener<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
  queueGroupName = queueGroupName;
  async onMessage(data: TicketCreatedEvent["data"], msg: Message) {
    const { id, price, title } = data;
    let ticket = Ticket.build({
      price,
      title,
      id,
    });
    await ticket.save();
    msg.ack();
  }
}
