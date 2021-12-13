import {
    ExpirationCompleteEvent,
    Listener,
    OrderStatusEnum,
    Subjects,
} from "@thabet-ticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { OrderCancelledPublisher } from "../publishers/OrderCancelledPublisher";
import { queueGroupName } from "./queueGroupName";

export class ExpirationCompleteListener extends Listener<ExpirationCompleteEvent> {
    subject: Subjects.ExpirationComplete = Subjects.ExpirationComplete;
    queueGroupName = queueGroupName;

    async onMessage(data: ExpirationCompleteEvent["data"], msg: Message) {
        const { orderId } = data;

        const order = await Order.findById(orderId).populate("ticket");

        if (!order) {
            throw new Error("Order not found");
        }

        if (order.status === OrderStatusEnum.Complete) {
            return msg.ack();
        }

        order.set({
            status: OrderStatusEnum.Cancelled,
        });

        await order.save();

        const { id, version, ticket } = order;
        await new OrderCancelledPublisher(this.client).publish({
            id,
            version,
            ticket: {
                id: ticket.id,
            },
        });

        msg.ack();
    }
}
