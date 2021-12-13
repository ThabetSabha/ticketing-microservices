import {
    Listener,
    OrderCancelledEvent,
    OrderStatusEnum,
    Subjects,
} from "@thabet-ticketing/common";
import { Message } from "node-nats-streaming";
import { Order } from "../../models/Order";
import { queueGroupName } from "./queueGroupName";

export class OrderCancelledListener extends Listener<OrderCancelledEvent> {
    subject: Subjects.OrderCancelled = Subjects.OrderCancelled;
    queueGroupName = queueGroupName;
    async onMessage(data: OrderCancelledEvent["data"], msg: Message) {
        const { id, version } = data;
        const order = await Order.findOne({
            _id: id,
            version: version - 1,
        });

        if (!order) {
            throw new Error("Order not found");
        }

        order.set({ status: OrderStatusEnum.Cancelled });

        await order.save();

        msg.ack();
    }
}
