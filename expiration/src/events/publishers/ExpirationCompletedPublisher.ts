import {
    ExpirationCompleteEvent,
    publisher,
    Subjects,
} from "@thabet-ticketing/common";

export class ExpirationCompletePublisher extends publisher<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
}
