"use client";

import React, { useState, useRef } from "react";
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';

export default function HireProffesionPage() {
    const router = useRouter();
    const [minIncome, setMinIncome] = useState<string>("");
    const [maxIncome, setMaxIncome] = useState<string>("");
    const [incomeError, setIncomeError] = useState<string | null>(null);
    const [selectedShift, setSelectedShift] = useState<string>("any");
    const [selectedType, setSelectedType] = useState<string>("field");
    const [useCurrent, setUseCurrent] = useState<boolean>(false);
    const [cityTown, setCityTown] = useState<string>("");
    const [locality, setLocality] = useState<string>("");
    const [selectedJobs, setSelectedJobs] = useState<string[]>([]);
    const [numJobs, setNumJobs] = useState<string>("");
    const [feedback, setFeedback] = useState<string | null>(null);
    const locBtnRef = useRef<HTMLButtonElement | null>(null);
    const [isSaving, setIsSaving] = useState(false);

    const jobOptions = [
        'Plumber', 'Electrician', 'Carpenter', 'Painter', 'Mason', 'Welder',
        'Driver', 'Delivery Driver', 'Cook', 'Housekeeper', 'Security Guard',
        'Accountant', 'Nurse', 'Sales Executive', 'Data Entry Operator',
        'Office Assistant', 'Machine Operator', 'Warehouse Worker',
        'Admin/Office', 'Marketing/Sales', 'Designing', 'Mechanics',
        'Tailoring', 'Photography', 'Agriculture'
    ];

    function toggleJob(job: string) {
        if (selectedJobs.includes(job)) {
            setSelectedJobs(selectedJobs.filter(j => j !== job));
        } else {
            setSelectedJobs([...selectedJobs, job]);
        }
    }

    function resetForm() {
        setMinIncome("");
        setMaxIncome("");
        setIncomeError(null);
        setSelectedShift("any");
        setSelectedType("field");
        setUseCurrent(false);
        setCityTown("");
        setLocality("");
        setSelectedJobs([]);
        setNumJobs("");
        setFeedback(null);
    }

    function syncIncome(min = minIncome, max = maxIncome) {
        setIncomeError(null);
        const minN = Number(min || 0);
        const maxN = Number(max || 0);
        if (min !== "" && max !== "" && minN > maxN) {
            setIncomeError("Minimum income must be less than or equal to maximum income.");
        }
    }

    async function findCurrentLocation() {
        if (!navigator.geolocation) {
            alert("Geolocation is not supported by your browser.");
            return;
        }
        const btn = locBtnRef.current;
        if (btn) {
            btn.disabled = true;
            btn.textContent = "Locating...";
        }
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Find current";
                }
                const lat = pos.coords.latitude.toFixed(5);
                const lon = pos.coords.longitude.toFixed(5);
                setCityTown(`Coords: ${lat}, ${lon}`);
                setLocality("Current location (allow permission to use address)");
                setUseCurrent(true);
            },
            (err) => {
                if (btn) {
                    btn.disabled = false;
                    btn.textContent = "Find current";
                }
                alert("Could not get location: " + err.message);
            },
            { enableHighAccuracy: true, timeout: 10000 }
        );
    }

    async function onSubmit(ev: React.FormEvent) {
        ev.preventDefault();
        setIncomeError(null);
        const minN = Number(minIncome || 0);
        const maxN = Number(maxIncome || 0);
        if (minIncome !== "" && maxIncome !== "" && minN > maxN) {
            setIncomeError("Minimum income must not exceed maximum income.");
            return;
        }

        const user = auth.currentUser;
        if (!user) {
            setFeedback('Please sign in (or enable anonymous auth) to save this form.');
            return;
        }

        const payload = {
            selectedJobs: selectedJobs,
            numJobs,
            minIncome: minIncome === '' ? null : Number(minIncome),
            maxIncome: maxIncome === '' ? null : Number(maxIncome),
            shift: selectedShift,
            jobType: selectedType,
            useCurrentLocation: useCurrent,
            cityTown: cityTown.trim(),
            locality: locality.trim(),
            createdAt: new Date().toISOString(),
            createdBy: user.uid,
        };

        setIsSaving(true);
        setFeedback('Saving...');
        try {
            // add to Firestore collection named "seeker-proffessian"
            await addDoc(collection(db, 'seeker-proffessian'), payload as any);
            setFeedback('Saved filters — preview in console.');
            // eslint-disable-next-line no-console
            console.log('Job filter payload saved to Firestore:', payload);
            // navigate to seeker-requirement page
            router.push('/seeker-requirement');
        } catch (err) {
            console.error('Error saving to Firestore', err);
            setFeedback('Failed to save — see console for details.');
        } finally {
            setIsSaving(false);
        }
    }

    return (
        <div className="min-h-screen bg-[linear-gradient(180deg,#eef3ff_0%,var(--bg)_100%)] p-7">
            <div className="mx-auto max-w-3xl">
                <div className="bg-white rounded-xl shadow-md p-6 border" role="region" aria-labelledby="frmTitle">

                    <p className="text-sm text-gray-500 mb-4">Enter filters to search jobs. You can use current location to autofill city/locality.</p>

                    <form id="jobForm" onSubmit={onSubmit} noValidate>
                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">Select job roles (multiple)</label>
                            <div className="border rounded-lg p-3 max-h-60 overflow-y-auto">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                    {jobOptions.map((job) => (
                                        <label key={job} className="flex items-center gap-2 p-2 hover:bg-gray-50 rounded cursor-pointer">
                                            <input
                                                type="checkbox"
                                                checked={selectedJobs.includes(job)}
                                                onChange={() => toggleJob(job)}
                                                className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                            />
                                            <span className="text-sm text-gray-700">{job}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>
                            <div className="text-sm text-gray-500 mt-1">
                                Selected: {selectedJobs.length} job{selectedJobs.length !== 1 ? 's' : ''}
                                {selectedJobs.length > 0 && (
                                    <button
                                        type="button"
                                        onClick={() => setSelectedJobs([])}
                                        className="ml-3 text-red-600 hover:underline"
                                    >
                                        Clear all
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="flex flex-wrap gap-4 mb-4">
                            <div className="flex-1 min-w-[200px]">
                                <label htmlFor="numJobs" className="block text-sm text-gray-600 mb-1">Number of jobs</label>
                                <select id="numJobs" name="numJobs" aria-label="Number of jobs" value={numJobs} onChange={(e) => setNumJobs(e.target.value)} className="w-full p-2.5 rounded-lg border">
                                    <option value="">Any</option>
                                    <option value="1">1</option>
                                    <option value="5">Up to 5</option>
                                    <option value="10">Up to 10</option>
                                    <option value="50">Up to 50</option>
                                </select>
                            </div>

                            <div className="flex-1 min-w-[200px]">
                                <label className="block text-sm text-gray-600 mb-1">Monthly income (₹)</label>
                                <div className="flex gap-2 items-center">
                                    <div className="relative flex-1">
                                        <input
                                            id="minIncome"
                                            name="minIncome"
                                            type="number"
                                            placeholder="Min"
                                            min={0}
                                            step={100}
                                            value={minIncome}
                                            onChange={(e) => { setMinIncome(e.target.value); syncIncome(e.target.value, maxIncome); }}
                                            className="w-full p-2.5 pr-10 rounded-lg border focus:ring-2 focus:ring-blue-400"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                                            <button
                                                type="button"
                                                onClick={() => { const newVal = String(Number(minIncome || 0) + 100); setMinIncome(newVal); syncIncome(newVal, maxIncome); }}
                                                className="text-gray-500 hover:text-gray-700 leading-none"
                                            >▴</button>
                                            <button
                                                type="button"
                                                onClick={() => { const newVal = String(Math.max(0, Number(minIncome || 0) - 100)); setMinIncome(newVal); syncIncome(newVal, maxIncome); }}
                                                className="text-gray-500 hover:text-gray-700 leading-none"
                                            >▾</button>
                                        </div>
                                    </div>
                                    <span className="text-gray-400">—</span>
                                    <div className="relative flex-1">
                                        <input
                                            id="maxIncome"
                                            name="maxIncome"
                                            type="number"
                                            placeholder="Max"
                                            min={0}
                                            step={100}
                                            value={maxIncome}
                                            onChange={(e) => { setMaxIncome(e.target.value); syncIncome(minIncome, e.target.value); }}
                                            className="w-full p-2.5 pr-10 rounded-lg border focus:ring-2 focus:ring-blue-400"
                                        />
                                        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col">
                                            <button
                                                type="button"
                                                onClick={() => { const newVal = String(Number(maxIncome || 0) + 100); setMaxIncome(newVal); syncIncome(minIncome, newVal); }}
                                                className="text-gray-500 hover:text-gray-700 leading-none"
                                            >▴</button>
                                            <button
                                                type="button"
                                                onClick={() => { const newVal = String(Math.max(0, Number(maxIncome || 0) - 100)); setMaxIncome(newVal); syncIncome(minIncome, newVal); }}
                                                className="text-gray-500 hover:text-gray-700 leading-none"
                                            >▾</button>
                                        </div>
                                    </div>
                                </div>
                                {incomeError && <div id="incomeError" className="text-sm text-red-600 mt-1">{incomeError}</div>}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">Job shift</label>
                            <div role="radiogroup" aria-label="Job shift" className="flex gap-2">
                                {[
                                    { label: 'Any', value: 'any' },
                                    { label: 'Day', value: 'day' },
                                    { label: 'Night', value: 'night' },
                                ].map((opt) => (
                                    <button key={opt.value} type="button" onClick={() => setSelectedShift(opt.value)} className={`px-3 py-2 rounded-full border ${selectedShift === opt.value ? 'text-white' : 'bg-white'}`} style={selectedShift === opt.value ? { backgroundColor: '#EFB702' } : {}} aria-pressed={selectedShift === opt.value}>{opt.label}</button>
                                ))}
                            </div>
                        </div>

                        <div className="mb-4">
                            <label className="block text-sm text-gray-600 mb-2">Job type</label>
                            <div role="radiogroup" aria-label="Job type" className="flex gap-2">
                                {[
                                    { label: 'Field', value: 'field' },
                                    { label: 'Industry', value: 'industry' },
                                ].map((opt) => (
                                    <button key={opt.value} type="button" onClick={() => setSelectedType(opt.value)} className={`px-3 py-2 rounded-full border ${selectedType === opt.value ? 'text-white' : 'bg-white'}`} style={selectedType === opt.value ? { backgroundColor: '#EFB702' } : {}} aria-pressed={selectedType === opt.value}>{opt.label}</button>
                                ))}
                            </div>
                            <div className="text-sm text-gray-500 mt-2">Choose whether role is field-based or industry-based.</div>
                        </div>

                        <div className="mb-4 flex items-center justify-between">
                            <div>
                                <label className="inline-flex items-center">
                                    <input type="checkbox" id="useCurrent" name="useCurrent" checked={useCurrent} onChange={(e) => setUseCurrent(e.target.checked)} className="mr-2" />
                                    <span className="text-sm text-gray-700">Use current location</span>
                                </label>
                            </div>
                            <div>
                                <button type="button" id="locBtn" ref={locBtnRef} className="px-3 py-2 rounded-md border bg-gray-50" onClick={findCurrentLocation} title="Get current location">Find current</button>
                            </div>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="cityTown" className="block text-sm text-gray-600 mb-1">Search city / town</label>
                            <input id="cityTown" name="cityTown" type="text" placeholder="e.g. Bengaluru, Mumbai" value={cityTown} onChange={(e) => setCityTown(e.target.value)} list="cityList" className="w-full p-2.5 rounded-lg border" />
                            <datalist id="cityList">
                                <option value="sullai" />
                                <option value="Putturu" />
                                <option value="Madikeri" />
                                <option value="Mangaluru" />
                                <option value="Kundapur" />
                                <option value="Kumta" />
                                <option value="Honnavar" />
                                <option value="Bhatkal" />
                            </datalist>
                        </div>

                        <div className="mb-4">
                            <label htmlFor="locality" className="block text-sm text-gray-600 mb-1">Search locality / area</label>
                            <input id="locality" name="locality" type="text" placeholder="e.g. Jayanagar, Andheri East" value={locality} onChange={(e) => setLocality(e.target.value)} className="w-full p-2.5 rounded-lg border" />
                        </div>

                        <div className="flex justify-end gap-3 mt-4">
                            <button type="button" id="resetBtn" onClick={(e) => { e.preventDefault(); resetForm(); }} className="px-4 py-2 rounded-md border bg-gray-100">Reset</button>
                            <button type="submit" id="saveNext" className="px-4 py-2 rounded-md text-white" style={{ backgroundColor: '#EFB702' }}>Save &amp; Next</button>
                        </div>

                        <input type="hidden" id="selectedShift" name="selectedShift" value={selectedShift} />
                        <input type="hidden" id="selectedType" name="selectedType" value={selectedType} />
                        {feedback && <div id="submitFeedback" className="text-sm text-gray-600 mt-3">{feedback}</div>}
                    </form>
                </div>
            </div>
        </div>
    );
}

