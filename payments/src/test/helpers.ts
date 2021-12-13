import jwt from "jsonwebtoken";
import { Order, OrderAttrs, OrderDoc } from "../models/Order";

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

export const createTestOrder = async (order: OrderAttrs): Promise<OrderDoc> => {
    const newOrder = Order.build(order);
    await newOrder.save();
    return newOrder;
};

export const getTestOrder = async (
    orderId: string
): Promise<OrderDoc | null> => {
    const order = await Order.findById(orderId);
    return order;
};
