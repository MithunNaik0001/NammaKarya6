"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs, orderBy, doc, updateDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

type Notification = {
    id: string;
    recipientId: string;
    senderId: string;
    type: string;
    title: string;
    message: string;
    jobId?: string;
    jobTitle?: string;
    read: boolean;
    createdAt: any;
};

export default function NotificationsPage() {
    const [notifications, setNotifications] = useState<Notification[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<"all" | "unread">("all");

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadNotifications(user.uid);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    async function loadNotifications(userId: string) {
        try {
            setLoading(true);
            const q = query(
                collection(db, "notifications"),
                where("recipientId", "==", userId),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const notifs: Notification[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                notifs.push({
                    id: doc.id,
                    recipientId: data.recipientId || "",
                    senderId: data.senderId || "",
                    type: data.type || "",
                    title: data.title || "",
                    message: data.message || "",
                    jobId: data.jobId,
                    jobTitle: data.jobTitle,
                    read: data.read || false,
                    createdAt: data.createdAt,
                });
            });

            setNotifications(notifs);
        } catch (error) {
            console.error("Error loading notifications:", error);
        } finally {
            setLoading(false);
        }
    }

    async function markAsRead(notificationId: string) {
        try {
            await updateDoc(doc(db, "notifications", notificationId), {
                read: true,
            });

            setNotifications(prev =>
                prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
            );
        } catch (error) {
            console.error("Error marking notification as read:", error);
        }
    }

    async function markAllAsRead() {
        try {
            const unreadNotifs = notifications.filter(n => !n.read);
            await Promise.all(
                unreadNotifs.map(n =>
                    updateDoc(doc(db, "notifications", n.id), { read: true })
                )
            );

            setNotifications(prev => prev.map(n => ({ ...n, read: true })));
        } catch (error) {
            console.error("Error marking all as read:", error);
        }
    }

    function formatDate(timestamp: any): string {
        if (!timestamp) return "Recently";
        
        let date: Date;
        if (timestamp.toDate) {
            date = timestamp.toDate();
        } else if (timestamp instanceof Date) {
            date = timestamp;
        } else {
            return "Recently";
        }

        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffMinutes = Math.floor(diffTime / (1000 * 60));
        const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffMinutes < 1) return "Just now";
        if (diffMinutes < 60) return `${diffMinutes}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        
        return date.toLocaleDateString('en-IN', { 
            month: 'short', 
            day: 'numeric',
            year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined
        });
    }

    const filteredNotifications = filter === "unread" 
        ? notifications.filter(n => !n.read)
        : notifications;

    const unreadCount = notifications.filter(n => !n.read).length;

    return (
        <div>
            <style>{`
                :root{--color-primary:#34d399;--color-secondary:#0f172a;--color-bg-light:#f8fafc;--color-card-bg:#ffffff;--color-text-subtle:#64748b;--color-gray-border:#e2e8f0}
                *{box-sizing:border-box;margin:0;padding:0}
                body{font-family:Arial,sans-serif;background-color:var(--color-bg-light);color:var(--color-secondary)}
                
                .container {
                    max-width: 900px;
                    margin: 0 auto;
                    padding: 30px 20px;
                    min-height: 100vh;
                    background-color: var(--color-bg-light);
                }

                .header {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 25px 30px;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .header-top {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-bottom: 15px;
                }

                .title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-secondary);
                    display: flex;
                    align-items: center;
                    gap: 12px;
                }

                .badge {
                    background-color: var(--color-primary);
                    color: white;
                    font-size: 0.9rem;
                    padding: 4px 12px;
                    border-radius: 20px;
                    font-weight: 600;
                }

                .back-link {
                    color: var(--color-primary);
                    text-decoration: none;
                    font-size: 0.95rem;
                    font-weight: 500;
                }

                .back-link:hover {
                    text-decoration: underline;
                }

                .filters {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .filter-btn {
                    padding: 8px 16px;
                    border: 1px solid var(--color-gray-border);
                    background-color: white;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .filter-btn.active {
                    background-color: var(--color-primary);
                    color: white;
                    border-color: var(--color-primary);
                }

                .filter-btn:hover:not(.active) {
                    background-color: var(--color-bg-light);
                }

                .mark-all-btn {
                    padding: 8px 16px;
                    background-color: transparent;
                    border: 1px solid var(--color-primary);
                    color: var(--color-primary);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    font-weight: 500;
                    transition: all 0.2s;
                }

                .mark-all-btn:hover {
                    background-color: var(--color-primary);
                    color: white;
                }

                .notifications-list {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .notification-card {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    transition: all 0.2s;
                    cursor: pointer;
                    border-left: 4px solid transparent;
                }

                .notification-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .notification-card.unread {
                    border-left-color: var(--color-primary);
                    background-color: #f0fdf4;
                }

                .notification-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 10px;
                }

                .notification-title {
                    font-size: 1.1rem;
                    font-weight: 600;
                    color: var(--color-secondary);
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .unread-dot {
                    width: 10px;
                    height: 10px;
                    background-color: var(--color-primary);
                    border-radius: 50%;
                }

                .notification-time {
                    font-size: 0.85rem;
                    color: var(--color-text-subtle);
                    white-space: nowrap;
                }

                .notification-message {
                    color: var(--color-text-subtle);
                    line-height: 1.6;
                    margin-bottom: 12px;
                }

                .notification-footer {
                    display: flex;
                    gap: 10px;
                    flex-wrap: wrap;
                }

                .notification-tag {
                    padding: 4px 12px;
                    background-color: var(--color-bg-light);
                    border-radius: 15px;
                    font-size: 0.85rem;
                    color: var(--color-secondary);
                }

                .view-job-link {
                    color: var(--color-primary);
                    text-decoration: none;
                    font-size: 0.9rem;
                    font-weight: 500;
                }

                .view-job-link:hover {
                    text-decoration: underline;
                }

                .empty-state {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 60px 30px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    color: var(--color-text-subtle);
                    margin-bottom: 10px;
                }

                .empty-state p {
                    color: var(--color-text-subtle);
                }

                .loading-state {
                    text-align: center;
                    padding: 60px 20px;
                    color: var(--color-text-subtle);
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .header-top {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 15px;
                    }

                    .filters {
                        width: 100%;
                        justify-content: space-between;
                    }
                }
            `}</style>

            <div className="container">
                <div className="header">
                    <div className="header-top">
                        <h1 className="title">
                            🔔 Notifications
                            {unreadCount > 0 && <span className="badge">{unreadCount}</span>}
                        </h1>
                        <Link href="/hire-dashboard" className="back-link">
                            ← Back to Dashboard
                        </Link>
                    </div>
                    
                    <div className="filters">
                        <button 
                            className={`filter-btn ${filter === "all" ? "active" : ""}`}
                            onClick={() => setFilter("all")}
                        >
                            All ({notifications.length})
                        </button>
                        <button 
                            className={`filter-btn ${filter === "unread" ? "active" : ""}`}
                            onClick={() => setFilter("unread")}
                        >
                            Unread ({unreadCount})
                        </button>
                        {unreadCount > 0 && (
                            <button className="mark-all-btn" onClick={markAllAsRead}>
                                Mark all as read
                            </button>
                        )}
                    </div>
                </div>

                <div className="notifications-list">
                    {loading ? (
                        <div className="loading-state">
                            Loading notifications...
                        </div>
                    ) : filteredNotifications.length === 0 ? (
                        <div className="empty-state">
                            <h3>No notifications</h3>
                            <p>{filter === "unread" ? "You're all caught up!" : "You don't have any notifications yet"}</p>
                        </div>
                    ) : (
                        filteredNotifications.map((notification) => (
                            <div 
                                key={notification.id} 
                                className={`notification-card ${!notification.read ? "unread" : ""}`}
                                onClick={() => !notification.read && markAsRead(notification.id)}
                            >
                                <div className="notification-header">
                                    <div className="notification-title">
                                        {!notification.read && <span className="unread-dot"></span>}
                                        {notification.title}
                                    </div>
                                    <span className="notification-time">
                                        {formatDate(notification.createdAt)}
                                    </span>
                                </div>
                                
                                <p className="notification-message">{notification.message}</p>
                                
                                <div className="notification-footer">
                                    <span className="notification-tag">
                                        {notification.type === "job_application" ? "📝 Application" : "ℹ️ Info"}
                                    </span>
                                    {notification.jobId && notification.jobTitle && (
                                        <>
                                            <span className="notification-tag">
                                                💼 {notification.jobTitle}
                                            </span>
                                            <Link 
                                                href={`/job-details/${notification.jobId}`} 
                                                className="view-job-link"
                                                onClick={(e) => e.stopPropagation()}
                                            >
                                                View Job →
                                            </Link>
                                        </>
                                    )}
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
