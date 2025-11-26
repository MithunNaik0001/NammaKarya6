"use client";

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
// SideNav is provided globally via `src/app/layout.tsx`; don't render a page-level sidebar here.

export default function CandidateRequirementPage() {
    const router = useRouter();
    const [education, setEducation] = useState<string[]>([]);
    const [experience, setExperience] = useState<string[]>([]);
    const [gender, setGender] = useState<string | null>(null);
    const [upiId, setUpiId] = useState<string>('');
    const [feedback, setFeedback] = useState<string | null>(null);
    const [resultVisible, setResultVisible] = useState(false);

    function toggleMulti(list: string[], value: string, setList: (v: string[]) => void) {
        const idx = list.indexOf(value);
        if (idx === -1) setList([...list, value]);
        else setList(list.filter((x) => x !== value));
    }

    function validUpiId(v: string) {
        return /^[a-zA-Z0-9.\-_]{2,256}@[a-zA-Z]{2,64}$/.test(v);
    }

    async function onSave() {
        const upiIdClean = upiId.trim();
        const errors: string[] = [];
        if (education.length === 0) errors.push('Select at least one minimum education.');
        if (experience.length === 0) errors.push('Select at least one experience range.');
        if (!upiIdClean) errors.push('Please enter UPI ID.');
        if (upiIdClean && !validUpiId(upiIdClean)) errors.push('UPI ID must be in format: username@bank (e.g., user@paytm).');

        if (errors.length) {
            setFeedback('Errors:\n - ' + errors.join('\n - '));
            setResultVisible(true);
            return;
        }

        const payload: any = {
            minimumEducation: education,
            experience,
            preferredGender: gender,
            upiId: upiIdClean,
            createdAt: new Date().toISOString(),
        };

        const user = auth.currentUser;
        if (user) payload.createdBy = user.uid;

        setFeedback('Saving...');
        setResultVisible(true);
        try {
            await addDoc(collection(db, 'seeker-requirement'), payload as any);
            setFeedback('Saved Requirement.');
            console.log('seeker Requirement payload:', payload);
            // Navigate to the dashboard after save
            try {
                await router.push('/seeker-dashboard');
            } catch (navErr) {
                console.warn('Navigation failed', navErr);
            }
        } catch (err) {
            console.error('Error saving requirement', err);
            setFeedback('Failed to save — check console and Firestore rules.');
        }
    }

    function onReset() {
        setEducation([]);
        setExperience([]);
        setGender(null);
        setUpiId('');
        setFeedback(null);
        setResultVisible(false);
    }

    return (
        <div className="min-h-screen p-7 bg-gray-50">
            <div className="mx-auto max-w-4xl">
                <div className="bg-white rounded-xl p-6 shadow border">


                    <div className="mb-4">
                        <label className="block font-semibold mb-2">Minimum education</label>
                        <div className="flex gap-2 flex-wrap">
                            {['10th', '12th', 'Diploma', 'Graduate'].map((lvl) => (
                                <button
                                    key={lvl}
                                    type="button"
                                    onClick={() => toggleMulti(education, lvl, setEducation)}
                                    className={`px-3 py-2 rounded-full border font-semibold ${education.includes(lvl) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-transparent'}`}>
                                    {lvl}
                                </button>
                            ))}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">Select one or more education levels.</div>
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold mb-2">Experience</label>
                        <div className="flex gap-2 flex-wrap">
                            {['Less than 1 year', '1-3 years', '3-5 years', '5-10 years'].map((opt) => (
                                <button
                                    key={opt}
                                    type="button"
                                    onClick={() => toggleMulti(experience, opt, setExperience)}
                                    className={`px-3 py-2 rounded-full border font-semibold ${experience.includes(opt) ? 'bg-blue-50 border-blue-400 text-blue-700' : 'bg-transparent'}`}>
                                    {opt}
                                </button>
                            ))}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">Choose one or more applicable ranges.</div>
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold mb-2">Preferred gender</label>
                        <div className="flex gap-4 items-center">
                            {['Male', 'Female', 'Other'].map((g) => (
                                <label key={g} className="inline-flex items-center gap-2">
                                    <input type="radio" name="gender" value={g} checked={gender === g} onChange={() => setGender(g)} />
                                    <span>{g}</span>
                                </label>
                            ))}
                        </div>
                        <div className="text-sm text-gray-500 mt-2">Optional — leave blank for no preference.</div>
                    </div>

                    <div className="mb-4">
                        <label className="block font-semibold mb-2">Enter UPI ID</label>
                        <input
                            className="p-2.5 rounded-md border w-full max-w-md"
                            placeholder="Enter UPI ID (e.g., yourname@paytm)"
                            value={upiId}
                            onChange={(e) => setUpiId(e.target.value)}
                        />
                        <div className="text-sm text-gray-500 mt-2">Enter your UPI ID for payment collection (e.g., username@paytm, username@ybl)</div>
                    </div>

                    <div className="flex gap-2 mt-4">
                        <button type="button" className="px-4 py-2 rounded-md bg-blue-600 text-white font-bold" onClick={onSave}>Save & Next</button>
                        <button type="button" className="px-4 py-2 rounded-md border" onClick={onReset}>Reset</button>
                    </div>

                    <div className="mt-4">
                        <div aria-live="polite" className="result" style={{ display: resultVisible ? 'block' : 'none' }}>
                            <pre style={{ whiteSpace: 'pre-wrap', fontFamily: 'monospace' }}>{feedback || ''}</pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

