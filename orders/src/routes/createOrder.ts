import { Request, Response } from "express";
import express from "express";
import {
    authenticateUser,
    BadRequestError,
    NotFoundError,
    OrderStatusEnum,
    validateRequest,
} from "@thabet-ticketing/common";
import { body } from "express-validator";
import { Ticket } from "../models/Ticket";
import { Order } from "../models/Order";
import mongoose from "mongoose";
import { OrderCreatedPublisher } from "../events/publishers/OrderCreatedPublisher";
import { natsWrapper } from "../NatsClient";

const ORDER_EXPIRY_WINDOW_IN_SECONDS = 60 * 15;

const router = express.Router();

router.post(
    "/api/orders",
    authenticateUser,
    [
        body("ticketId")
            .not()
            .notEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input))
            .withMessage("ticketId is required"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { ticketId } = req.body;

        // find if ticket exists
        const ticket = await Ticket.findById(ticketId);

        if (!ticket) {
            throw new NotFoundError();
        }

        // check if ticket is already reserved
        const isTicketAlreadyReserved = await ticket.isReserved();

        if (isTicketAlreadyReserved) {
            throw new BadRequestError("Ticket is already reserved");
        }

        // order expires after 30 seconds
        const orderExpiryTime = new Date();
        orderExpiryTime.setSeconds(
            orderExpiryTime.getSeconds() + ORDER_EXPIRY_WINDOW_IN_SECONDS
        );

        const order = Order.build({
            userId: req.currentUser!.id,
            status: OrderStatusEnum.Created,
            expiresAt: orderExpiryTime,
            ticket: ticket,
        });

        await order.save();

        // publishing an event saying the order was created
        await new OrderCreatedPublisher(natsWrapper.client).publish({
            id: order.id,
            userId: order.userId,
            expiresAt: orderExpiryTime.toISOString(),
            status: order.status,
            version: order.version,
            ticket: {
                id: ticket.id,
                price: ticket.price,
            },
        });

        res.status(201).send(order);
    }
);

export { router as createOrderRouter };
