import { NotFoundError } from "@thabet-ticketing/common";
import express, { Request, Response } from "express";
import { Ticket } from "../models/Ticket";

const router = express.Router();

router.get("/api/tickets/:ticketId", async (req: Request, res: Response) => {
    const { ticketId } = req.params;
    const ticket = await Ticket.findById(ticketId);
    if (!ticket) {
        throw new NotFoundError("ticket does not exist");
    }
    res.status(200).send(ticket);
});

export { router as getTicketRouter };
