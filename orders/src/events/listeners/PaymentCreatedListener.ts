import {
    Listener,
    OrderStatusEnum,
    PaymentCreatedEvent,
    Subjects,
} from "@thabet-ticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queueGroupName";

export class PaymentCreatedListener extends Listener<PaymentCreatedEvent> {
    subject: Subjects.PaymentCreated = Subjects.PaymentCreated;
    queueGroupName = queueGroupName;
    async onMessage(data: PaymentCreatedEvent["data"], msg: Message) {
        const order = await Order.findById(data.orderId);
        if (!order) {
            throw new Error(`order ${data.orderId} not found`);
        }

        order.set({ status: OrderStatusEnum.Complete });
        await order.save();

        // No need to publish order updated, sinc the order complete is the final state, and no other service
        // need to know about it for now.

        msg.ack();
    }
}
