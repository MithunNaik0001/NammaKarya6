"use client";

import React, { useState, useEffect, useRef } from "react";
import { useSearchParams } from 'next/navigation';
import { auth, db, storage, storageBucketName } from "../../lib/firebase";
import { collection, doc, setDoc, addDoc, serverTimestamp } from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// We persist profile updates to Firestore only; avoid updating Auth profile here.

export default function HireMyProfilePage() {
    const searchParams = useSearchParams();
    const editParam = searchParams?.get('edit');
    const nameInputRef = useRef<HTMLInputElement | null>(null);
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [address, setAddress] = useState("");
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [file, setFile] = useState<File | null>(null);
    const [saving, setSaving] = useState(false);
    const [progress, setProgress] = useState<number | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null);
    const [errorStack, setErrorStack] = useState<string | null>(null);

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files && e.target.files[0];
        if (f) {
            setFile(f);
            setPhotoPreview(URL.createObjectURL(f));
        }
    }

    useEffect(() => {
        if (editParam === '1') {
            // focus the name input when opened via ?edit=1
            setTimeout(() => nameInputRef.current?.focus(), 50);
        }
    }, [editParam]);

    async function handleSave() {
        setSaving(true);
        setProgress(null);
        try {
            const user = auth.currentUser;

            // If signed in, use users/{uid}, otherwise create a new profiles doc
            let docRef: any;
            if (user && user.uid) {
                docRef = doc(db, "users", user.uid);
            } else {
                const newDoc = await addDoc(collection(db, "profiles"), {});
                docRef = doc(db, "profiles", newDoc.id);
            }

            let photoURL: string | null = null;
            if (file) {
                const path = user && user.uid ? `profilePhotos/${user.uid}/${file.name}` : `profilePhotos/${docRef.id}/${file.name}`;
                const sRef = storageRef(storage, path);
                const uploadTask = uploadBytesResumable(sRef, file);

                await new Promise<void>((resolve, reject) => {
                    uploadTask.on("state_changed", (snap) => {
                        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                        setProgress(pct);
                    }, (err) => reject(err), async () => {
                        photoURL = await getDownloadURL(uploadTask.snapshot.ref);
                        resolve();
                    });
                });
            }

            const payload: any = {
                name: name || null,
                email: email || null,
                phone: phone || null,
                address: address || null,
                photoURL: photoURL || null,
                updatedAt: serverTimestamp(),
            };


            // Persist profile to Firestore with additional metadata
            if (user) {
                payload.lastSavedBy = user.uid;
                payload.uid = user.uid;
                payload.email = user.email || null;
            }
            payload.storageBucket = storageBucketName || null;

            await setDoc(docRef, payload, { merge: true });
            // No client-side alert shown; profile persisted to Firestore for server/client sync.
        } catch (e: any) {
            // Log full error for debugging
            // eslint-disable-next-line no-console
            console.error("Save failed", e);
            const msg = e?.message || String(e) || 'Unknown error';
            const stack = e?.stack || null;
            setErrorMsg(msg);
            setErrorStack(stack);
            // Keep the old alert but make it optional (also show inline)
            try { window.alert("Save failed: " + msg); } catch (_) { }
        } finally {
            setSaving(false);
            setProgress(null);
        }
    }

    return (
        <div style={{ display: 'flex', justifyContent: 'center', padding: 20 }}>
            <div style={{ width: '100%', maxWidth: 450 }}>
                <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,.1)', background: '#fff' }}>
                    <div style={{ position: 'relative', background: '#555', height: 150, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                        <div style={{ position: 'absolute', top: 15, left: 20, fontSize: 24, color: '#fff', backgroundColor: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 5 }}>NammaKarya</div>
                        <div style={{ marginBottom: -70, zIndex: 10 }}>
                            <img src={photoPreview || '/placeholder-profile.png'} alt="Profile" style={{ width: 140, height: 140, borderRadius: '50%', objectFit: 'cover', border: '5px solid #fff', boxShadow: '0 2px 10px rgba(0,0,0,.2)' }} />
                        </div>
                    </div>

                    <div style={{ padding: '80px 30px 30px 30px', textAlign: 'left' }}>
                        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#333', margin: 0, marginBottom: 5 }}>Personal Information</h2>
                        <hr style={{ border: 'none', height: 3, width: 100, backgroundColor: '#333', margin: '0 0 30px 0' }} />

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                            <label style={{ fontWeight: 400, color: '#555', width: 80, minWidth: 80, paddingRight: 10, alignSelf: 'flex-start', paddingTop: 10 }}>Name:</label>
                            <input ref={nameInputRef} value={name} onChange={(e) => setName(e.target.value)} className="info-input" style={{ fontWeight: 700, color: '#333', flexGrow: 1, padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                            <label style={{ fontWeight: 400, color: '#555', width: 80, minWidth: 80, paddingRight: 10, alignSelf: 'flex-start', paddingTop: 10 }}>Email:</label>
                            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="info-input" style={{ fontWeight: 700, color: '#333', flexGrow: 1, padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                            <label style={{ fontWeight: 400, color: '#555', width: 80, minWidth: 80, paddingRight: 10, alignSelf: 'flex-start', paddingTop: 10 }}>Phone:</label>
                            <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className="info-input" style={{ fontWeight: 700, color: '#333', flexGrow: 1, padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem' }} />
                        </div>

                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: 15 }}>
                            <label style={{ fontWeight: 400, color: '#555', width: 80, minWidth: 80, paddingRight: 10, alignSelf: 'flex-start', paddingTop: 10 }}>Address:</label>
                            <input value={address} onChange={(e) => setAddress(e.target.value)} className="info-input" style={{ fontWeight: 700, color: '#333', flexGrow: 1, padding: 10, border: '1px solid #ccc', borderRadius: 4, fontSize: '1rem' }} />
                        </div>

                        <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
                            <input type="file" accept="image/*" onChange={handleFile} />
                            <button onClick={handleSave} disabled={saving} style={{ padding: '8px 12px', background: '#34d399', color: '#fff', border: 'none', borderRadius: 6, cursor: 'pointer' }}>{saving ? 'Saving...' : 'Save'}</button>
                        </div>

                        {progress !== null && <div style={{ marginTop: 8 }}>Upload: {progress}%</div>}
                        {errorMsg && (
                            <div style={{ marginTop: 12, padding: 10, background: '#fee', border: '1px solid #fbb', borderRadius: 6 }}>
                                <div style={{ fontWeight: 700, color: '#900' }}>Save Error</div>
                                <div style={{ color: '#300' }}>{errorMsg}</div>
                                {errorStack && <details style={{ marginTop: 8 }}><summary>Stack</summary><pre style={{ whiteSpace: 'pre-wrap' }}>{errorStack}</pre></details>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
