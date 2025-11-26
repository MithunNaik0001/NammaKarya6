import { NextRequest, NextResponse } from 'next/server';
import { listOrders, deleteAllOrders } from '../../../lib/orders';

export async function GET(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        const orders = await listOrders(userId);
        return NextResponse.json(orders);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}

export async function DELETE(req: NextRequest) {
    try {
        const userId = req.headers.get('x-user-id');
        if (!userId) {
            return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
        }
        await deleteAllOrders(userId);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}