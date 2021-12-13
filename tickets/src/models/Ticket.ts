import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

// An interface that describes the properties
// that are requried to create a new Ticket
export interface TicketAttrs {
    title: string;
    price: number;
    userId: string;
}

// An interface that describes the properties
// that a User Document has
export interface TicketDoc extends mongoose.Document {
    title: string;
    price: number;
    userId: string;
    id: string;
    version: number;
    orderId?: string;
}

// An interface that describes the properties
// that a User Model has
// we are extending a model that returns
// and creates documents that are UserDoc
interface TicketModel extends mongoose.Model<TicketDoc> {
    build(attrs: TicketAttrs): TicketDoc;
}

const ticketSchema = new mongoose.Schema(
    {
        title: {
            type: String,
            required: true,
        },
        price: {
            type: Number,
            required: true,
        },
        userId: {
            type: String,
            required: true,
        },
        orderId: {
            type: String,
        },
    },
    {
        toJSON: {
            transform(doc, returnedObject) {
                returnedObject.id = returnedObject._id;
                delete returnedObject._id;
                delete returnedObject.__v;
            },
        },
    }
);

ticketSchema.set("versionKey", "version");
ticketSchema.plugin(updateIfCurrentPlugin);
ticketSchema.statics.build = (attrs: TicketAttrs) => {
    return new Ticket(attrs);
};

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
    "Ticket",
    ticketSchema
);
