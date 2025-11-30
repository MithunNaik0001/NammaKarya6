"use client";
// Force dynamic rendering to fix Next.js static export error
export const dynamic = "force-dynamic";
// TypeScript props for PageContent
type PageContentProps = {
    nameInputRef: React.RefObject<HTMLInputElement>;
    name: string;
    setName: React.Dispatch<React.SetStateAction<string>>;
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    phone: string;
    setPhone: React.Dispatch<React.SetStateAction<string>>;
    address: string;
    setAddress: React.Dispatch<React.SetStateAction<string>>;
    photoPreview: string | null;
    setPhotoPreview: React.Dispatch<React.SetStateAction<string | null>>;
    file: File | null;
    setFile: React.Dispatch<React.SetStateAction<File | null>>;
    saving: boolean;
    progress: number | null;
    errorMsg: string | null;
    errorStack: string | null;
    loading: boolean;
    successMsg: string | null;
    handleFile: (e: React.ChangeEvent<HTMLInputElement>) => void;
    handleSave: () => Promise<void>;
};

// PageContent component to be used inside Suspense
function PageContent({
    nameInputRef,
    name,
    setName,
    email,
    setEmail,
    phone,
    setPhone,
    address,
    setAddress,
    photoPreview,
    setPhotoPreview,
    file,
    setFile,
    saving,
    progress,
    errorMsg,
    errorStack,
    loading,
    successMsg,
    handleFile,
    handleSave
}: PageContentProps) {
    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
                    <div style={{ color: '#666', fontSize: '18px' }}>Loading your profile...</div>
                </div>
            </div>
        );
    }
    return (
        <div style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '100vh',
            width: '100vw',
            padding: '20px',
            background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)',
            boxSizing: 'border-box'
        }}>
            <div style={{ width: '96%', maxWidth: '50vw' }}>
                <div style={{ borderRadius: 8, overflow: 'hidden', boxShadow: '0 4px 12px rgba(0,0,0,.1)', background: '#fff' }}>
                    <div style={{ position: 'relative', background: '#555', height: 150, display: 'flex', justifyContent: 'center', alignItems: 'flex-end' }}>
                        <div style={{ position: 'absolute', top: 15, left: 20, fontSize: 24, color: '#fff', backgroundColor: 'rgba(0,0,0,0.3)', padding: 6, borderRadius: 5 }}>NammaKarya</div>
                        <div style={{ marginBottom: -70, zIndex: 10, position: 'relative' }}>
                            <img
                                src={photoPreview || 'https://i.ibb.co/L8B8YgW/placeholder-profile.png'}
                                alt="Profile"
                                style={{
                                    width: 140,
                                    height: 140,
                                    borderRadius: '50%',
                                    objectFit: 'cover',
                                    border: '5px solid #fff',
                                    boxShadow: '0 4px 20px rgba(0,0,0,.3)'
                                }}
                            />
                            <label htmlFor="profile-upload-icon" style={{
                                position: 'absolute',
                                bottom: 5,
                                right: 5,
                                backgroundColor: '#F1B902',
                                borderRadius: '50%',
                                width: 35,
                                height: 35,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 8px rgba(0,0,0,.2)'
                            }}>
                                <span style={{ color: 'white', fontSize: '18px' }}>📷</span>
                            </label>
                            <input
                                id="profile-upload-icon"
                                type="file"
                                accept="image/*"
                                onChange={handleFile}
                                style={{ display: 'none' }}
                            />
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

                        <div style={{ marginTop: 20, display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <label htmlFor="profile-upload" style={{
                                    padding: '10px 16px',
                                    background: file ? '#34d399' : '#F1B902',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 6,
                                    boxShadow: file ? '0 2px 8px rgba(52, 211, 153, 0.3)' : '0 2px 8px rgba(241, 185, 2, 0.3)',
                                    transition: 'all 0.3s'
                                }}>
                                    {file ? '✅ Photo Selected' : '📷 Choose Photo'}
                                </label>
                                <input
                                    id="profile-upload"
                                    type="file"
                                    accept="image/*"
                                    onChange={handleFile}
                                    style={{ display: 'none' }}
                                />
                                {file && <span style={{ fontSize: '12px', color: '#666', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{file.name}</span>}
                            </div>
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                style={{
                                    padding: '10px 20px',
                                    background: saving ? '#94a3b8' : '#10b981',
                                    color: '#fff',
                                    border: 'none',
                                    borderRadius: 8,
                                    cursor: saving ? 'not-allowed' : 'pointer',
                                    fontSize: '14px',
                                    fontWeight: 600,
                                    boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                                    transition: 'all 0.3s'
                                }}
                            >
                                {saving ? '💾 Saving...' : '💾 Save Profile'}
                            </button>
                        </div>

                        {progress !== null && (
                            <div style={{ marginTop: 12, padding: 8, background: '#e0f2fe', border: '1px solid #0288d1', borderRadius: 6, textAlign: 'center' }}>
                                <div style={{ color: '#0288d1', fontSize: '14px' }}>Uploading: {progress}%</div>
                            </div>
                        )}

                        {successMsg && (
                            <div style={{ marginTop: 12, padding: 10, background: '#e8f5e8', border: '1px solid #4caf50', borderRadius: 6 }}>
                                <div style={{ fontWeight: 700, color: '#2e7d32', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    ✅ {successMsg}
                                </div>
                            </div>
                        )}

                        {errorMsg && (
                            <div style={{ marginTop: 12, padding: 10, background: '#fee', border: '1px solid #fbb', borderRadius: 6 }}>
                                <div style={{ fontWeight: 700, color: '#900', display: 'flex', alignItems: 'center', gap: 8 }}>
                                    ❌ Save Error
                                </div>
                                <div style={{ color: '#300', marginTop: 4 }}>{errorMsg}</div>
                                {errorStack && <details style={{ marginTop: 8 }}><summary>Stack</summary><pre style={{ whiteSpace: 'pre-wrap' }}>{errorStack}</pre></details>}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}




import React, { useState, useEffect, useRef } from "react";
import { auth, db, storage, storageBucketName } from "../../lib/firebase";
import { collection, doc, setDoc, addDoc, serverTimestamp, getDoc, onSnapshot } from "firebase/firestore";
import { ref as storageRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// We persist profile updates to Firestore only; avoid updating Auth profile here.

export default function HireMyProfilePage() {
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
    const [loading, setLoading] = useState(true);
    const [successMsg, setSuccessMsg] = useState<string | null>(null);

    function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files && e.target.files[0];
        if (f) {
            setFile(f);
            setPhotoPreview(URL.createObjectURL(f));
        }
    }

    // No editParam logic, just keep useEffect for mount
    useEffect(() => {
        // No editParam logic
    }, []);

    // Load user profile data when component mounts
    useEffect(() => {
        let unsubscribe: (() => void) | null = null;

        const loadUserProfile = () => {
            const user = auth.currentUser;
            if (user && user.uid) {
                const userDocRef = doc(db, "users", user.uid);

                // Set up real-time listener for user profile
                unsubscribe = onSnapshot(userDocRef, (docSnap) => {
                    if (docSnap.exists()) {
                        const userData = docSnap.data();
                        setName(userData.name || "");
                        setEmail(userData.email || user.email || "");
                        setPhone(userData.phone || "");
                        setAddress(userData.address || "");
                        if (userData.photoURL) {
                            setPhotoPreview(userData.photoURL);
                        }
                    } else {
                        // If no document exists, pre-fill email from auth
                        setEmail(user.email || "");
                    }
                    setLoading(false);
                }, (error) => {
                    console.warn("Error loading user profile:", error);
                    // Pre-fill email from auth even if doc doesn't exist
                    setEmail(user.email || "");
                    setLoading(false);
                });
            } else {
                setLoading(false);
            }
        };

        // Listen for auth state changes
        const unsubscribeAuth = auth.onAuthStateChanged((user) => {
            if (user) {
                loadUserProfile();
            } else {
                setLoading(false);
            }
        });

        return () => {
            if (unsubscribe) unsubscribe();
            unsubscribeAuth();
        };
    }, []);

    async function handleSave() {
        setSaving(true);
        setProgress(null);
        setErrorMsg(null);
        setSuccessMsg(null);
        setErrorStack(null);

        console.log('🔄 Starting save process...');

        try {
            const user = auth.currentUser;

            if (!user) {
                console.log('❌ No user authenticated');
                setErrorMsg('Please sign in to save your profile');
                setSaving(false);
                return;
            }

            console.log('✅ User authenticated:', user.uid);

            // Use users/{uid} for authenticated users
            const docRef = doc(db, "users", user.uid);
            console.log('📝 Saving to document:', `users/${user.uid}`);

            let photoURL: string | null = photoPreview; // Keep existing photo if no new file

            // Upload new photo if a file was selected
            if (file) {
                console.log('📸 Uploading photo:', file.name);
                const path = `profilePhotos/${user.uid}/${file.name}`;
                const sRef = storageRef(storage, path);
                const uploadTask = uploadBytesResumable(sRef, file);

                await new Promise<void>((resolve, reject) => {
                    uploadTask.on("state_changed", (snap) => {
                        const pct = Math.round((snap.bytesTransferred / snap.totalBytes) * 100);
                        setProgress(pct);
                        console.log(`📤 Upload progress: ${pct}%`);
                    }, (err) => {
                        console.error('❌ Upload error:', err);
                        reject(err);
                    }, async () => {
                        photoURL = await getDownloadURL(uploadTask.snapshot.ref);
                        console.log('✅ Photo uploaded successfully:', photoURL);
                        setPhotoPreview(photoURL); // Update preview with uploaded URL
                        resolve();
                    });
                });
            }

            const payload: any = {
                name: name || null,
                email: email || null,
                phone: phone || null,
                address: address || null,
                updatedAt: serverTimestamp(),
            };

            // Only update photoURL if we have a valid URL
            if (photoURL) {
                payload.photoURL = photoURL;
            }

            // Persist profile to Firestore with additional metadata
            payload.lastSavedBy = user.uid;
            payload.uid = user.uid;
            payload.email = user.email || null;
            payload.storageBucket = storageBucketName || null;

            console.log('💾 Saving payload to Firestore:', payload);

            await setDoc(docRef, payload, { merge: true });

            console.log('✅ Profile saved successfully!');

            // Clear the file input after successful save
            setFile(null);

            setSuccessMsg("Saved successfully!");
            // Auto-clear success message after 3 seconds
            setTimeout(() => setSuccessMsg(null), 3000);
        } catch (e: any) {
            // Log full error for debugging
            console.error("❌ Save failed:", e);
            const msg = e?.message || String(e) || 'Unknown error';
            const stack = e?.stack || null;
            setErrorMsg(msg);
            setErrorStack(stack);
            // Also show alert for visibility
            alert("Save failed: " + msg + "\n\nCheck the browser console for details.");
        } finally {
            setSaving(false);
            setProgress(null);
        }
    }

    if (loading) {
        return (
            <div style={{
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                minHeight: '100vh',
                background: 'linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%)'
            }}>
                <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: '24px', marginBottom: '16px' }}>🔄</div>
                    <div style={{ color: '#666', fontSize: '18px' }}>Loading your profile...</div>
                </div>
            </div>
        );
    }

    return (
        <PageContent
            nameInputRef={nameInputRef}
            name={name}
            setName={setName}
            email={email}
            setEmail={setEmail}
            phone={phone}
            setPhone={setPhone}
            address={address}
            setAddress={setAddress}
            photoPreview={photoPreview}
            setPhotoPreview={setPhotoPreview}
            file={file}
            setFile={setFile}
            saving={saving}
            progress={progress}
            errorMsg={errorMsg}
            errorStack={errorStack}
            loading={loading}
            successMsg={successMsg}
            handleFile={handleFile}
            handleSave={handleSave}
        />
    );
}
