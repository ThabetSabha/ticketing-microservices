import Queue from "bull";
import { ExpirationCompletePublisher } from "../events/publishers/ExpirationCompletedPublisher";
import { natsWrapper } from "../NatsClient";

interface Payload {
    orderId: string;
}

export const expirationQueue = new Queue<Payload>("order:expiration", {
    redis: {
        host: process.env.REDIS_HOST,
    },
});

expirationQueue.process(function (job) {
    const { orderId } = job.data;
    new ExpirationCompletePublisher(natsWrapper.client).publish({
        orderId,
    });
});
