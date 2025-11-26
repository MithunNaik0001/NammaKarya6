"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import Sidebar from './sidebar';

export default function SidebarWrapper({ children }: { children: React.ReactNode }) {
    const pathname = usePathname() || '';

    // Only show the sidebar on these routes (or routes that start with them)
    const showSidebar = [
        '/hire-dashboard',
        '/hire-Myprofile',
        '/payment-history',
        '/post-job',
        '/find-job',
    ].some((p) => pathname.startsWith(p));

    if (!showSidebar) return <>{children}</>;

    return (
        <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', minHeight: '100vh' }}>
            <Sidebar />
            <main>{children}</main>
        </div>
    );
}
