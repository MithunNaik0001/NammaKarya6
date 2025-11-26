"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { db, auth } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";

interface SeekerSidebarProps {
    activePage?: 'dashboard' | 'profile' | 'requirements' | 'find-jobs' | 'payment';
}

export default function SeekerSidebar({ activePage = 'dashboard' }: SeekerSidebarProps) {
    const [profileName, setProfileName] = useState<string>("Guest");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (user) => {
            if (user) {
                const profileRef = doc(db, "seekerprofile", user.uid);

                const unsubscribeProfile = onSnapshot(profileRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const data = docSnap.data();
                        if (data.name) setProfileName(data.name);
                        if (data.photoUrl) setPhotoPreview(data.photoUrl);
                    } else {
                        if (user.displayName) setProfileName(user.displayName);
                        if (user.photoURL) setPhotoPreview(user.photoURL);
                    }
                });

                return () => unsubscribeProfile();
            } else {
                setProfileName("Guest");
                setPhotoPreview(null);
            }
        });

        return () => unsubscribeAuth();
    }, []);

    return (
        <>
            <style jsx>{`
                .sidebar {
                    background-color: #ffffff;
                    padding: 20px;
                    border-right: 1px solid #e2e8f0;
                    display: flex;
                    flex-direction: column;
                }
                .logo {
                    font-size: 1.5rem;
                    font-weight: 700;
                    margin-bottom: 30px;
                    color: #0f172a;
                    display: flex;
                    align-items: center;
                }
                .logo-dot {
                    width: 10px;
                    height: 10px;
                    background-color: #34d399;
                    border-radius: 50%;
                    margin-right: 5px;
                }
                .user-profile {
                    display: flex;
                    align-items: center;
                    margin-bottom: 30px;
                }
                .user-profile img {
                    width: 45px;
                    height: 45px;
                    border-radius: 50%;
                    margin-right: 10px;
                }
                .user-profile-info span {
                    display: block;
                    font-size: 0.9rem;
                    color: #64748b;
                }
                .nav-link {
                    display: flex;
                    align-items: center;
                    padding: 12px 15px;
                    margin: 5px 0;
                    border-radius: 8px;
                    color: #0f172a;
                    text-decoration: none;
                    transition: background-color 0.2s;
                }
                .nav-link:hover {
                    background-color: #f8fafc;
                }
                .nav-link.active {
                    background-color: #34d399;
                    color: white;
                    font-weight: 600;
                }
                .nav-icon {
                    margin-right: 15px;
                    font-size: 1.1rem;
                    color: #64748b;
                    width: 20px;
                    text-align: center;
                }
                .profile-complete {
                    margin-top: auto;
                    padding-top: 20px;
                    font-size: 0.85rem;
                    color: #64748b;
                }
                .progress-bar-container {
                    height: 8px;
                    background-color: #e2e8f0;
                    border-radius: 4px;
                    margin-top: 5px;
                }
                .progress-bar {
                    width: 87%;
                    height: 100%;
                    background-color: #34d399;
                    border-radius: 4px;
                }
                .logout {
                    margin-top: 20px;
                    color: #64748b;
                    text-decoration: none;
                    display: flex;
                    align-items: center;
                    font-size: 0.9rem;
                }
            `}</style>

            <aside className="sidebar">
                <div className="logo">
                    <span className="logo-dot"></span>
                    NammaKarya
                </div>

                <div className="user-profile">
                    {photoPreview ? (
                        <img src={photoPreview} alt="Profile" />
                    ) : (
                        <div style={{
                            width: '45px',
                            height: '45px',
                            borderRadius: '50%',
                            marginRight: '10px',
                            backgroundColor: '#e2e8f0',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.5rem',
                            color: '#64748b'
                        }}>
                            {profileName.charAt(0).toUpperCase()}
                        </div>
                    )}
                    <div className="user-profile-info">
                        <strong>{profileName}</strong>
                        <span>Job Seeker</span>
                    </div>
                </div>

                <nav>
                    <Link href="/seeker-dashboard" className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`}>
                        <span className="nav-icon">📊</span>
                        Dashboard
                    </Link>
                    <Link href="/seeker-profile" className={`nav-link ${activePage === 'profile' ? 'active' : ''}`}>
                        <span className="nav-icon">👤</span>
                        My Profile
                    </Link>
                    <Link href="/seeker-aplydjob" className={`nav-link ${activePage === 'requirements' ? 'active' : ''}`}>
                        <span className="nav-icon">📝</span>
                        Applied jobs
                    </Link>
                    <Link href="/find-job" className={`nav-link ${activePage === 'find-jobs' ? 'active' : ''}`}>
                        <span className="nav-icon">🔍</span>
                        Find Jobs
                    </Link>
                    <Link href="/seeker-payment" className={`nav-link ${activePage === 'payment' ? 'active' : ''}`}>
                        <span className="nav-icon">💳</span>
                        Payment History
                    </Link>
                </nav>



                <Link href="/logout" className="logout">
                    <span style={{ marginRight: 10 }}>🚪</span>
                    Logout
                </Link>
            </aside>
        </>
    );
}
