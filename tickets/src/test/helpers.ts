import { Ticket, TicketAttrs, TicketDoc } from "../models/Ticket";
import jwt from "jsonwebtoken";

/**
 *
 * @param email Email to issue the cookie for
 * @param password Password to use to issue the cookie
 * @returns an array containing the auth cookie.
 */
export const getAuthCookiesForTest = (userId: string): string[] => {
    process.env.JWT_KEY = "WHATT";

    // create a jwt
    const token = jwt.sign({ id: userId }, process.env.JWT_KEY);

    // Build session Object. { jwt: MY_JWT }
    const session = { jwt: token };

    // Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString("base64");

    // return a string thats the cookie with the encoded data
    return [`express:sess=${base64}`];
};

/**
 * Creates a ticket for testing purposes.
 * @param ticket Ticket to create
 */
export const createTestTicket = async (ticket: TicketAttrs) => {
    const newTicket = Ticket.build(ticket);
    await newTicket.save();
    return newTicket;
};

/**
 * Retrieves a ticket for testing purposes.
 * @param ticketId Id of ticket to retrieve
 */
export const getTicketForTest = async (
    ticketId: string
): Promise<TicketDoc | null> => {
    const ticket = await Ticket.findById(ticketId);
    return ticket;
};
