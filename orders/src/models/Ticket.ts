import mongoose from "mongoose";
import { Order, OrderStatusEnum } from "./Order";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export interface TicketAttrs {
  id: string;
  title: string;
  price: number;
}

export interface TicketDoc extends mongoose.Document {
  title: string;
  price: number;
  version: number;
  isReserved(): Promise<Boolean>;
}

interface TicketModel extends mongoose.Model<TicketDoc> {
  build(attrs: TicketAttrs): TicketDoc;
  findByIdAndVersion(id: string, version: number): Promise<TicketDoc | null>;
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
  },
  {
    toJSON: {
      transform(doc, ret) {
        ret.id = doc._id;
        delete ret._id;
      },
    },
  }
);

ticketSchema.set("versionKey", "version");

ticketSchema.plugin(updateIfCurrentPlugin);

ticketSchema.statics.build = (attrs: TicketAttrs) => {
  const { id, price, title } = attrs;
  return new Ticket({
    _id: id,
    price,
    title,
  });
};

/**
 *
 * @param id id of document to look for
 * @param version latest version of the document received from event.
 * @returns will return a ticket if event is in order, otherwise will return null
 */
ticketSchema.statics.findByIdAndVersion = async (
  id: string,
  version: number
): Promise<TicketDoc | null> => {
  return await Ticket.findOne({
    _id: id,
    version: version - 1,
  });
};

/**
 * Checks to see if a ticket is already reserved in an order
 */
ticketSchema.methods.isReserved = async function (): Promise<Boolean> {
  const existingOrder = await Order.findOne({
    ticket: this,
    status: {
      $in: [
        OrderStatusEnum.Complete,
        OrderStatusEnum.AwaitingPayment,
        OrderStatusEnum.Created,
      ],
    },
  });
  return !!existingOrder;
};

export const Ticket = mongoose.model<TicketDoc, TicketModel>(
  "Ticket",
  ticketSchema
);
