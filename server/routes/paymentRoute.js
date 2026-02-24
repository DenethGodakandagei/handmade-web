import express from 'express';
import Stripe from 'stripe';
import { protect } from '../middleware/authMiddleware.js';

const router = express.Router();
const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;

/**
 * POST /api/v1/payment/create-payment-intent
 * Creates a Stripe PaymentIntent and returns the client_secret.
 * Body: { amount: number (in cents), currency: string }
 */
router.post('/create-payment-intent', protect, async (req, res) => {
    try {
        if (!stripe) {
            return res.status(503).json({ success: false, message: 'Stripe not configured on server.' });
        }
        const { amount, currency = 'usd' } = req.body;

        if (!amount || amount <= 0) {
            return res.status(400).json({ success: false, message: 'Invalid amount' });
        }

        const paymentIntent = await stripe.paymentIntents.create({
            amount: Math.round(amount * 100), // convert dollars to cents
            currency,
            automatic_payment_methods: { enabled: true },
        });

        res.status(200).json({
            success: true,
            clientSecret: paymentIntent.client_secret,
        });
    } catch (error) {
        console.error('Stripe error:', error.message);
        res.status(500).json({ success: false, message: error.message });
    }
});

export default router;
