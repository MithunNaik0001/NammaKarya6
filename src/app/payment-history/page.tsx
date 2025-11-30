"use client";

import React, { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { MdPayment, MdCheckCircle, MdCancel, MdPending, MdDelete, MdInfo, MdClear } from 'react-icons/md';
import { FaGooglePay, FaPhoneSquare } from 'react-icons/fa';
import { SiPhonepe } from 'react-icons/si';
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

            // Build Google Pay UPI deep link
            const payeeName = 'NammaKarya';
            const upiId = upi.trim();
            const transactionNote = `Order ${orderId}`;

            // Google Pay specific deep link (tez:// protocol)
            const googlePayLink = `tez://upi/pay?pa=${encodeURIComponent(upiId)}&pn=${encodeURIComponent(payeeName)}&am=${amt}&cu=INR&tn=${encodeURIComponent(transactionNote)}`;

            setMessage('Opening Google Pay...');

            // Open Google Pay app
            window.location.href = googlePayLink;

            // Give some time for the Google Pay app to open, then start polling
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
            // Delete directly from Firestore on client side with proper authentication
            await deleteDoc(doc(db, 'orders', orderId));
            setMessage('Payment record deleted');
            await fetchOrders();
        } catch (err: any) {
            console.error('Error deleting order:', err);
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
                            style={{ background: '#3cbbe5ff', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}
                            onClick={clearAllHistory}
                        >
                            <MdClear size={18} />
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
                            <FaGooglePay className="pay-icon" style={{ color: '#4285F4', fontSize: 36 }} />
                            <span className="method-label">Google Pay</span>
                        </div>
                        <div className="payment-card phonepe-pay" title="PhonePe">
                            <SiPhonepe className="pay-icon" style={{ color: '#6A3AF7', fontSize: 36 }} />
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
                                            {o.status === 'paid' ? (
                                                <MdCheckCircle size={18} color="#34b37d" />
                                            ) : o.status === 'failed' ? (
                                                <MdCancel size={18} color="#e54c3c" />
                                            ) : (
                                                <MdPending size={18} color="#f4c444" />
                                            )}
                                            {o.status}
                                        </div>
                                    </td>
                                    <td>{fmtINR(o.amount)}</td>
                                    <td>{new Date(o.createdAt).toLocaleString()}</td>
                                    <td>{o.upi ?? ''}</td>
                                    <td>
                                        <div style={{ display: 'flex', gap: 8 }}>
                                            <button className="details-btn" style={{ display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => alert(JSON.stringify(o, null, 2))}>
                                                <MdInfo size={16} />
                                                Details
                                            </button>
                                            <button
                                                className="details-btn"
                                                style={{ background: '#3ce5c9ff', color: '#fff', display: 'flex', alignItems: 'center', gap: '6px' }}
                                                onClick={() => deleteOrder(o.id)}
                                            >
                                                <MdDelete size={16} />
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
                <div style={{ position: 'fixed', left: 0, top: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }} onClick={() => setShowForm(false)}>
                    <form onClick={(e) => e.stopPropagation()} onSubmit={handlePay} style={{ background: '#fff', padding: 24, borderRadius: 12, width: 360, boxShadow: '0 4px 20px rgba(0,0,0,0.15)' }}>
                        <h3 style={{ margin: '0 0 20px 0', fontSize: '1.3rem', color: '#333' }}>Pay with Google Pay</h3>

                        <label style={{ display: 'block', marginBottom: 16 }}>
                            <span style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#555' }}>UPI ID</span>
                            <input
                                type="text"
                                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: '0.95rem' }}
                                value={upi}
                                onChange={(e) => setUpi(e.target.value)}
                                placeholder="yourname@okaxis"
                                required
                            />
                        </label>

                        <label style={{ display: 'block', marginBottom: 20 }}>
                            <span style={{ display: 'block', marginBottom: 6, fontWeight: 500, color: '#555' }}>Amount (INR)</span>
                            <input
                                type="number"
                                style={{ width: '100%', padding: 10, border: '1px solid #ddd', borderRadius: 6, fontSize: '0.95rem' }}
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                placeholder="Enter amount"
                                min="1"
                                max="100000"
                                required
                            />
                        </label>

                        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
                            <button
                                type="button"
                                onClick={() => setShowForm(false)}
                                style={{ padding: '10px 20px', border: '1px solid #ddd', background: '#fff', borderRadius: 6, cursor: 'pointer', fontSize: '0.95rem' }}
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                style={{ padding: '10px 24px', background: '#34b37d', color: '#fff', border: 'none', borderRadius: 6, cursor: loading ? 'not-allowed' : 'pointer', fontSize: '0.95rem', fontWeight: 500 }}
                                disabled={loading}
                            >
                                {loading ? 'Opening Google Pay...' : 'Pay Now'}
                            </button>
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




