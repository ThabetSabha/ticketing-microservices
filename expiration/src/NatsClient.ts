import nats, { Stan } from "node-nats-streaming";

class NatsWrapper {
    // used to let ts know that the _client can be undefined for sometime (in this case until connect is called)
    private _client?: Stan;

    // getter implementation in ts, throw an error.
    get client() {
        if (!this._client) {
            throw new Error("Cannot access NATS client before connecting");
        }

        return this._client;
    }

    async connect(clusterId: string, clientId: string, url: string) {
        this._client = nats.connect(clusterId, clientId, { url });
        return new Promise<void>((resolve, reject) => {
            this.client.on("connect", () => {
                console.log("connected to nats");
                resolve();
            });

            this.client.on("error", (error) => {
                console.error(`nats client error: ${error}`);
                reject(error);
            });

            this.client.on("close", () => {
                console.log("NATS connection closed!");
            });
        });
    }
}

export const natsWrapper = new NatsWrapper();
