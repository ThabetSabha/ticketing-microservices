import mongoose from "mongoose";

interface PaymentAttrs {
    orderId: string;
    stripeChargeId: string;
}

interface PaymentDoc extends mongoose.Document {
    orderId: string;
    stripeChargeId: string;
}

interface PaymentModel extends mongoose.Model<PaymentDoc> {
    build(attrs: PaymentAttrs): PaymentDoc;
}
const paymentSchema = new mongoose.Schema(
    {
        orderId: {
            required: true,
            type: String,
        },
        stripeChargeId: {
            type: String,
            required: true,
        },
    },
    {
        toJSON: {
            transform(doc, ret) {
                ret.id = ret._id;
                delete ret._id;
                delete ret.__v;
            },
        },
    }
);

paymentSchema.statics.build = (attrs: PaymentAttrs) => {
    return new Payment(attrs);
};

export const Payment = mongoose.model<PaymentDoc, PaymentModel>(
    "Payment",
    paymentSchema
);
