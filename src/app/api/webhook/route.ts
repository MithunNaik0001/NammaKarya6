import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { markOrderPaid } from '../../../lib/orders';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '');

export async function POST(req: Request) {
    const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
    const sig = req.headers.get('stripe-signature') || '';
    const payload = await req.text();

    try {
        let event: Stripe.Event;
        if (webhookSecret) {
            event = stripe.webhooks.constructEvent(payload, sig, webhookSecret);
        } else {
            // If no webhook secret configured, try to parse body directly (development only)
            event = JSON.parse(payload);
        }

        if (event.type === 'payment_intent.succeeded') {
            const pi = event.data.object as Stripe.PaymentIntent;
            const orderId = pi.metadata?.orderId as string | undefined;
            if (orderId) {
                await markOrderPaid(orderId, pi.id);
                console.log(`Order ${orderId} marked paid via webhook (PI ${pi.id})`);
            }
        }

        return NextResponse.json({ received: true });
    } catch (err: any) {
        console.error('Webhook error', err.message || err);
        return NextResponse.json({ error: err.message || String(err) }, { status: 400 });
    }
}