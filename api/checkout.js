import Stripe from "stripe";

/* Creates a Stripe Checkout session for the one-time unlock.
   Runs on Vercel as a serverless function — the secret key never
   reaches the browser. */
export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const key = process.env.STRIPE_SECRET_KEY;
  const price = process.env.STRIPE_PRICE_ID;

  if (!key || !price) {
    return res.status(500).json({
      error: "Stripe is not configured. Set STRIPE_SECRET_KEY and STRIPE_PRICE_ID in Vercel.",
    });
  }

  try {
    const stripe = new Stripe(key);
    const origin =
      req.headers.origin ||
      (req.headers.host ? `https://${req.headers.host}` : "");

    const session = await stripe.checkout.sessions.create({
      mode: "payment",
      line_items: [{ price, quantity: 1 }],
      success_url: `${origin}/?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?checkout=cancelled`,
      // Collect email so a purchase can be restored on a new phone
      customer_creation: "always",
      allow_promotion_codes: true,
    });

    return res.status(200).json({ url: session.url });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
