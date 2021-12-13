import express, { Request, Response } from "express";
import { body } from "express-validator";
import jwt from "jsonwebtoken";

import { Password } from "../helpers/Password";
import { BadRequestError, validateRequest } from "@thabet-ticketing/common";
import { User } from "../models/User";

const router = express.Router();

router.post(
    "/api/users/signin",
    [
        body("email").isEmail().withMessage("Please provide a valid email"),
        body("password")
            .trim()
            .notEmpty()
            .withMessage("Please supply a password"),
    ],
    validateRequest,
    async (req: Request, res: Response) => {
        const { email, password } = req.body;
        const existingUser = await User.findOne({ email });

        if (!existingUser) {
            throw new BadRequestError("Invalid Credintials");
        }

        const isPasswordCorrect = await Password.compare(
            existingUser.password,
            password
        );
        if (!isPasswordCorrect) {
            throw new BadRequestError("Invalid Credintials");
        }

        const token = jwt.sign(
            {
                id: existingUser.id,
                email: existingUser.email,
            },
            process.env.JWT_KEY!
        );

        // since we are using cookie-session, the session object will be base64 enconded
        // then sent as a cookie to the browser, so we need to first decode it to get the jwt.
        req.session = {
            jwt: token,
        };

        console.log("User successfully signed in");

        res.status(200).send(existingUser);
    }
);

export { router as signinRouter };
