"use client";
import React, { useState } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useRouter } from 'next/navigation';
import { addDoc, collection } from 'firebase/firestore';
import { db, auth } from '@/lib/firebase';
// SideNav is provided globally via `src/app/layout.tsx`; don't render a page-level sidebar here.
export const dynamic = "force-dynamic";
export const fetchCache = "force-no-store";

import { Suspense } from 'react';

function CandidateRequirementPageInner() {
	const searchParams = useSearchParams();
	const jobId = searchParams.get('jobId');
	const router = useRouter();
	const [education, setEducation] = useState<string[]>([]);
	const [experience, setExperience] = useState<string[]>([]);
	const [gender, setGender] = useState<string | null>(null);
	const [mobile, setMobile] = useState<string>('');
	const [whatsapp, setWhatsapp] = useState<string>('');
	const [feedback, setFeedback] = useState<string | null>(null);
	const [resultVisible, setResultVisible] = useState(false);

	function toggleMulti(list: string[], value: string, setList: (v: string[]) => void) {
		const idx = list.indexOf(value);
		if (idx === -1) setList([...list, value]);
		else setList(list.filter((x) => x !== value));
	}

	function sanitizeNumber(str: string) {
		return str.replace(/\D/g, '');
	}

	function validPhone(v: string) {
		return /^\d{10}$/.test(v);
	}

	async function onSave() {
		const mobileClean = sanitizeNumber(mobile.trim());
		const whatsappClean = sanitizeNumber(whatsapp.trim());
		const errors: string[] = [];
		if (education.length === 0) errors.push('Select at least one minimum education.');
		if (experience.length === 0) errors.push('Select at least one experience range.');
		if (!mobileClean && !whatsappClean) errors.push('Provide at least one contact number (mobile or WhatsApp).');
		if (mobileClean && !validPhone(mobileClean)) errors.push('Mobile number must be 10 digits.');
		if (whatsappClean && !validPhone(whatsappClean)) errors.push('WhatsApp number must be 10 digits.');

		if (errors.length) {
			setFeedback('Errors:\n - ' + errors.join('\n - '));
			setResultVisible(true);
			return;
		}

		const payload: any = {
			minimumEducation: education,
			experience,
			preferredGender: gender,
			contact: { mobile: mobileClean || null, whatsapp: whatsappClean || null },
			createdAt: new Date().toISOString(),
			jobId,
		};

		const user = auth.currentUser;
		if (user) payload.createdBy = user.uid;

		setFeedback('Saving...');
		setResultVisible(true);
		try {
			// Check if a candidate requirement for this jobId already exists
			const { query, where, getDocs, doc, updateDoc } = await import('firebase/firestore');
			const reqQuery = query(collection(db, 'candidate-requermen'), where('jobId', '==', jobId));
			const reqSnapshot = await getDocs(reqQuery);
			if (!reqSnapshot.empty) {
				// Update the first found document
				const reqDoc = reqSnapshot.docs[0];
				await updateDoc(doc(db, 'candidate-requermen', reqDoc.id), payload);
				setFeedback('Updated Requirement.');
			} else {
				// Create new requirement
				const { addDoc } = await import('firebase/firestore');
				await addDoc(collection(db, 'candidate-requermen'), payload);
				setFeedback('Saved Requirement.');
			}
			console.log('Candidate Requirement payload:', payload);
			// Navigate to the dashboard after save
			try {
				await router.push('/hire-dashboard');
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
		setMobile('');
		setWhatsapp('');
		setFeedback(null);
		setResultVisible(false);
	}

	return (
		<div className="min-h-screen p-7 bg-gray-50">
			<div className="mx-auto max-w-4xl">
				<div className="bg-white rounded-xl p-6 shadow border">
					<div className="flex items-center justify-between">
						<h1 className="text-xl font-semibold mb-4">Candidate Requirement</h1>
					</div>

					<div className="mb-4">
						<label className="block font-semibold mb-2">Minimum education</label>
						<div className="flex gap-2 flex-wrap">
							{['None', '10th', '12th', 'Diploma', 'Graduate'].map((lvl) => (
								<button
									key={lvl}
									type="button"
									onClick={() => toggleMulti(education, lvl, setEducation)}
									className={`px-3 py-2 rounded-full border font-semibold ${education.includes(lvl) ? 'bg-[#E1A800] text-white' : 'bg-transparent'}`}>
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
									className={`px-3 py-2 rounded-full border font-semibold ${experience.includes(opt) ? 'bg-[#E1A800] text-white' : 'bg-transparent'}`}>
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
						<label className="block font-semibold mb-2">Mobile Number</label>
						<input className="p-2.5 rounded-md border mr-3" placeholder="Enter mobile number" value={mobile} onChange={(e) => setMobile(e.target.value)} />
						<div className="mt-3">
							<label className="block font-semibold mb-2">WhatsApp Number</label>
							<input className="p-2.5 rounded-md border" placeholder="Enter WhatsApp number" value={whatsapp} onChange={(e) => setWhatsapp(e.target.value)} />
						</div>
					</div>

					<div className="flex gap-2 mt-4">
						<button type="button" className="px-4 py-2 rounded-md bg-[#E1A800] hover:bg-[#CC9600] text-white font-bold" onClick={onSave}>Save Requirement</button>
						<button type="button" className="px-4 py-2 rounded-md border border-[#E1A800] text-[#E1A800] hover:bg-[#E1A800] hover:text-white" onClick={onReset}>Reset</button>
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

const CandidateRequirementPage = () => (
	<Suspense fallback={<div>Loading...</div>}>
		<CandidateRequirementPageInner />
	</Suspense>
);

export default CandidateRequirementPage;

