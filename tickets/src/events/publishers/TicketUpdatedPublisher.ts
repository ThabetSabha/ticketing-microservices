import {
  publisher,
  Subjects,
  TicketUpdatedEvent,
} from "@thabet-ticketing/common";

export class TicketUpdatedPublisher extends publisher<TicketUpdatedEvent> {
  subject: Subjects.TicketUpdated = Subjects.TicketUpdated;
}
