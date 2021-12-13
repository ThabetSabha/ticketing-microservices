import {
    authenticateUser,
    NotFoundError,
    NotAuthorizedError,
} from "@thabet-ticketing/common";
import express, { Request, Response } from "express";
import { param } from "express-validator";
import mongoose from "mongoose";
import { OrderCancelledPublisher } from "../events/publishers/OrderCancelledPublisher";
import { Order, OrderStatusEnum } from "../models/Order";
import { natsWrapper } from "../NatsClient";

const router = express.Router();

router.delete(
    "/api/orders/:orderId",
    authenticateUser,
    [
        param("orderId")
            .not()
            .notEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input)),
    ],
    async (req: Request, res: Response) => {
        const { orderId } = req.params;

        const order = await Order.findById(orderId).populate("ticket");

        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }
        order.status = OrderStatusEnum.Cancelled;
        await order.save();

        // publishing an event saying the order was cancelled
        await new OrderCancelledPublisher(natsWrapper.client).publish({
            id: order.id,
            version: order.version,
            ticket: {
                id: order.ticket.id,
            },
        });

        res.status(204).send(order);
    }
);

export { router as cancelOrderRouter };
