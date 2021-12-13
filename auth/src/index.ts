import mongoose from "mongoose";
import { app } from "./app";

const start = async () => {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY Enviroment variable must be provided.");
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI Enviroment variable must be provided.");
    }

    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("connected to mongoDb");
    } catch (e) {
        console.error("error logging in to mongoDb, error:", e);
    }

    app.listen(3000, () => {
        console.log("listening at port 3000!!");
    });
};

start();
