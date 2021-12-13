import {
  publisher,
  Subjects,
  TicketCreatedEvent,
} from "@thabet-ticketing/common";

export class TicketCreatedPublisher extends publisher<TicketCreatedEvent> {
  subject: Subjects.TicketCreated = Subjects.TicketCreated;
}
