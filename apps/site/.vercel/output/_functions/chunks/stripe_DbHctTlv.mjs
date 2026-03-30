import Stripe from 'stripe';

const stripe = new Stripe("", {
  apiVersion: "2025-04-30.basil"
});
const PLANS = {
  pro: {
    name: "Pro",
    price: 7900,
    // cents
    priceId: ""
  },
  business: {
    name: "Business",
    price: 19900,
    // cents
    priceId: ""
  }
};

export { PLANS as P, stripe as s };
