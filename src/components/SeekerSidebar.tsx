"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { db, auth } from "../lib/firebase";
import { doc, onSnapshot } from "firebase/firestore";
import { onAuthStateChanged, signOut } from "firebase/auth";
import { MdDashboard, MdPerson, MdWork, MdSearch, MdPayment, MdLogout } from 'react-icons/md';

interface SeekerSidebarProps {
    activePage?: 'dashboard' | 'profile' | 'requirements' | 'find-jobs' | 'payment';
}

export default function SeekerSidebar({ activePage = 'dashboard' }: SeekerSidebarProps) {
    const router = useRouter();
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

    const handleLogout = async () => {
        try {
            await signOut(auth);
            router.push('/');
        } catch (error) {
            console.error('Logout error:', error);
        }
    };

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
                    gap: 10px;
                }
                .logo-img {
                    width: 40px;
                    height: 40px;
                    object-fit: contain;
                }
                .logo-text {
                    font-size: 1.5rem;
                    font-weight: 700;
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
                    background-color: #e3c340ff;
                }
                .nav-link.active {
                    background-color: #F3B802;
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
                .nav-link.active .nav-icon {
                    color: white;
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
                    background-color: #ebd426ff;
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
                    <img src="/logo.png" alt="NammaKarya Logo" className="logo-img" />
                    <span className="logo-text">NammaKarya</span>
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
                    <Link href="/seeker-dashboard" className={`nav-link ${activePage === 'dashboard' ? 'active' : ''}`} prefetch={true}>
                        <span className="nav-icon"><MdDashboard /></span>
                        Dashboard
                    </Link>
                    <Link href="/seeker-profile" className={`nav-link ${activePage === 'profile' ? 'active' : ''}`} prefetch={true}>
                        <span className="nav-icon"><MdPerson /></span>
                        My Profile
                    </Link>
                    <Link href="/seeker-aplydjob" className={`nav-link ${activePage === 'requirements' ? 'active' : ''}`} prefetch={true}>
                        <span className="nav-icon"><MdWork /></span>
                        Applied jobs
                    </Link>
                    <Link href="/seeker-jobs" className={`nav-link ${activePage === 'find-jobs' ? 'active' : ''}`} prefetch={true}>
                        <span className="nav-icon"><MdSearch /></span>
                        Find Jobs
                    </Link>
                    <Link href="/seeker-payment" className={`nav-link ${activePage === 'payment' ? 'active' : ''}`} prefetch={true}>
                        <span className="nav-icon"><MdPayment /></span>
                        Payment History
                    </Link>
                </nav>



                <button onClick={handleLogout} className="logout" style={{ background: 'none', border: 'none', cursor: 'pointer', width: '100%', textAlign: 'left' }}>
                    <MdLogout style={{ marginRight: 10, fontSize: '1.2rem' }} />
                    Logout
                </button>
            </aside>
        </>
    );
}
