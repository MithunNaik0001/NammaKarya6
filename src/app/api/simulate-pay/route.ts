import { NextResponse } from 'next/server';
import { getOrder, markOrderPaid } from '../../../lib/orders';

// Dev-only endpoint to simulate a successful payment for an order.
// Enable by setting `ALLOW_SIMULATE=true` in `.env.local` (or run in non-production).
export async function POST(req: Request) {
    const allowSimulate = process.env.ALLOW_SIMULATE === 'true' || process.env.NODE_ENV !== 'production';
    if (!allowSimulate) {
        return NextResponse.json({ error: 'Simulate endpoint not allowed' }, { status: 403 });
    }

    try {
        const body = await req.json();
        const orderId = body?.orderId as string | undefined;
        if (!orderId) {
            return NextResponse.json({ error: 'orderId required' }, { status: 400 });
        }

        const order = await getOrder(orderId);
        if (!order) return NextResponse.json({ error: 'order not found' }, { status: 404 });

        await markOrderPaid(orderId, 'simulated');
        return NextResponse.json({ ok: true, orderId });
    } catch (err: any) {
        console.error('simulate-pay error', err);
        return NextResponse.json({ error: String(err?.message || err) }, { status: 500 });
    }
}