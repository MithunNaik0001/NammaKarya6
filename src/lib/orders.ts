import { db } from './firebase';
import { collection, doc, setDoc, getDoc, getDocs, query, where, deleteDoc, updateDoc } from 'firebase/firestore';

const ORDERS_COLLECTION = 'orders';

export type Order = {
    id: string;
    upi?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed';
    paymentIntentId?: string;
    createdAt: string;
    userId: string;
    metadata?: Record<string, string>;
};

export async function createOrder(order: Omit<Order, 'createdAt' | 'status'>) {
    const id = order.id;
    const now = new Date().toISOString();
    const newOrder: Order = {
        ...order,
        id,
        createdAt: now,
        status: 'pending',
    };
    const docRef = doc(db, ORDERS_COLLECTION, id);
    await setDoc(docRef, newOrder);
    return newOrder;
}

export async function getOrder(id: string) {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
        return docSnap.data() as Order;
    }
    return null;
}

export async function listOrders(userId?: string) {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    let q;
    if (userId) {
        q = query(ordersCol, where('userId', '==', userId));
    } else {
        q = ordersCol;
    }
    const snapshot = await getDocs(q);
    const orders = snapshot.docs.map(doc => doc.data() as Order);
    // Sort on client side to avoid needing a Firestore index
    return orders.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function markOrderPaid(id: string, paymentIntentId?: string) {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    const updates: any = { status: 'paid' };
    if (paymentIntentId) updates.paymentIntentId = paymentIntentId;

    await updateDoc(docRef, updates);
    return { ...docSnap.data(), ...updates } as Order;
}

export async function markOrderFailed(id: string) {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return null;

    await updateDoc(docRef, { status: 'failed' });
    return { ...docSnap.data(), status: 'failed' } as Order;
}

export async function deleteOrder(id: string) {
    const docRef = doc(db, ORDERS_COLLECTION, id);
    const docSnap = await getDoc(docRef);
    if (!docSnap.exists()) return false;

    await deleteDoc(docRef);
    return true;
}

export async function deleteAllOrders(userId?: string) {
    const ordersCol = collection(db, ORDERS_COLLECTION);
    let q;
    if (userId) {
        q = query(ordersCol, where('userId', '==', userId));
    } else {
        q = query(ordersCol);
    }
    const snapshot = await getDocs(q);
    const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
    await Promise.all(deletePromises);
    return true;
}

export default { createOrder, getOrder, listOrders, markOrderPaid, markOrderFailed, deleteOrder, deleteAllOrders };