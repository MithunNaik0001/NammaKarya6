import { NextResponse } from 'next/server';
import { getOrder, deleteOrder } from '../../../../lib/orders';

export async function GET(req: Request, { params }: { params: { id: string } }) {
    try {
        // `params` can be an async object in Next.js dynamic APIs — await it
        const { id } = await params as { id: string };
        const order = await getOrder(id);
        if (!order) return NextResponse.json({ error: 'not found' }, { status: 404 });
        return NextResponse.json(order);
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}

export async function DELETE(req: Request, { params }: { params: { id: string } }) {
    try {
        const { id } = await params as { id: string };
        await deleteOrder(id);
        return NextResponse.json({ success: true });
    } catch (err: any) {
        console.error(err);
        return NextResponse.json({ error: String(err.message || err) }, { status: 500 });
    }
}