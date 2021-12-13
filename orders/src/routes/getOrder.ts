import express, { Request, Response } from "express";
import {
    authenticateUser,
    NotFoundError,
    NotAuthorizedError,
} from "@thabet-ticketing/common";
import { Order } from "../models/Order";
import { param } from "express-validator";
import mongoose from "mongoose";

const router = express.Router();

router.get(
    "/api/orders/:orderId",
    authenticateUser,
    [
        param("orderId")
            .not()
            .notEmpty()
            .custom((input: string) => mongoose.Types.ObjectId.isValid(input)),
    ],
    async (req: Request, res: Response) => {
        const order = await Order.findById(req.params.orderId).populate(
            "ticket"
        );

        if (!order) {
            throw new NotFoundError();
        }
        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        res.send(order);
    }
);

export { router as getOrderRouter };
