"use client";

import React, { useEffect, useState, useRef } from "react";
import { db, auth, storage } from "../../lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";
import { ref as sRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { onAuthStateChanged } from "firebase/auth";
import SeekerSidebar from "../../components/SeekerSidebar";

export default function SeekerProfilePage() {
    const [user, setUser] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form fields
    const [fullName, setFullName] = useState("");
    const [email, setEmail] = useState("");
    const [phone, setPhone] = useState("");
    const [street, setStreet] = useState("");
    const [city, setCity] = useState("");
    const [postal, setPostal] = useState("");
    const [country, setCountry] = useState("");
    const [position, setPosition] = useState("");
    const [jobType, setJobType] = useState("");
    const [resumeLink, setResumeLink] = useState("");
    const [profilePicUrl, setProfilePicUrl] = useState("https://via.placeholder.com/100/ADD8E6/000000?text=PHOTO");
    const [photoFile, setPhotoFile] = useState<File | null>(null);

    const [successMessage, setSuccessMessage] = useState("");
    const [errorMessage, setErrorMessage] = useState("");

    const fileInputRef = useRef<HTMLInputElement>(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                setEmail(currentUser.email || "");
                await loadProfile(currentUser.uid);
            } else {
                setUser(null);
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []); async function loadProfile(userId: string) {
        try {
            const profileRef = doc(db, "seekerprofile", userId);
            const profileSnap = await getDoc(profileRef);

            if (profileSnap.exists()) {
                const data = profileSnap.data();
                setFullName(data.name || "");
                setEmail(data.email || "");
                setPhone(data.phone || "");
                setStreet(data.street || "");
                setCity(data.city || "");
                setPostal(data.postalCode || "");
                setCountry(data.country || "");
                setPosition(data.position || "");
                setJobType(data.jobType || "");
                setResumeLink(data.resumeUrl || "");
                if (data.photoUrl) {
                    setProfilePicUrl(data.photoUrl);
                }
            }
        } catch (error) {
            console.error("Error loading profile:", error);
            setErrorMessage("Failed to load profile data");
        } finally {
            setLoading(false);
        }
    }

    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0];
        if (file) {
            setPhotoFile(file);
            // Preview the image
            const reader = new FileReader();
            reader.onload = (event) => {
                setProfilePicUrl(event.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault();

        if (!user) {
            setErrorMessage("Please sign in to save your profile");
            return;
        }

        setSuccessMessage("");
        setErrorMessage("");
        setSaving(true);

        try {
            let uploadedPhotoUrl = profilePicUrl;

            // Upload photo if a new one was selected
            if (photoFile) {
                const photoPath = `profilePhotos/${user.uid}/${Date.now()}_${photoFile.name}`;
                const photoRef = sRef(storage, photoPath);

                const uploadTask = uploadBytesResumable(photoRef, photoFile);

                await new Promise<void>((resolve, reject) => {
                    uploadTask.on(
                        'state_changed',
                        (snapshot) => {
                            const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                            console.log('Upload progress:', progress);
                        },
                        (error) => {
                            console.error('Upload error:', error);
                            reject(error);
                        },
                        async () => {
                            try {
                                uploadedPhotoUrl = await getDownloadURL(uploadTask.snapshot.ref);
                                resolve();
                            } catch (error) {
                                reject(error);
                            }
                        }
                    );
                });
            }

            // Save to Firestore
            const profileRef = doc(db, "seekerprofile", user.uid);
            await setDoc(profileRef, {
                name: fullName,
                email: email,
                phone: phone,
                street: street,
                city: city,
                postalCode: postal,
                country: country,
                position: position,
                jobType: jobType,
                resumeUrl: resumeLink,
                photoUrl: uploadedPhotoUrl,
                createdBy: user.uid,
                updatedAt: serverTimestamp(),
            }, { merge: true });

            setProfilePicUrl(uploadedPhotoUrl);
            setSuccessMessage("✓ Profile saved successfully!");
            setPhotoFile(null);

            // Clear success message after 3 seconds
            setTimeout(() => setSuccessMessage(""), 3000);
        } catch (error: any) {
            console.error("Error saving profile:", error);
            setErrorMessage(error.message || "Failed to save profile. Please try again.");
        } finally {
            setSaving(false);
        }
    }

    if (loading) {
        return (
            <div style={{
                fontFamily: "'Roboto', sans-serif",
                padding: "50px",
                textAlign: "center",
                backgroundColor: "#eef3f7",
                minHeight: "100vh"
            }}>
                <h2>Loading your profile...</h2>
            </div>
        );
    }

    if (!user) {
        return (
            <div style={{
                fontFamily: "'Roboto', sans-serif",
                padding: "50px",
                textAlign: "center",
                backgroundColor: "#eef3f7",
                minHeight: "100vh"
            }}>
                <h2>Please sign in to view and edit your profile</h2>
            </div>
        );
    }

    return (
        <>
            <style>{`
                /* --- General Setup --- */
                :root{--color-primary:#34d399;--color-secondary:#0f172a;--color-bg-light:#f8fafc;--color-card-bg:#ffffff;--color-text-subtle:#64748b;--color-gray-border:#e2e8f0}
                *{box-sizing:border-box;margin:0;padding:0}
                body {
                    font-family: 'Roboto', sans-serif;
                    background-color: #eef3f7;
                    margin: 0;
                }

                .dashboard-container{display:grid;grid-template-columns:250px 1fr;min-height:100vh}
                .sidebar{background-color:var(--color-card-bg);padding:20px;border-right:1px solid var(--color-gray-border);display:flex;flex-direction:column}
                .logo{font-size:1.5rem;font-weight:700;margin-bottom:30px;color:var(--color-secondary);display:flex;align-items:center}
                .logo-dot{width:10px;height:10px;background-color:var(--color-primary);border-radius:50%;margin-right:5px}
                .user-profile{display:flex;align-items:center;margin-bottom:30px}
                .user-profile img{width:45px;height:45px;border-radius:50%;margin-right:10px}
                .user-profile-info span{display:block;font-size:.9rem;color:var(--color-text-subtle)}
                .nav-link{display:flex;align-items:center;padding:12px 15px;margin:5px 0;border-radius:8px;color:var(--color-secondary);text-decoration:none;transition:background-color .2s}
                .nav-link:hover{background-color:var(--color-bg-light)}
                .nav-link.active{background-color:var(--color-primary);color:white;font-weight:600}
                .nav-icon{margin-right:15px;font-size:1.1rem;color:var(--color-text-subtle);width:20px;text-align:center}
                .logout{margin-top:20px;color:var(--color-text-subtle);text-decoration:none;display:flex;align-items:center;font-size:.9rem}

                .profile-wrapper {
                    width: 100%;
                    background-color: #eef3f7;
                    min-height: 100vh;
                    padding: 50px 20px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-start;
                }

                /* --- Individual Profile Card (Max Width Set) --- */
                .profile-card {
                    width: 100%;
                    max-width: 400px;
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.08);
                    overflow: hidden;
                }

                .profile-header {
                    position: relative;
                    background-color: #5a7d9f;
                    background-image: linear-gradient(135deg, #5a7d9f 0%, #7ba3c7 100%);
                    background-size: cover;
                    background-position: center;
                    height: 120px;
                    display: flex;
                    justify-content: center;
                    align-items: flex-end;
                }

                .profile-picture-container {
                    position: absolute;
                    bottom: -50px;
                    border-radius: 50%;
                    border: 5px solid #ffffff;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
                    z-index: 1;
                }

                .profile-picture {
                    width: 100px;
                    height: 100px;
                    border-radius: 50%;
                    object-fit: cover;
                    display: block;
                }

                .profile-content {
                    padding: 70px 25px 25px 25px;
                    text-align: center;
                }

                .profile-name {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 15px;
                }

                /* --- Information Group Styling --- */
                .profile-info-group {
                    text-align: left;
                    margin-top: 25px;
                    border-top: 1px solid #eee;
                    padding-top: 20px;
                }

                .profile-info-group:first-of-type {
                    border-top: none;
                    padding-top: 0;
                    margin-top: 0;
                }

                .info-title {
                    font-size: 1.1rem;
                    font-weight: 500;
                    color: #555;
                    margin-bottom: 10px;
                }

                .info-item {
                    display: flex;
                    margin-bottom: 8px;
                    font-size: 0.95rem;
                }

                .info-label {
                    font-weight: 500;
                    color: #777;
                    width: 120px;
                    flex-shrink: 0;
                }

                .info-value {
                    color: #333;
                    flex-grow: 1;
                }

                .info-value.email,
                .info-value.url {
                    color: #007bff;
                    text-decoration: none;
                }

                .info-value.email:hover,
                .info-value.url:hover {
                    text-decoration: underline;
                }

                /* --- Input Field Styles --- */
                .profile-form input[type="text"],
                .profile-form input[type="email"],
                .profile-form input[type="tel"],
                .profile-form input[type="url"],
                .profile-form input[type="file"] {
                    width: 100%;
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 0.95rem;
                    font-family: 'Roboto', sans-serif;
                    color: #333;
                    background-color: #fff;
                    box-sizing: border-box;
                    transition: border-color 0.2s;
                }

                .profile-form input:focus {
                    outline: none;
                    border-color: #007bff;
                }

                .info-input-wrapper {
                    flex-grow: 1;
                }

                .profile-name-input {
                    width: 100%;
                    padding: 10px;
                    font-size: 1.8rem;
                    font-weight: 700;
                    text-align: center;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    margin-bottom: 15px;
                }

                .save-btn {
                    width: 100%;
                    padding: 12px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 1rem;
                    font-weight: 500;
                    cursor: pointer;
                    margin-top: 20px;
                    transition: background-color 0.2s;
                }

                .save-btn:hover {
                    background-color: #0056b3;
                }

                .save-btn:disabled {
                    background-color: #6c757d;
                    cursor: not-allowed;
                }

                .file-upload-label {
                    display: inline-block;
                    padding: 6px 12px;
                    background-color: #f0f0f0;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    cursor: pointer;
                    font-size: 0.9rem;
                    transition: background-color 0.2s;
                }

                .file-upload-label:hover {
                    background-color: #e0e0e0;
                }

                .message {
                    padding: 10px;
                    border-radius: 5px;
                    margin-bottom: 15px;
                    text-align: center;
                }

                .success-message {
                    background-color: #d4edda;
                    color: #155724;
                    border: 1px solid #c3e6cb;
                }

                .error-message {
                    background-color: #f8d7da;
                    color: #721c24;
                    border: 1px solid #f5c6cb;
                }
            `}</style>

            <div className="dashboard-container">
                <SeekerSidebar activePage="profile" />

                {/* Main Content */}
                <div className="profile-wrapper">
                    <div className="profile-card">
                        <div className="profile-header">
                            <div className="profile-picture-container">
                                <img
                                    src={profilePicUrl}
                                    alt="Profile Picture"
                                    className="profile-picture"
                                />
                            </div>
                        </div>

                        <div className="profile-content">
                            {successMessage && (
                                <div className="message success-message">
                                    {successMessage}
                                </div>
                            )}

                            {errorMessage && (
                                <div className="message error-message">
                                    {errorMessage}
                                </div>
                            )}

                            <form className="profile-form" onSubmit={handleSubmit}>
                                <input
                                    type="text"
                                    className="profile-name-input"
                                    placeholder="Enter Your Full Name"
                                    value={fullName}
                                    onChange={(e) => setFullName(e.target.value)}
                                    required
                                />

                                <div className="profile-info-group">
                                    <h3 className="info-title">Contact Information</h3>
                                    <div className="info-item">
                                        <span className="info-label">Email:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="email"
                                                placeholder="youremail@example.com"
                                                value={email}
                                                onChange={(e) => setEmail(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Phone:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="tel"
                                                placeholder="(XXX) XXX-XXXX"
                                                value={phone}
                                                onChange={(e) => setPhone(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-info-group">
                                    <h3 className="info-title">Address</h3>
                                    <div className="info-item">
                                        <span className="info-label">Street:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="123 Your Street"
                                                value={street}
                                                onChange={(e) => setStreet(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">City/Region:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="Your City, Your State/Region"
                                                value={city}
                                                onChange={(e) => setCity(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Postal Code:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="P0ST C0D3"
                                                value={postal}
                                                onChange={(e) => setPostal(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Country:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="Your Country"
                                                value={country}
                                                onChange={(e) => setCountry(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="profile-info-group">
                                    <h3 className="info-title">Job Preferences</h3>
                                    <div className="info-item">
                                        <span className="info-label">Desired Position:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="Target Job Title (e.g., Data Analyst)"
                                                value={position}
                                                onChange={(e) => setPosition(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Job Type:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="text"
                                                placeholder="Full-time / Remote / Contract"
                                                value={jobType}
                                                onChange={(e) => setJobType(e.target.value)}
                                                required
                                            />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Resume/CV:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="url"
                                                placeholder="https://yourresume.com/link (Optional)"
                                                value={resumeLink}
                                                onChange={(e) => setResumeLink(e.target.value)}
                                            />
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <span className="info-label">Profile Photo:</span>
                                        <div className="info-input-wrapper">
                                            <input
                                                type="file"
                                                ref={fileInputRef}
                                                accept="image/*"
                                                onChange={handlePhotoChange}
                                                style={{ display: 'none' }}
                                            />
                                            <label
                                                htmlFor="photoUpload"
                                                className="file-upload-label"
                                                onClick={() => fileInputRef.current?.click()}
                                            >
                                                Choose Photo
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" className="save-btn" disabled={saving}>
                                    {saving ? "Saving..." : "Save Profile"}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
}
