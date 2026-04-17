import Stripe from 'stripe';
import Offer from '../models/Offer.js';
import UserModel from '../models/User.js';
import sendWorkDoneEmail from '../utils/nodemailer.js';
import calculateTrustScore from './TrustController.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

// CREATE CHECKOUT SESSION
export const createCheckoutSession = async (req, res) => {
  try {
    console.log(req.body);
    const { offerId } = req.body;

    const offer = await Offer.findById(offerId);
    if (!offer) return res.status(404).json({ success: false });

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      mode: 'payment',

      line_items: [
        {
          price_data: {
            currency: 'bdt',
            product_data: {
              name: `${offer.category} - ${offer.tier}`
            },
            unit_amount: offer.totalPrice * 100, // paisa
          },
          quantity: 1,
        },
      ],

      success_url: `http://localhost:5173/payment-success?offerId=${offer._id}`,
      cancel_url: `http://localhost:5173/`,

      metadata: {
        offerId: offer._id.toString()
      }
    });

    res.json({ url: session.url });

  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false });
  }
};

// WEBHOOK
export const stripeWebhook = async (req, res) => {
  const sig = req.headers['stripe-signature'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
  console.error("❌ Webhook Error:", err.message);
  return res.status(400).send(`Webhook Error: ${err.message}`);
}

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const offerId = session.metadata.offerId;

    const offer = await Offer.findById(offerId);
    if (offer) {
      offer.status = 'Paid';

      const provider = await UserModel.findById(offer.providerId);

// Increment completed jobs
provider.completedJobs = (provider.completedJobs || 0) + 1;

await calculateTrustScore(provider);

const totalRating = allRatedOffers.reduce((sum, o) => sum + o.rating, 0);
provider.rating = totalRating / allRatedOffers.length;

await provider.save();

      await offer.save();

      const customer = await UserModel.findById(offer.customerId);

      await sendWorkDoneEmail(provider, customer, offer);
    }
  }

  res.json({ received: true });
};