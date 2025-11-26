"use client";

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { auth, db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

export default function Sidebar() {
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);
  const [profileName, setProfileName] = useState<string>('User');
  const [profileMenuLabel, setProfileMenuLabel] = useState<string>('Menu');
  const [photoURL, setPhotoURL] = useState<string | null>(null);

  useEffect(() => {
    let unsubUserDoc: (() => void) | null = null;

    // Listen for auth state so we can attach a Firestore listener when a user is present
    const unregisterAuth = auth.onAuthStateChanged((user) => {
      if (user) {
        // seed from auth profile quickly
        if (user.displayName) setProfileName(user.displayName);
        if ((user as any).menuLabel) setProfileMenuLabel((user as any).menuLabel);
        if (user.photoURL) setPhotoURL(user.photoURL);

        // attach a realtime listener to the user's Firestore doc (users/{uid})
        try {
          const userDocRef = doc(db, 'users', user.uid);
          unsubUserDoc = onSnapshot(userDocRef, (snap) => {
            if (!snap.exists()) return;
            const data = snap.data() as any;
            if (data.name) setProfileName(data.name);
            if (data.menuLabel) setProfileMenuLabel(data.menuLabel);
            if (data.photoURL) setPhotoURL(data.photoURL);
          }, (err) => {
            // ignore listen errors but keep auth-seeded values
            console.warn('User doc snapshot error', err);
          });
        } catch (e) {
          console.warn('Could not attach user doc listener', e);
        }
      } else {
        // no user: clear profile info to defaults
        setProfileName('User');
        setProfileMenuLabel('Menu');
        setPhotoURL(null);
      }
    });

    // mark mounted so that pathname-based active styles only apply on client
    setMounted(true);

    return () => {
      // cleanup auth listener and firestore listener
      unregisterAuth();
      if (unsubUserDoc) unsubUserDoc();
    };
  }, []);

  const isActive = (path: string) => mounted && !!pathname && pathname.startsWith(path);

  return (
    <aside style={{ background: 'hsl(var(--sidebar-background))', borderRight: '1px solid hsl(var(--sidebar-border) / 0.6)', padding: 20, display: 'flex', flexDirection: 'column' }}>
      <div style={{ fontSize: '1.25rem', fontWeight: 700, marginBottom: 20, display: 'flex', alignItems: 'center' }}>
        <span style={{ width: 10, height: 10, borderRadius: 6, background: 'hsl(var(--sidebar-primary))', display: 'inline-block', marginRight: 8 }} />
        NammaKarya
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <div style={{ textAlign: 'center', marginBottom: 6 }}>
          <img src={photoURL || "https://i.ibb.co/L8B8YgW/placeholder-profile.png"} alt="Profile" style={{ width: 70, height: 70, borderRadius: 12, objectFit: 'cover' }} />
        </div>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontWeight: 700, color: 'hsl(var(--sidebar-foreground))' }}>{profileName}</div>
          <div style={{ color: 'hsl(var(--sidebar-accent-foreground))' }}>{profileMenuLabel}</div>
        </div>
      </div>

      <nav aria-label="Primary" style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {[
          { href: '/hire-dashboard', icon: '📊', label: 'Dashboard' },
          { href: '/hire-Myprofile', icon: '👤', label: 'My Profile' },
          { href: '/payment-history', icon: '💼', label: 'Payment History' },
          { href: '/hire-proffesion', icon: '✉️', label: 'Post a job' },
          { href: '/find-job', icon: '➡️', label: 'Find job' },
        ].map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '12px 15px',
                margin: '4px 0',
                borderRadius: 8,
                color: active ? 'hsl(var(--sidebar-primary-foreground))' : 'hsl(var(--sidebar-foreground), 1)',
                backgroundColor: active ? 'hsl(var(--sidebar-primary))' : 'transparent',
                textDecoration: 'none',
                gap: 12,
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{item.icon}</span>
              <span style={{ fontWeight: 500 }}>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      <div style={{ marginTop: 'auto' }}>
        <a className="logout" style={{ color: 'var(--color-text-subtle)', textDecoration: 'none', display: 'flex', alignItems: 'center', fontSize: '.9rem' }}>
          <span className="nav-icon">➡️</span> Logout
        </a>
      </div>
    </aside>
  );
}
