import Stripe from "stripe";
import crypto from "crypto";

/* Verifies a completed Checkout session and returns a signed license
   token. The app stores the token locally so the unlock survives
   going offline — which is the whole point in a crawlspace. */

function signToken(id, secret) {
  return crypto.createHmac("sha256", secret).update(id).digest("hex").slice(0, 32);
}

export default async function handler(req, res) {
  const key = process.env.STRIPE_SECRET_KEY;
  const secret = process.env.LICENSE_SECRET || key || "";

  if (!key) {
    return res.status(500).json({ error: "Stripe is not configured." });
  }

  const stripe = new Stripe(key);

  try {
    /* Path 1 — verify straight after checkout */
    const sessionId = req.query.session_id;
    if (sessionId) {
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status === "paid") {
        return res.status(200).json({
          paid: true,
          token: signToken(session.id, secret),
          email: session.customer_details?.email || null,
        });
      }
      return res.status(200).json({ paid: false, reason: "not_paid" });
    }

    /* Path 2 — restore a purchase on a new device, by email */
    const email = (req.query.email || "").trim().toLowerCase();
    if (email) {
      const sessions = await stripe.checkout.sessions.list({ limit: 100 });
      const match = sessions.data.find(
        (s) =>
          s.payment_status === "paid" &&
          (s.customer_details?.email || "").toLowerCase() === email
      );
      if (match) {
        return res.status(200).json({
          paid: true,
          token: signToken(match.id, secret),
          email,
        });
      }
      return res.status(200).json({ paid: false, reason: "no_purchase_found" });
    }

    return res.status(400).json({ error: "Provide session_id or email." });
  } catch (e) {
    return res.status(500).json({ error: e.message });
  }
}
