import { authenticateUser, validateRequest } from "@thabet-ticketing/common";
import { Request, Response } from "express";
import express from "express";
import { body } from "express-validator";
import { Ticket } from "../models/Ticket";
import { TicketCreatedPublisher } from "../events/publishers/TicketCreatedPublisher";
import { natsWrapper } from "../NatsClient";

const router = express.Router();

router.post(
    "/api/tickets",
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
        const ticket = Ticket.build({ userId, title, price });
        await ticket.save();
        // we're pulling the props of the ticket object, in case there any presave hooks, or
        // sanitization which would render the props of the req object incorrect
        await new TicketCreatedPublisher(natsWrapper.client).publish({
            id: ticket.id,
            price: ticket.price,
            title: ticket.title,
            userId: ticket.userId,
            version: ticket.version,
        });
        res.status(201).send(ticket);
    }
);

export { router as createTicketRouter };
