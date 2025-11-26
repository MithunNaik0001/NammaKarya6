"use client";

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { collection, query, where, getDocs, deleteDoc, doc, setDoc, getDoc } from 'firebase/firestore';

type Order = {
    id: string;
    upi?: string;
    amount: number;
    currency: string;
    status: 'pending' | 'paid' | 'failed';
    paymentIntentId?: string;
    createdAt: string;
};

export default function Page(): JSX.Element {
    const [showForm, setShowForm] = useState(false);
    const [upi, setUpi] = useState('');
    const [amount, setAmount] = useState('1');
    const [message, setMessage] = useState('');
    const [loading, setLoading] = useState(false);
    const [orders, setOrders] = useState<Order[]>([]);
    const [userId, setUserId] = useState<string | null>(null);
    const [authLoading, setAuthLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                setUserId(user.uid);
                fetchOrders(user.uid);
            } else {
                setUserId(null);
                setOrders([]);
            }
            setAuthLoading(false);
        });
        return () => unsubscribe();
    }, []);

    async function fetchOrders(uid?: string) {
        const userIdToUse = uid || userId;
        if (!userIdToUse) {
            console.log('No userId available, skipping fetch');
            return;
        }

        try {
            // Ensure user is authenticated
            const currentUser = auth.currentUser;
            if (!currentUser) {
                console.log('User not authenticated, skipping fetch');
                setOrders([]);
                return;
            }

            // Query Firestore directly from client with proper authentication
            const ordersCol = collection(db, 'orders');
            const q = query(ordersCol, where('userId', '==', userIdToUse));
            const snapshot = await getDocs(q);
            const ordersData = snapshot.docs.map(doc => doc.data() as Order);
            // Sort by createdAt descending
            ordersData.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
            setOrders(ordersData);
        } catch (err: any) {
            console.error('Failed to fetch orders:', err);
            if (err.code === 'permission-denied') {
                console.error('Permission denied - check Firestore rules and authentication');
            }
            setOrders([]);
        }
    }

    const fmtINR = (value: number) =>
        new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR' }).format(value);

    async function handlePay(e?: React.FormEvent) {
        if (e) e.preventDefault();
        setMessage('');
        if (!userId) return setMessage('Please sign in to make a payment');
        if (!upi) return setMessage('Enter UPI ID');
        const amt = Number(amount);
        if (amt < 1) return setMessage('Amount must be at least ₹1');
        if (amt > 100000) return setMessage('Amount exceeds UPI limit. Maximum ₹1,00,000 per transaction');

        setLoading(true);
        try {
            setMessage('Creating payment...');

            // Create order ID
            const orderId = `ord_${Date.now()}${Math.random().toString(36).substr(2, 9)}`;
            const now = new Date().toISOString();

            // Create order directly in Firestore from client
            const orderData = {
                id: orderId,
                upi: upi.trim(),
                amount: amt,
                currency: 'INR',
                status: 'pending' as const,
                userId: userId,
                createdAt: now,
            };

            await setDoc(doc(db, 'orders', orderId), orderData);

            // Build UPI deep link
            const payeeName = 'mams';
            const upiDeepLink = `upi://pay?pa=${encodeURIComponent(upi.trim())}&pn=${encodeURIComponent(payeeName)}&am=${amt}&cu=INR&tn=Order ${orderId}`;

            setMessage('Opening UPI app...');

            // Try to open UPI app directly
            window.location.href = upiDeepLink;

            // Give some time for the UPI app to open, then start polling
            setTimeout(() => {
                pollStatus(orderId);
                setShowForm(false);
            }, 1000);
        } catch (err: any) {
            console.error('Error creating payment:', err);
            setMessage(String(err?.message || err));
            setLoading(false);
        }
    }

    async function pollStatus(orderId: string) {
        const start = Date.now();
        const timeout = 1000 * 60 * 5; // 5 minutes
        const tick = async () => {
            try {
                // Check order status directly from Firestore
                const orderDoc = await getDoc(doc(db, 'orders', orderId));
                if (orderDoc.exists()) {
                    const orderData = orderDoc.data();
                    if (orderData.status === 'paid') {
                        setMessage('Payment successful — updating history');
                        setLoading(false);
                        await fetchOrders();
                        return;
                    }
                }
            } catch (err) {
                console.error('Error polling status:', err);
            }
            if (Date.now() - start > timeout) {
                setMessage('Timed out waiting for payment confirmation');
                setLoading(false);
                return;
            }
            setTimeout(tick, 3000);
        };
        tick();
    }

    async function deleteOrder(orderId: string) {
        if (!userId) return;
        if (!confirm('Delete this payment record?')) return;

        try {
            const res = await fetch(`/api/order/${orderId}`, {
                method: 'DELETE',
            });

            if (res.ok) {
                setMessage('Payment record deleted');
                await fetchOrders();
            } else {
                const data = await res.json();
                setMessage(data.error || 'Failed to delete');
            }
        } catch (err: any) {
            setMessage(String(err?.message || err));
        }
    }

    async function clearAllHistory() {
        if (!userId) return;
        if (!confirm('Delete ALL payment history? This cannot be undone.')) return;

        try {
            setMessage('Deleting all records...');

            // Delete directly from Firestore on client side
            const ordersCol = collection(db, 'orders');
            const q = query(ordersCol, where('userId', '==', userId));
            const snapshot = await getDocs(q);

            const deletePromises = snapshot.docs.map(doc => deleteDoc(doc.ref));
            await Promise.all(deletePromises);

            setMessage('All payment history cleared');
            setOrders([]);
        } catch (err: any) {
            console.error('Error clearing history:', err);
            setMessage(String(err?.message || err));
        }
    }

    if (authLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                <div className="dashboard-container">
                    <p>Loading...</p>
                </div>
            </div>
        );
    }

    if (!userId) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
                <div className="dashboard-container">
                    <h1>Payment History</h1>
                    <p style={{ textAlign: 'center', marginTop: 20 }}>
                        Please <a href="/login" style={{ color: '#3cbbe5ff', textDecoration: 'underline' }}>sign in</a> to view your payment history.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <div className="dashboard-container">
                <h1>Payments history</h1>
                {orders.length > 0 && (
                    <div style={{ marginBottom: 20, textAlign: 'right' }}>
                        <button
                            className="details-btn"
                            style={{ background: '#3cbbe5ff', color: '#fff' }}
                            onClick={clearAllHistory}
                        >
                            Clear All History
                        </button>
                    </div>
                )}

                <div className="make-payment-section">
                    <div className="payment-header">
                        <h2>Make payment</h2>
                        <a href="#">Show other payment methods</a>
                    </div>
                    <div className="payment-methods">
                        <div className="payment-card">
                            <span className="logo-text paypal">PayPal</span>
                        </div>
                        <div className="payment-card">
                            <div className="mastercard">Mastercard</div>
                        </div>
                        <div className="payment-card google-pay" title="Google Pay" onClick={() => setShowForm(true)}>
                            <svg className="pay-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <path fill="#4285F4" d="M24 12c3 0 5.5 1.2 7.4 3.2l3.8-3.8C33.5 8 28.9 6 24 6 15.6 6 8.7 10.8 5 18l4 3.1C11.4 14.6 17 12 24 12z" />
                                <path fill="#34A853" d="M6.6 20.9A18 18 0 0 0 6 24c0 1.5.2 3 .6 4.4L11 29.3C10.6 27.8 10.4 26 10.4 24c0-1.1.1-2.2.2-3.3l-4-0.8z" />
                                <path fill="#FBBC05" d="M24 42c5 0 9.3-1.8 12.7-4.8l-5.2-4.1C30.3 35 27.3 36 24 36c-6.9 0-12.5-2.6-14.9-7.1L6 31c3.6 6.9 10.9 11 18 11z" />
                                <path fill="#EA4335" d="M41.4 16.1H24v7h10.3c-.9 2.4-2.9 4.3-5.4 5.3l5.2 4.1C40.9 33.6 44 29.3 44 24c0-1.5-.2-3-.6-4.4l-2 0.5z" />
                            </svg>
                            <span className="method-label">Google Pay</span>
                        </div>
                        <div className="payment-card phonepe-pay" title="PhonePe">
                            <svg className="pay-icon" viewBox="0 0 48 48" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                                <defs>
                                    <linearGradient id="ppGrad" x1="0" x2="1" y1="0" y2="1">
                                        <stop offset="0" stopColor="#6A3AF7" />
                                        <stop offset="1" stopColor="#8B5CFF" />
                                    </linearGradient>
                                </defs>
                                <rect rx="8" width="48" height="48" fill="url(#ppGrad)" />
                                <path d="M30 16c-2 0-3.5 1.4-3.8 3.2-.2 1.1.2 2.2 1.1 2.9 1 .8 2.5 1.2 3.7 1.8 2.4 1.2 3.8 3 3.8 5.1 0 3.3-2.8 5.5-6.3 5.5-3.1 0-5.5-1.6-6.5-3.4l3-1.9c.7 1 2 1.9 3.6 1.9 1.6 0 2.7-.8 2.7-1.9 0-1-.6-1.6-2.1-2.3-1.4-.6-3.6-1.2-4.8-2.1-1.6-1.2-2.4-2.7-2.4-4.6 0-3.2 2.8-5 5.8-5 2.2 0 4.1.8 5.1 2.1l-2.9 1.9c-.6-0.7-1.6-1.3-2.9-1.3z" fill="#fff" />
                            </svg>
                            <span className="method-label">PhonePe</span>
                        </div>
                    </div>
                </div>

                <table className="payments-table">
                    <thead>
                        <tr>
                            <th style={{ width: '10%' }}>Status</th>
                            <th style={{ width: '15%' }}>Amount</th>
                            <th style={{ width: '20%' }}>Date</th>
                            <th style={{ width: '35%' }}>Description</th>
                            <th style={{ width: '20%' }}>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {orders.length === 0 ? (
                            <tr>
                                <td colSpan={5} style={{ textAlign: 'center', color: '#666', padding: '18px 0' }}>No payment history available</td>
                            </tr>
                        ) : (
                            orders.map((o) => (
                                <tr key={o.id} className={o.status === 'pending' ? 'on-hold-row' : ''}>
                                    <td>
                                        <div className="status">
                                            <span className={`status-dot ${o.status === 'paid' ? 'dot-proceed' : o.status === 'failed' ? 'dot-canceled' : 'dot-on-hold'}`} />
                                            {o.status}
                                        </div>
                                    </td>
                                    <td>{fmtINR(o.amount / 100)}</td>
                                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                                    <td>{o.upi ?? ''}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="details-btn" onClick={() => alert(JSON.stringify(o, null, 2))}>Details</button>
                                            <button
                                                className="details-btn"
                                                style={{ background: '#3ce5c9ff', color: '#fff' }}
                                                onClick={() => deleteOrder(o.id)}
                                            >
                                                Delete
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>

                <div style={{ marginTop: 12, color: '#444' }}>{message}</div>
            </div>

            {showForm && (
                <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={() => setShowForm(false)}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handlePay} style={{ background: '#fff', padding: 20, borderRadius: 8, width: 320 }}>
                        <h3>Pay with Google Pay</h3>
                        <label style={{ display: 'block', marginBottom: 8 }}>UPI ID
                            <input style={{ width: '100%', padding: 8, marginTop: 6 }} value={upi} onChange={(e) => setUpi(e.target.value)} placeholder="example@okaxis" />
                        </label>
                        <label style={{ display: 'block', marginBottom: 8 }}>Amount (INR)
                            <input style={{ width: '100%', padding: 8, marginTop: 6 }} value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} />
                        </label>
                        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                            <button type="button" onClick={() => setShowForm(false)} className="details-btn">Cancel</button>
                            <button type="submit" className="details-btn" style={{ background: '#34b37d', color: '#fff' }} disabled={loading}>{loading ? 'Opening...' : 'Pay'}</button>
                        </div>
                    </form>
                </div>
            )}

            <style>{`
        /* --- General Setup --- */
        .dashboard-container {
            width: 100%;
            max-width: 1000px;
            background-color: #ffffff;
            border-radius: 10px;
            box-shadow: 0 4px 10px rgba(0, 0, 0, 0.05);
            padding: 30px;
        }

        h1 {
            font-size: 1.5rem;
            font-weight: 500;
            color: #333;
            margin-top: 0;
            margin-bottom: 30px;
        }

        /* --- Make Payment Section --- */
        .make-payment-section {
            background-color: #f9f9fb;
            padding: 20px;
            border-radius: 8px;
            margin-bottom: 30px;
        }

        .payment-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }

        .payment-header h2 { font-size: 1.2rem; font-weight: 500; color: #555; margin: 0; }
        .payment-header a { color: #007bff; text-decoration: none; font-size: 0.9rem; }

        .payment-methods { display: flex; gap: 15px; }

        .pay-icon { width: 36px; height: 36px; display:inline-block; vertical-align:middle; }
        .payment-card .method-label { margin-left:10px; font-weight:700; }

        .payment-card {
            flex: 1;
            background-color: #ffffff;
            border: 1px solid #e0e0e0;
            border-radius: 8px;
            padding: 20px 10px;
            height: 60px;
            display: flex;
            justify-content: center;
            align-items: center;
            cursor: pointer;
            transition: box-shadow 0.2s;
        }

        .payment-card:hover { box-shadow: 0 4px 8px rgba(0,0,0,0.1); }

        .logo-text { font-size: 1.5rem; font-weight: 700; }
        .paypal { color: #003087; }
        .mastercard { font-size: 0; position: relative; width: 60px; height: 40px; }
        .mastercard::before, .mastercard::after { content: ''; position: absolute; width: 40px; height: 40px; border-radius: 50%; top: 0; }
        .mastercard::before { background-color: #eb001b; left: 0; z-index: 1; }
        .mastercard::after { background-color: #ff5f00; right: 0; mix-blend-mode: multiply; z-index: 2; }

        .amazon-pay img { height: 30px; }
        .apple-pay img { height: 35px; }

        /* --- Alerts / status --- */
        .details-btn { background-color: #eef3f7; color: #4a5a6a; border: none; padding: 8px 15px; border-radius: 5px; cursor: pointer; font-size: 0.85rem; transition: background-color 0.2s; }
        .details-btn:hover { background-color: #dde8f0; }

        /* --- Payments History Table --- */
        .payments-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; text-align: left; margin-top: 20px }
        .payments-table thead { background-color: #eef3f7; color: #555; font-weight: 500; }
        .payments-table th, .payments-table td { padding: 12px 15px; border-bottom: 1px solid #eef3f7; }
        .payments-table tr:nth-child(even) { background-color: #fcfcfc; }
        .payments-table tr:hover { background-color: #f7f9fa; }
        .payments-table tr.on-hold-row { background-color: #eaf4ff; }

        .status { display:flex; align-items:center; gap:10px; font-weight:500; }
        .status-dot { width:8px; height:8px; border-radius:50%; display:inline-block; }
        .dot-canceled { background-color: #e54c3c; }
        .dot-proceed { background-color: #34b37d; }
        .dot-on-hold { background-color: #f4c444; }
      `}</style>
        </div>
    );
}




