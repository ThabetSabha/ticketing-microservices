import express from "express";

/**
 * Middlewares
 */
import "express-async-errors";
import { errorHandler, NotFoundError } from "@thabet-ticketing/common";
import cookieSession from "cookie-session";

/**
 * Routes
 */
import { currentuserRouter } from "./routes/currentuser";
import { signinRouter } from "./routes/signin";
import { signoutRouter } from "./routes/signout";
import { signupRouter } from "./routes/signup";

const app = express();

// https://stackoverflow.com/questions/23413401/what-does-trust-proxy-actually-do-in-express-js-and-do-i-need-to-use-it
// basically tells express to trust x-forwarded-* headers, and use the Ip of the X-forwarded-for instead of the internal reverse
// proxy ip when calling req.ip/s
app.set("trust proxy", 1);

app.use(express.json());

app.use(
    cookieSession({
        secure: false,
        signed: false,
    })
);

app.use(signupRouter);
app.use(signinRouter);
app.use(signoutRouter);
app.use(currentuserRouter);

app.all("*", (req, res) => {
    throw new NotFoundError();
});

app.use(errorHandler);

export { app };
