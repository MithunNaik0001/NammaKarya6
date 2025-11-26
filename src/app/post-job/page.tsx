"use client";

import React from 'react';
import Link from 'next/link';

export default function Page() {
    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="mx-auto max-w-4xl bg-white rounded-xl p-6 shadow border">
                <h1 className="text-2xl font-semibold mb-4">Post a Job</h1>
                <p className="text-sm text-gray-600 mb-4">Placeholder page — implement job posting form here.</p>
                <Link href="/hire-dashboard" className="text-blue-600 underline">Back to Dashboard</Link>
            </div>
        </div>
    );
}
