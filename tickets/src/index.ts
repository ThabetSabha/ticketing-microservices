import mongoose from "mongoose";
import { app } from "./app";
import { OrderCancelledListener } from "./events/listeners/OrderCancelledListener";
import { OrderCreatedListener } from "./events/listeners/OrderCreatedListener";
import { natsWrapper } from "./NatsClient";

const start = async () => {
    checkEnvVariables();

    try {
        await connectToMongo();
        await initializeNats();

        process.on("SIGINT", () => {
            natsWrapper.client.close();
            process.exit();
        });

        process.on("SIGTERM", () => {
            natsWrapper.client.close();
            process.exit();
        });
    } catch (e) {
        console.error("error starting the service", e);
    }

    app.listen(3000, () => {
        console.log("listening at port 3000!!!");
    });
};

start();

function checkEnvVariables() {
    if (!process.env.JWT_KEY) {
        throw new Error("JWT_KEY Enviroment variable must be provided.");
    }

    if (!process.env.MONGO_URI) {
        throw new Error("MONGO_URI Enviroment variable must be provided.");
    }

    if (!process.env.NATS_CLIENT_ID) {
        throw new Error("NATS_CLIENT_ID Enviroment variable must be provided.");
    }

    if (!process.env.NATS_URL) {
        throw new Error("NATS_URL Enviroment variable must be provided.");
    }

    if (!process.env.NATS_CLUSTER_ID) {
        throw new Error(
            "NATS_CLUSTER_ID Enviroment variable must be provided."
        );
    }
}
async function connectToMongo() {
    await mongoose.connect(process.env.MONGO_URI!);
    console.log("connected to mongoDb");
}

async function initializeNats() {
    await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID!,
        process.env.NATS_CLIENT_ID!,
        process.env.NATS_URL!
    );

    new OrderCreatedListener(natsWrapper.client).listen();
    new OrderCancelledListener(natsWrapper.client).listen();
}
