import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createOrder } from '../../../lib/orders';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const upi: string = (body.upi || '').trim();
        const amount = Number(body.amount) || 1; // INR
        const amountPaise = Math.round(amount * 100);

        // Get userId from request header (sent from client)
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }

        // UPI transaction limits (per transaction):
        // Most banks: ₹1,00,000 per transaction
        // Some banks (like SBI, ICICI): ₹1,00,000
        // Google Pay/PhonePe: ₹1,00,000 per transaction
        // To be safe, enforce a ₹1,00,000 limit
        const MAX_UPI_AMOUNT = 100000; // ₹1 lakh

        if (amount < 1) {
            return NextResponse.json(
                { error: 'Amount must be at least ₹1' },
                { status: 400 }
            );
        }

        if (amount > MAX_UPI_AMOUNT) {
            return NextResponse.json(
                { error: `Amount exceeds UPI limit. Maximum ₹${MAX_UPI_AMOUNT.toLocaleString('en-IN')} per transaction` },
                { status: 400 }
            );
        }

        if (!upi) {
            return NextResponse.json({ error: 'UPI ID required' }, { status: 400 });
        }

        const orderId = `ord_${Date.now()}`;

        // Create a Stripe PaymentIntent for record-keeping. Upstream UPI deep-link flow
        // may be completed outside Stripe; webhooks from Stripe (if used) will mark paid.
        // Create a PaymentIntent without forcing a specific payment method type.
        // Some Stripe accounts may not have UPI enabled and specifying
        // `payment_method_types: ['upi']` will cause an error. Omitting the
        // field lets Stripe decide available methods for the account.
        const pi = await stripe.paymentIntents.create({
            amount: amountPaise,
            currency: 'inr',
            description: `UPI payment for ${orderId}`,
            metadata: { orderId, upi },
            // do not confirm here; we use the deep-link flow
        });

        await createOrder({ id: orderId, upi, amount: amountPaise, currency: 'INR', paymentIntentId: pi.id, userId });

        // Build a UPI deep link which Android devices (Google Pay, PhonePe, etc.) will open.
        // Standard UPI parameters:
        // pa = payee address (VPA)
        // pn = payee name
        // am = amount
        // cu = currency
        // tn = transaction note/order ID
        const payeeName = 'NammaKarya';
        const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent(payeeName)}&am=${amount}&cu=INR&tn=${encodeURIComponent(`Order ${orderId}`)}`;

        return NextResponse.json({ orderId, paymentIntentId: pi.id, upiDeepLink });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}