import express from "express";

/**
 * Middlewares
 */
import "express-async-errors";
import {
    errorHandler,
    getCurrentUser,
    NotFoundError,
} from "@thabet-ticketing/common";
import cookieSession from "cookie-session";

/**
 * Routes
 */
import { createOrderRouter } from "./routes/createOrder";
import { getOrderRouter } from "./routes/getOrder";
import { getAllOrdersRouter } from "./routes/getAllOrders";
import { cancelOrderRouter } from "./routes/cancelOrder";

const app = express();

// https://stackoverflow.com/questions/23413401/what-does-trust-proxy-actually-do-in-express-js-and-do-i-need-to-use-it
// basically tells express to trust x-forwarded-* headers, and use the Ip of the X-forwarded-for instead of the internal reverse
// proxy ip when calling req.ip/s
app.set("trust proxy", 1);

app.use(express.json());

app.use(
    cookieSession({
        secure: process.env.NODE_ENV == "test" ? false : true,
        signed: false,
    })
);

app.use(getCurrentUser);
app.use((req, res, next) => {
    console.log(req.url);
    next();
});
app.use(createOrderRouter);
app.use(getOrderRouter);
app.use(getAllOrdersRouter);
app.use(cancelOrderRouter);

app.all("*", (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
