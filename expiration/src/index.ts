import { OrderCreatedListener } from "./events/listeners/OrderCreatedListener";
import { natsWrapper } from "./NatsClient";

const start = async () => {
    checkEnvVariables();

    try {
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
};

start();

function checkEnvVariables() {
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

    if (!process.env.REDIS_HOST) {
        throw new Error("REDIS_HOST Enviroment variable must be provided.");
    }
}

async function initializeNats() {
    await natsWrapper.connect(
        process.env.NATS_CLUSTER_ID!,
        process.env.NATS_CLIENT_ID!,
        process.env.NATS_URL!
    );

    new OrderCreatedListener(natsWrapper.client).listen();
}
