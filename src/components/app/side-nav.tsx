"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

type Props = {
    active?: 'dashboard' | 'profile' | 'payments' | 'post' | 'find';
};

export default function SideNav({ active }: Props) {
    const pathname = usePathname();

    // If caller provided `active` prop, prefer it. Otherwise infer from pathname.
    let inferredActive: Props['active'] | undefined = active;
    if (!inferredActive && pathname) {
        if (pathname.startsWith('/hire-dashboard')) inferredActive = 'dashboard';
        else if (pathname.startsWith('/hire-Myprofile')) inferredActive = 'profile';
        else if (pathname.startsWith('/payment-history')) inferredActive = 'payments';
        else if (pathname.startsWith('/post-job')) inferredActive = 'post';
        else if (pathname.startsWith('/find-job')) inferredActive = 'find';
    }

    const linkClass = (key: Props['active']) => `nav-link ${inferredActive === key ? 'active' : ''}`;

    return (
        <nav className="main-nav">
            <Link href="/hire-dashboard" className={linkClass('dashboard')}>
                <span className="nav-icon">📊</span> Dashboard
            </Link>
            <Link href="/hire-Myprofile" className={linkClass('profile')}>
                <span className="nav-icon">👤</span> My Profile
            </Link>
            <Link href="/payment-history" className={linkClass('payments')}>
                <span className="nav-icon">💼</span> Payment History
            </Link>
            <Link href="/post-job" className={linkClass('post')}>
                <span className="nav-icon">✉️</span> Post a job
            </Link>
            <Link href="/find-job" className={linkClass('find')}>
                <span className="nav-icon">➡️</span> Find job
            </Link>
        </nav>
    );
}
