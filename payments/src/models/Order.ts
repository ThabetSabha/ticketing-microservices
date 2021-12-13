import { OrderStatusEnum } from "@thabet-ticketing/common";
import mongoose from "mongoose";
import { updateIfCurrentPlugin } from "mongoose-update-if-current";

export { OrderStatusEnum };

export interface OrderAttrs {
    userId: string;
    status: OrderStatusEnum;
    price: number;
    id: string;
    version: number;
}

export interface OrderDoc extends mongoose.Document {
    userId: string;
    status: OrderStatusEnum;
    price: number;
    version: number;
}

interface OrderModel extends mongoose.Model<OrderDoc> {
    build(attrs: OrderAttrs): OrderDoc;
}

const orderSchema = new mongoose.Schema(
    {
        userId: {
            type: String,
            required: true,
        },
        status: {
            type: String,
            required: true,
            enum: Object.values(OrderStatusEnum),
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

orderSchema.set("versionKey", "version");
orderSchema.plugin(updateIfCurrentPlugin);
orderSchema.statics.build = (attrs: OrderAttrs) => {
    const { id, version, status, userId, price } = attrs;
    return new Order({
        _id: id,
        version,
        status,
        userId,
        price,
    });
};

export const Order = mongoose.model<OrderDoc, OrderModel>("Order", orderSchema);
