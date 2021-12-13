import {
    authenticateUser,
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    validateRequest,
} from "@thabet-ticketing/common";
import express, { Request, Response } from "express";

import { body } from "express-validator";
import { TicketUpdatedPublisher } from "../events/publishers/TicketUpdatedPublisher";
import { Ticket } from "../models/Ticket";
import { natsWrapper } from "../NatsClient";

const router = express.Router();

router.put(
    "/api/tickets/:ticketId",
    authenticateUser,
    [
        body("title")
            .not()
            .notEmpty()
            .isString()
            .withMessage("Title is required"),
        body("price")
            .not()
            .notEmpty()
            .isFloat({ gt: 0 })
            .withMessage("Price must be provided and greater than 0"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        // we're sure there is a current user since we're using authenticateUser Middleware
        const userId = req.currentUser!.id;
        const { title, price } = req.body;
        const { ticketId } = req.params;
        const ticket = await Ticket.findById(ticketId);
        if (!ticket) {
            throw new NotFoundError("Ticket not found");
        }

        if (ticket.userId !== userId) {
            throw new NotAuthorizedError();
        }

        if (ticket.orderId) {
            throw new BadRequestError("Can't edit a reserved ticket");
        }

        ticket.set({ title, price });
        await ticket.save();
        await new TicketUpdatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
        });
        res.status(200).send(ticket);
    }
);

export { router as updateTicketRouter };
