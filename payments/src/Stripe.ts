import Stripe from "stripe";

export const stripe = new Stripe(process.env.STRIPE_KEY!, {
    apiVersion: "2020-08-27",
});

// try {
//     const charge = await stripe.charges.create({
//         amount: order.price * 100,
//         currency: "usd",
//         source: token,
//     });
// } catch (e) {
//     throw new BadRequestError(
//         `Error while processing stripe payment: ${(e as Error).message}`
//     );
// }
