import {
  OrderCreatedEvent,
  publisher,
  Subjects,
} from "@thabet-ticketing/common";

export class OrderCreatedPublisher extends publisher<OrderCreatedEvent> {
  subject: Subjects.OrderCreated = Subjects.OrderCreated;
}
