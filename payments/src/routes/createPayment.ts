import {
    authenticateUser,
    BadRequestError,
    NotAuthorizedError,
    NotFoundError,
    OrderStatusEnum,
    validateRequest,
} from "@thabet-ticketing/common";
import express, { Request, Response } from "express";
import { body } from "express-validator";
import { PaymentCreatedPublisher } from "../events/publishers/PaymentCreatedPublisher";
import { Order } from "../models/Order";
import { Payment } from "../models/Payment";
import { natsWrapper } from "../NatsClient";
import { stripe } from "../Stripe";

const router = express.Router();

router.post(
    "/api/payments",
    authenticateUser,
    [
        body("orderId")
            .isString()
            .not()
            .isEmpty()
            .withMessage("OrderId must be provided"),
        body("token")
            .isString()
            .not()
            .isEmpty()
            .withMessage("token must be provided"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { orderId, token } = req.body;

        const order = await Order.findById(orderId);

        if (!order) {
            throw new NotFoundError("order not found");
        }

        if (order.userId !== req.currentUser!.id) {
            throw new NotAuthorizedError();
        }

        if (order.status === OrderStatusEnum.Cancelled) {
            throw new BadRequestError("Cannot pay for an cancelled order");
        }

        const charge = await stripe.charges.create({
            amount: order.price * 100,
            currency: "usd",
            source: token,
        });

        const payment = Payment.build({
            orderId,
            stripeChargeId: charge.id,
        });

        await payment.save();

        await new PaymentCreatedPublisher(natsWrapper.client).publish({
            paymentId: payment.id,
            orderId: payment.orderId,
            stripeChargeId: payment.stripeChargeId,
        });

        return res.status(201).json({ success: true, payment });
    }
);

export { router as createPaymentRouter };
