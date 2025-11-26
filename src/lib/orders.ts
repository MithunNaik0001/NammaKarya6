import fs from 'fs/promises';
import path from 'path';

const DATA_FILE = path.join(process.cwd(), 'payments.json');

type Order = {
    id: string;
    upi?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed';
    paymentIntentId?: string;
    createdAt: string;
    metadata?: Record<string, string>;
};

async function readStore(): Promise<Record<string, Order>> {
    try {
        const raw = await fs.readFile(DATA_FILE, 'utf8');
        return JSON.parse(raw || '{}');
    } catch (err: any) {
        if (err.code === 'ENOENT') {
            return {};
        }
        throw err;
    }
}

async function writeStore(store: Record<string, Order>) {
    await fs.writeFile(DATA_FILE, JSON.stringify(store, null, 2), 'utf8');
}

export async function createOrder(order: Omit<Order, 'createdAt' | 'status'>) {
    const store = await readStore();
    const id = order.id;
    const now = new Date().toISOString();
    const newOrder: Order = {
        ...order,
        id,
        createdAt: now,
        status: 'pending',
    };
    store[id] = newOrder;
    await writeStore(store);
    return newOrder;
}

export async function getOrder(id: string) {
    const store = await readStore();
    return store[id] ?? null;
}

export async function listOrders() {
    const store = await readStore();
    return Object.values(store).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function markOrderPaid(id: string, paymentIntentId?: string) {
    const store = await readStore();
    const order = store[id];
    if (!order) return null;
    order.status = 'paid';
    if (paymentIntentId) order.paymentIntentId = paymentIntentId;
    await writeStore(store);
    return order;
}

export async function markOrderFailed(id: string) {
    const store = await readStore();
    const order = store[id];
    if (!order) return null;
    order.status = 'failed';
    await writeStore(store);
    return order;
}

export async function deleteOrder(id: string) {
    const store = await readStore();
    if (!store[id]) return false;
    delete store[id];
    await writeStore(store);
    return true;
}

export async function deleteAllOrders() {
    await writeStore({});
    return true;
}

export default { createOrder, getOrder, listOrders, markOrderPaid, markOrderFailed, deleteOrder, deleteAllOrders };