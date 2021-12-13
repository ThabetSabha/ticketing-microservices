import request from "supertest";
import { app } from "../../app";
import {
    createTestTicket,
    getAuthCookiesForTest,
    getTicketForTest,
} from "../../test/helpers";
import mongoose from "mongoose";
import { natsWrapper } from "../../NatsClient";

describe("Tests the update ticket route", () => {
    it("returns a 401 if user is not authorized", async () => {
        let title = "test";
        let price = 5;
        let ticketId = new mongoose.Types.ObjectId().toHexString();

        await request(app)
            .put(`/api/tickets/${ticketId}`)
            .send({
                title,
                price,
            })
            .expect(401);
    });

    it("returns a 401 if user is signed in, but ticket doesn't belong to user", async () => {
        let title = "test";
        let price = 5;

        const newTicket = await createTestTicket({
            userId: "firstUser",
            title,
            price,
        });

        const cookie = getAuthCookiesForTest("secondUser");

        await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(401);
    });

    it("returns a 400 if ticket title is an empty string, or does not exist", async () => {
        let title = "";
        let price = 5;
        let userId = "12512";

        const cookie = getAuthCookiesForTest(userId);

        const newTicket = await createTestTicket({
            userId,
            title: "test",
            price: 5,
        });

        await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(400);

        await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                price,
            })
            .expect(400);
    });

    it("returns a 400 if ticket price is negative or doesn't exist", async () => {
        let title = "test";
        let price = -1;
        let userId = "12512";

        const cookie = getAuthCookiesForTest(userId);

        const newTicket = await createTestTicket({
            userId,
            title: "test",
            price: 5,
        });

        await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(400);

        await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                title,
            })
            .expect(400);
    });

    it("returns a 400 if ticket is reserved", async () => {
        let title = "test2";
        let price = 10;
        let userId = "12512";

        const cookie = getAuthCookiesForTest(userId);

        const newTicket = await createTestTicket({
            userId,
            title: "test",
            price: 5,
        });

        newTicket.set({ orderId: "1" });
        await newTicket.save();

        await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(400);
    });

    it("returns a 200 if user is authorized and ticket title and price are valid", async () => {
        let title = "test";
        let price = 10;
        let userId = "12512";

        const cookie = getAuthCookiesForTest(userId);

        const newTicket = await createTestTicket({
            userId,
            title: "test",
            price: 5,
        });

        await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(200);
    });

    it("returns a 404 if user is authorized but ticketId doesn't exist", async () => {
        let title = "test";
        let price = 10;
        let userId = "12512";
        let ticketId = new mongoose.Types.ObjectId().toHexString();

        const cookie = getAuthCookiesForTest(userId);

        await request(app)
            .put(`/api/tickets/${ticketId}`)
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(404);
    });

    it("updates a ticket if user is authorized and input is valid", async () => {
        let title = "test";
        let price = 10;
        let userId = "12512";

        const cookie = getAuthCookiesForTest(userId);

        const newTicket = await createTestTicket({
            userId,
            title: "test",
            price: 5,
        });

        const updatedTicketResponse = await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(200);
        let ticketId = updatedTicketResponse.body.id;
        let newlyCreatedTicket = await getTicketForTest(ticketId);
        expect(newlyCreatedTicket?.price).toEqual(price);
        expect(newlyCreatedTicket?.title).toEqual(title);
    });

    it("it publishes an event after updating the ticket", async () => {
        let title = "test";
        let price = 10;
        let userId = "12512";

        const cookie = getAuthCookiesForTest(userId);

        const newTicket = await createTestTicket({
            userId,
            title: "test",
            price: 5,
        });

        const updatedTicketResponse = await request(app)
            .put(`/api/tickets/${newTicket.id}`)
            .set("Cookie", cookie)
            .send({
                title,
                price,
            })
            .expect(200);

        expect(natsWrapper.client.publish).toBeCalled();
    });
});
