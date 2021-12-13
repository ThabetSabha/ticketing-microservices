import {
    PaymentCreatedEvent,
    publisher,
    Subjects,
} from "@thabet-ticketing/common";

export class PaymentCreatedPublisher extends publisher<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
}
