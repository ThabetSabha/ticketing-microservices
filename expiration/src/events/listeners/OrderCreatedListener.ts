import {
    Listener,
    OrderCreatedEvent,
    Subjects,
} from "@thabet-ticketing/common";
import { Message } from "node-nats-streaming";
import { expirationQueue } from "../../queues/expirationQueue";
import { queueGroupName } from "./queueGroupName";

export class OrderCreatedListener extends Listener<OrderCreatedEvent> {
    subject: Subjects.OrderCreated = Subjects.OrderCreated;
    queueGroupName = queueGroupName;
    onMessage(data: OrderCreatedEvent["data"], msg: Message) {
        const { expiresAt, id } = data;
        const delay = new Date(expiresAt).getTime() - new Date().getTime();
        console.log(`will expire the order in ${delay / 1000} seconds`);

        expirationQueue.add(
            {
                orderId: id,
            },
            {
                delay,
            }
        );

        msg.ack();
    }
}
