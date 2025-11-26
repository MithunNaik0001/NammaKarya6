import { NextResponse } from 'next/server';
import { listOrders, deleteAllOrders } from '../../../lib/orders';

export async function GET() {
    try {
        const orders = await listOrders();
        return NextResponse.json(orders);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}

export async function DELETE() {
    try {
        await deleteAllOrders();
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}