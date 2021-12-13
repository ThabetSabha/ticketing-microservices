import {
  OrderCancelledEvent,
  publisher,
  Subjects,
} from "@thabet-ticketing/common";

export class OrderCancelledPublisher extends publisher<OrderCancelledEvent> {
  subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
}
