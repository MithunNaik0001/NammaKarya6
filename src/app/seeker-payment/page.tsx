"use client";

import React, { useEffect, useState } from "react";
import { db, auth } from "../../lib/firebase";
import { collection, query, where, getDocs } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SeekerSidebar from "../../components/SeekerSidebar";

type Payment = {
    id: string;
    transactionId: string;
    date: string;
    description: string;
    paymentMethod: string;
    amount: number;
    status: 'completed' | 'pending' | 'failed' | 'refunded';
    userId: string;
};

export default function SeekerPaymentPage() {
    const [user, setUser] = useState<any>(null);
    const [payments, setPayments] = useState<Payment[]>([]);
    const [filteredPayments, setFilteredPayments] = useState<Payment[]>([]);
    const [loading, setLoading] = useState(true);

    // Filter state
    const [statusFilter, setStatusFilter] = useState("all");
    const [dateFrom, setDateFrom] = useState("");
    const [dateTo, setDateTo] = useState("");

    // Summary state
    const [totalSpent, setTotalSpent] = useState(0);
    const [pendingAmount, setPendingAmount] = useState(0);
    const [completedCount, setCompletedCount] = useState(0);
    const [thisMonthAmount, setThisMonthAmount] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await loadPayments(currentUser.uid);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    async function loadPayments(userId: string) {
        try {
            const paymentsRef = collection(db, "payments");
            const q = query(paymentsRef, where("userId", "==", userId));
            const snapshot = await getDocs(q);

            const paymentsData: Payment[] = snapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            } as Payment));

            setPayments(paymentsData);
            setFilteredPayments(paymentsData);
            calculateSummary(paymentsData);
        } catch (error) {
            console.error("Error loading payments:", error);
        } finally {
            setLoading(false);
        }
    }

    function calculateSummary(paymentsData: Payment[]) {
        const total = paymentsData.reduce((sum, p) => sum + p.amount, 0);
        const pending = paymentsData.filter(p => p.status === 'pending').reduce((sum, p) => sum + p.amount, 0);
        const completed = paymentsData.filter(p => p.status === 'completed').length;

        const now = new Date();
        const thisMonth = paymentsData.filter(p => {
            const paymentDate = new Date(p.date);
            return paymentDate.getMonth() === now.getMonth() && paymentDate.getFullYear() === now.getFullYear();
        }).reduce((sum, p) => sum + p.amount, 0);

        setTotalSpent(total);
        setPendingAmount(pending);
        setCompletedCount(completed);
        setThisMonthAmount(thisMonth);
    }

    function applyFilters() {
        let filtered = [...payments];

        if (statusFilter !== "all") {
            filtered = filtered.filter(p => p.status === statusFilter);
        }

        if (dateFrom) {
            filtered = filtered.filter(p => new Date(p.date) >= new Date(dateFrom));
        }

        if (dateTo) {
            filtered = filtered.filter(p => new Date(p.date) <= new Date(dateTo));
        }

        setFilteredPayments(filtered);
    }

    function resetFilters() {
        setStatusFilter("all");
        setDateFrom("");
        setDateTo("");
        setFilteredPayments(payments);
    }

    function getStatusClass(status: string) {
        switch (status) {
            case 'completed': return 'status-completed';
            case 'pending': return 'status-pending';
            case 'failed': return 'status-failed';
            case 'refunded': return 'status-refunded';
            default: return '';
        }
    }

    if (loading) {
        return (
            <div style={{ padding: "50px", textAlign: "center" }}>
                <h2>Loading payment history...</h2>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{ padding: "50px", textAlign: "center" }}>
                <h2>Please sign in to view your payment history</h2>
            </div>
        );
    }

    return (
        <>
            <style>{`
                :root{--color-primary:#34d399;--color-secondary:#0f172a;--color-bg-light:#f8fafc;--color-card-bg:#ffffff;--color-text-subtle:#64748b;--color-gray-border:#e2e8f0}
                *{box-sizing:border-box;margin:0;padding:0}
                body{font-family:'Roboto',sans-serif;background-color:#f4f7f9}
                
                .dashboard-container{display:grid;grid-template-columns:250px 1fr;min-height:100vh}
                .sidebar{background-color:var(--color-card-bg);padding:20px;border-right:1px solid var(--color-gray-border);display:flex;flex-direction:column}
                .logo{font-size:1.5rem;font-weight:700;margin-bottom:30px;color:var(--color-secondary);display:flex;align-items:center}
                .logo-dot{width:10px;height:10px;background-color:var(--color-primary);border-radius:50%;margin-right:5px}
                .user-profile{display:flex;align-items:center;margin-bottom:30px}
                .user-profile img{width:45px;height:45px;border-radius:50%;margin-right:10px}
                .user-profile-info span{display:block;font-size:.9rem;color:var(--color-text-subtle)}
                .nav-link{display:flex;align-items:center;padding:12px 15px;margin:5px 0;border-radius:8px;color:var(--color-secondary);text-decoration:none;transition:background-color .2s}
                .nav-link:hover{background-color:var(--color-bg-light)}
                .nav-link.active{background-color:var(--color-primary);color:white;font-weight:600}
                .nav-icon{margin-right:15px;font-size:1.1rem;color:var(--color-text-subtle);width:20px;text-align:center}
                .logout{margin-top:20px;color:var(--color-text-subtle);text-decoration:none;display:flex;align-items:center;font-size:.9rem}

                .main-content{padding:20px;background-color:#f4f7f9}
                .container{max-width:1200px;margin:0 auto;background-color:#ffffff;border-radius:10px;box-shadow:0 4px 15px rgba(0,0,0,0.08);padding:30px}
                .page-header{margin-bottom:30px;border-bottom:2px solid #eef3f7;padding-bottom:20px}
                .page-header h1{font-size:2rem;font-weight:700;color:#333;margin-bottom:10px}
                .page-header p{color:#666;font-size:0.95rem}
                
                .filter-section{display:flex;gap:15px;margin-bottom:25px;flex-wrap:wrap;align-items:center}
                .filter-section label{font-weight:500;color:#555;margin-right:5px}
                .filter-section select,.filter-section input[type="date"]{padding:8px 12px;border:1px solid #ddd;border-radius:5px;font-size:0.9rem;color:#333}
                .filter-section button{padding:8px 20px;background-color:#007bff;color:white;border:none;border-radius:5px;font-size:0.9rem;cursor:pointer;transition:background-color 0.2s}
                .filter-section button:hover{background-color:#0056b3}
                .filter-section button.reset{background-color:#6c757d}
                .filter-section button.reset:hover{background-color:#545b62}
                
                .summary-cards{display:grid;grid-template-columns:repeat(auto-fit,minmax(200px,1fr));gap:15px;margin-bottom:30px}
                .summary-card{background:linear-gradient(135deg,#667eea 0%,#764ba2 100%);padding:20px;border-radius:8px;color:white}
                .summary-card:nth-child(2){background:linear-gradient(135deg,#f093fb 0%,#f5576c 100%)}
                .summary-card:nth-child(3){background:linear-gradient(135deg,#4facfe 0%,#00f2fe 100%)}
                .summary-card:nth-child(4){background:linear-gradient(135deg,#43e97b 0%,#38f9d7 100%)}
                .summary-card h3{font-size:0.9rem;font-weight:400;margin-bottom:8px;opacity:0.9}
                .summary-card .amount{font-size:1.8rem;font-weight:700}
                
                .table-wrapper{overflow-x:auto}
                .payment-table{width:100%;border-collapse:collapse;font-size:0.9rem}
                .payment-table thead{background-color:#eef3f7}
                .payment-table th{padding:15px;text-align:left;font-weight:500;color:#555;border-bottom:2px solid #ddd}
                .payment-table td{padding:15px;border-bottom:1px solid #eef3f7;color:#333}
                .payment-table tbody tr:hover{background-color:#f7f9fa}
                
                .status-badge{display:inline-block;padding:5px 12px;border-radius:15px;font-size:0.85rem;font-weight:500}
                .status-completed{background-color:#d4edda;color:#155724}
                .status-pending{background-color:#fff3cd;color:#856404}
                .status-failed{background-color:#f8d7da;color:#721c24}
                .status-refunded{background-color:#d1ecf1;color:#0c5460}
                
                .action-btn{padding:6px 12px;background-color:#007bff;color:white;border:none;border-radius:4px;font-size:0.85rem;cursor:pointer;transition:background-color 0.2s}
                .action-btn:hover{background-color:#0056b3}
                
                .no-records{text-align:center;padding:40px;color:#666;font-size:1.1rem}
                
                @media (max-width:768px){
                    .summary-cards{grid-template-columns:1fr}
                    .filter-section{flex-direction:column;align-items:stretch}
                    .payment-table{font-size:0.85rem}
                    .payment-table th,.payment-table td{padding:10px}
                }
            `}</style>

            <div className="dashboard-container">
                <SeekerSidebar activePage="payment" />

                {/* Main Content */}
                <div className="main-content">
                    <div className="container">
                        <div className="page-header">
                            <h1>Payment History</h1>
                            <p>Track all your job application and service payments</p>
                        </div>

                        {/* Summary Cards */}
                        <div className="summary-cards">
                            <div className="summary-card">
                                <h3>Total Spent</h3>
                                <div className="amount">₹{totalSpent.toFixed(2)}</div>
                            </div>
                            <div className="summary-card">
                                <h3>Pending Payments</h3>
                                <div className="amount">₹{pendingAmount.toFixed(2)}</div>
                            </div>
                            <div className="summary-card">
                                <h3>Completed</h3>
                                <div className="amount">{completedCount}</div>
                            </div>
                            <div className="summary-card">
                                <h3>This Month</h3>
                                <div className="amount">₹{thisMonthAmount.toFixed(2)}</div>
                            </div>
                        </div>

                        {/* Filters */}
                        <div className="filter-section">
                            <div>
                                <label htmlFor="statusFilter">Status:</label>
                                <select
                                    id="statusFilter"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="completed">Completed</option>
                                    <option value="pending">Pending</option>
                                    <option value="failed">Failed</option>
                                    <option value="refunded">Refunded</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dateFrom">From:</label>
                                <input
                                    type="date"
                                    id="dateFrom"
                                    value={dateFrom}
                                    onChange={(e) => setDateFrom(e.target.value)}
                                />
                            </div>
                            <div>
                                <label htmlFor="dateTo">To:</label>
                                <input
                                    type="date"
                                    id="dateTo"
                                    value={dateTo}
                                    onChange={(e) => setDateTo(e.target.value)}
                                />
                            </div>
                            <button onClick={applyFilters}>Apply Filters</button>
                            <button onClick={resetFilters} className="reset">Reset</button>
                        </div>

                        {/* Payment History Table */}
                        <div className="table-wrapper">
                            <table className="payment-table">
                                <thead>
                                    <tr>
                                        <th>Transaction ID</th>
                                        <th>Date</th>
                                        <th>Description</th>
                                        <th>Payment Method</th>
                                        <th>Amount</th>
                                        <th>Status</th>
                                        <th>Action</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredPayments.length === 0 ? (
                                        <tr>
                                            <td colSpan={7} className="no-records">
                                                No payment history available
                                            </td>
                                        </tr>
                                    ) : (
                                        filteredPayments.map((payment) => (
                                            <tr key={payment.id}>
                                                <td>{payment.transactionId}</td>
                                                <td>{new Date(payment.date).toLocaleDateString()}</td>
                                                <td>{payment.description}</td>
                                                <td>{payment.paymentMethod}</td>
                                                <td>₹{payment.amount.toFixed(2)}</td>
                                                <td>
                                                    <span className={`status-badge ${getStatusClass(payment.status)}`}>
                                                        {payment.status.charAt(0).toUpperCase() + payment.status.slice(1)}
                                                    </span>
                                                </td>
                                                <td>
                                                    <button
                                                        className="action-btn"
                                                        onClick={() => alert(`Viewing details for ${payment.transactionId}`)}
                                                    >
                                                        View
                                                    </button>
                                                </td>
                                            </tr>
                                        ))
                                    )}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
