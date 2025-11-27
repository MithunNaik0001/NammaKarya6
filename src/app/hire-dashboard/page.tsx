"use client";

import React, { useEffect, useState } from "react";
import Link from 'next/link';
import { auth, db, storage, storageBucketName } from "../../lib/firebase";
import { doc, setDoc, serverTimestamp, collection, query, where, getDocs } from "firebase/firestore";
import { ref as sRef, uploadBytesResumable, getDownloadURL } from "firebase/storage";
// Note: we no longer call `updateProfile` on the Auth user here; profile changes
// are persisted to Firestore only to avoid requiring auth updates from the client.

type Stats = {
    postedJobs: number | string;
    shortlisted: number | string;
    application: number | string;
    savedCandidates: number | string;
};


type Job = {
    id: string;
    title: string;
    meta?: string;
    logoChar?: string;
    logoClass?: string;
};

export default function HireDashboardPage() {
    // Toggle to disable dashboard API calls (prevents 404s when backend not implemented)
    // There are two levels: an environment flag and an explicit in-UI enable switch.
    // This prevents accidental calls even if env var was set.
    const ENV_ENABLE = (process.env.NEXT_PUBLIC_ENABLE_DASHBOARD_API === 'true') || false;
    const [allowApi, setAllowApi] = useState<boolean>(false); // must be enabled in UI to allow calls
    const ENABLE_DASHBOARD_API = ENV_ENABLE && allowApi;
    // Profile editing state
    const [editingProfile, setEditingProfile] = useState(false);
    const [profileName, setProfileName] = useState<string>("Jony Rio");
    const [profileMenuLabel, setProfileMenuLabel] = useState<string>("Menu");
    const [photoFile, setPhotoFile] = useState<File | null>(null);
    const [photoPreview, setPhotoPreview] = useState<string | null>(null);
    const [savingProfile, setSavingProfile] = useState(false);
    const [profileError, setProfileError] = useState<string | null>(null);
    const [profileSuccess, setProfileSuccess] = useState<string | null>(null);
    const nameInputRef = React.useRef<HTMLInputElement | null>(null);

    // When entering edit mode, focus the name input so the user can type immediately.
    useEffect(() => {
        if (editingProfile) {
            setTimeout(() => {
                nameInputRef.current?.focus();
            }, 50);
        }
    }, [editingProfile]);

    useEffect(() => {
        // initialize from auth user if available
        const user = auth.currentUser;
        if (user) {
            if (user.displayName) setProfileName(user.displayName);
            if ((user as any).menuLabel) setProfileMenuLabel((user as any).menuLabel);
            if (user.photoURL) setPhotoPreview(user.photoURL);
        }
    }, []);

    function handleFileChange(e: React.ChangeEvent<HTMLInputElement>) {
        const f = e.target.files && e.target.files[0];
        if (f) {
            setPhotoFile(f);
            setPhotoPreview(URL.createObjectURL(f));
        }
    }

    async function saveProfile() {
        setProfileError(null);
        setProfileSuccess(null);
        const user = auth.currentUser;
        if (!user) {
            setProfileError("You must be signed in to save profile changes.");
            return;
        }
        setSavingProfile(true);
        try {
            let photoURL: string | undefined = undefined;
            if (photoFile) {
                const path = `profilePhotos/${user.uid}/${Date.now()}_${photoFile.name}`;
                const ref = sRef(storage, path);
                try {
                    // Use a resumable upload so we can get progress and better error handling
                    const uploadTask = uploadBytesResumable(ref, photoFile);
                    await new Promise<void>((resolve, reject) => {
                        const unsubscribe = uploadTask.on(
                            'state_changed',
                            (snapshot) => {
                                // optional: report progress to console or UI
                                const pct = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
                                // console.debug(`Upload is ${pct}% done`);
                            },
                            (err) => {
                                unsubscribe();
                                console.error('Resumable upload error:', err);
                                reject(err);
                            },
                            async () => {
                                try {
                                    photoURL = await getDownloadURL(uploadTask.snapshot.ref);
                                    unsubscribe();
                                    resolve();
                                } catch (e) {
                                    unsubscribe();
                                    reject(e);
                                }
                            }
                        );
                    });
                } catch (uploadErr: any) {
                    console.error("Upload error:", uploadErr);
                    // Surface specific Storage error codes to help debugging
                    const code = uploadErr?.code || uploadErr?.name || 'unknown';
                    throw new Error(`Photo upload failed: ${uploadErr?.message || uploadErr} (code: ${code})`);
                }
            }

            // update Firestore user doc with richer details
            const userDocRef = doc(db, "users", user.uid);
            try {
                await setDoc(
                    userDocRef,
                    {
                        name: profileName,
                        menuLabel: profileMenuLabel,
                        photoURL: photoURL || null,
                        email: user.email || null,
                        lastSavedBy: user.uid,
                        storageBucket: storageBucketName || null,
                        updatedAt: serverTimestamp(),
                    },
                    { merge: true }
                );
            } catch (fsErr: any) {
                console.error("Firestore error:", fsErr);
                throw new Error("Saving user profile to Firestore failed: " + (fsErr?.message || fsErr));
            }

            setEditingProfile(false);
            setProfileSuccess("Profile saved successfully.");
        } catch (err: any) {
            console.error(err);
            setProfileError(err?.message ? String(err.message) : "Failed to save profile. Try again.");
        } finally {
            setSavingProfile(false);
        }
    }
    const [stats, setStats] = useState<Stats>({
        postedJobs: "-",
        shortlisted: "-",
        application: "-",
        savedCandidates: "-",
    });

    const [jobViews, setJobViews] = useState<number[]>([]);
    const [jobs, setJobs] = useState<Job[]>([]);

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [manualFetch, setManualFetch] = useState(false);
    const [unreadCount, setUnreadCount] = useState(0);

    // Fetch unread notifications count
    useEffect(() => {
        const fetchUnreadCount = async () => {
            const user = auth.currentUser;
            if (!user) return;

            try {
                const q = query(
                    collection(db, "notifications"),
                    where("recipientId", "==", user.uid),
                    where("read", "==", false)
                );
                const snapshot = await getDocs(q);
                setUnreadCount(snapshot.size);
            } catch (err) {
                console.error("Error fetching notifications:", err);
            }
        };

        fetchUnreadCount();
        // Refresh every 30 seconds
        const interval = setInterval(fetchUnreadCount, 30000);
        return () => clearInterval(interval);
    }, []);

    // fetchAll is defined outside the effect so it can be called manually (Refresh button)
    const fetchAll = async () => {
        // If APIs are disabled, don't make any network requests (prevents 404s)
        if (!ENABLE_DASHBOARD_API) {
            setError('Dashboard API is disabled. Enable `NEXT_PUBLIC_ENABLE_DASHBOARD_API` to fetch data.');
            setLoading(false);
            return;
        }

        setLoading(true);
        setError(null);
        const controller = new AbortController();
        const signal = controller.signal;
        // safety timeout to avoid hanging loader
        const timeout = setTimeout(() => controller.abort(), 15000); // 15s
        try {
            // Fetch stats
            const statsRes = await fetch("/api/dashboard/stats", { signal });
            if (statsRes.ok) {
                const j = await statsRes.json();
                if (j) setStats(j);
            }

            // Fetch job views (for chart)
            const viewsRes = await fetch("/api/dashboard/jobviews", { signal });
            if (viewsRes.ok) {
                const v = await viewsRes.json();
                if (Array.isArray(v)) setJobViews(v);
            }

            // Fetch jobs list
            const jobsRes = await fetch("/api/dashboard/jobs", { signal });
            if (jobsRes.ok) {
                const js = await jobsRes.json();
                if (Array.isArray(js)) setJobs(js);
            }
        } catch (err: any) {
            console.error(err);
            if (err.name === 'AbortError') {
                setError('Request timed out. Please try again.');
            } else {
                setError('Failed to load dashboard data');
            }
        } finally {
            clearTimeout(timeout);
            setLoading(false);
        }
    };

    useEffect(() => {
        // no automatic fetch: data will load only when user clicks Refresh
    }, []);

    return (
        <div>
            <style>{`
				:root{--color-primary:#34d399;--color-secondary:#0f172a;--color-bg-light:#f8fafc;--color-card-bg:#ffffff;--color-text-subtle:#64748b;--color-gray-border:#e2e8f0;--color-stat-1:#dcfce7;--color-stat-2:#fffbeb;--color-stat-3:#fef2f2;--color-stat-4:#f0fdf4;--color-stat-icon-1:#84cc16;--color-stat-icon-2:#fbbf24;--color-stat-icon-3:#f43f5e;--color-stat-icon-4:#22c55e}
				*{box-sizing:border-box;margin:0;padding:0}
				body{font-family:Arial,sans-serif;background-color:var(--color-bg-light);color:var(--color-secondary)}
				.icon{display:inline-flex;justify-content:center;align-items:center;font-size:1.2rem;font-weight:bold;border-radius:50%;width:40px;height:40px}
				.icon-sm{width:30px;height:30px;font-size:.8rem}
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
				.profile-complete{margin-top:auto;padding-top:20px;font-size:.85rem;color:var(--color-text-subtle)}
				.progress-bar-container{height:8px;background-color:var(--color-gray-border);border-radius:4px;margin-top:5px}
				.progress-bar{width:87%;height:100%;background-color:var(--color-primary);border-radius:4px}
				.logout{margin-top:20px;color:var(--color-text-subtle);text-decoration:none;display:flex;align-items:center;font-size:.9rem}
				.main-content{padding:30px}
				.top-header{display:flex;justify-content:space-between;align-items:center;padding-bottom:20px}
				.nav-links{display:flex}
				.nav-links a{text-decoration:none;color:var(--color-secondary);margin-right:25px;font-weight:500}
				.nav-links a:hover{color:var(--color-primary)}
				.search-area{display:flex;align-items:center}
				.search-input{padding:10px 15px;border:1px solid var(--color-gray-border);border-radius:8px;margin-right:15px;width:250px}
				.notification-bell{position:relative;margin-right:15px;cursor:pointer;background:none;border:none;font-size:1.5rem;padding:8px;border-radius:50%;transition:background-color .2s}
				.notification-bell:hover{background-color:var(--color-bg-light)}
				.notification-badge{position:absolute;top:5px;right:5px;background-color:#ef4444;color:white;font-size:0.7rem;font-weight:700;padding:2px 6px;border-radius:10px;min-width:18px;text-align:center}
				.post-job-btn{background-color:var(--color-primary);color:white;padding:10px 20px;border:none;border-radius:8px;cursor:pointer;font-weight:600;display:flex;align-items:center}
				.post-job-btn::before{content:'+';font-size:1.2rem;margin-right:5px}
				.dashboard-body h2{font-size:1.8rem;margin-bottom:20px}
				.stats-grid{display:flex;gap:20px;margin-bottom:30px}
				.stat-card{background-color:var(--color-card-bg);padding:20px;border-radius:12px;flex:1;box-shadow:0 4px 6px -1px rgba(0,0,0,.05);display:flex;flex-direction:column;justify-content:space-between;min-height:120px}
				.stat-number{font-size:2rem;font-weight:700;color:var(--color-secondary);margin-bottom:5px}
				.stat-icon{background-color:var(--color-stat-1);color:var(--color-stat-icon-1);float:right}
				.panels-grid{display:grid;grid-template-columns:2fr 1.2fr;gap:20px}
				.job-views-panel{background-color:var(--color-card-bg);padding:20px;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05)}
				.job-views-header{display:flex;justify-content:space-between;align-items:center;margin-bottom:20px}
				.time-tabs{margin:20px 0;border-bottom:1px solid var(--color-gray-border);padding-bottom:5px;display:flex;font-size:.9rem}
				.time-tabs button{background:none;border:none;padding:5px 15px;margin-right:5px;cursor:pointer;color:var(--color-text-subtle);font-weight:500;border-radius:6px 6px 0 0}
				.time-tabs button.active{background-color:var(--color-bg-light);border-bottom:2px solid var(--color-primary);color:var(--color-primary)}
				.chart-area{height:250px;position:relative;background:linear-gradient(to top,var(--color-bg-light) 1px,transparent 1px);background-size:100% 50px;display:flex;align-items:flex-end;justify-content:space-around;padding-bottom:20px}
				.chart-y-axis{position:absolute;left:0;top:0;height:100%;width:30px;font-size:.75rem;color:var(--color-text-subtle)}
				.chart-x-axis{display:flex;justify-content:space-between;width:100%;position:absolute;bottom:0;padding:0 5%;font-size:.8rem;color:var(--color-text-subtle)}
				.chart-line-placeholder{position:absolute;width:85%;height:150px;bottom:20px;left:5%;background:linear-gradient(135deg,transparent 0%,transparent 10%,rgba(52,211,153,.3) 10%,rgba(52,211,153,.3) 25%,transparent 25%,transparent 35%,rgba(52,211,153,.3) 35%,rgba(52,211,153,.3) 50%,transparent 50%,transparent 60%,rgba(52,211,153,.3) 60%,rgba(52,211,153,.3) 75%,transparent 75%,transparent 85%,rgba(52,211,153,.3) 85%,rgba(52,211,153,.3) 100%);border:2px solid var(--color-primary);border-top-left-radius:5px;border-top-right-radius:5px;opacity:.7;clip-path:polygon(0 100%,10% 70%,25% 90%,35% 50%,50% 75%,60% 40%,75% 65%,85% 55%,100% 80%,100% 100%,0 100%)}
				.posted-job-panel{background-color:var(--color-card-bg);padding:20px;border-radius:12px;box-shadow:0 4px 6px -1px rgba(0,0,0,.05)}
				.job-item{display:flex;align-items:center;justify-content:space-between;padding:15px 0;border-bottom:1px solid var(--color-gray-border)}
				.company-logo{width:40px;height:40px;border-radius:50%;background-color:var(--color-bg-light);margin-right:15px;display:flex;justify-content:center;align-items:center;font-weight:700;font-size:1.2rem;color:var(--color-text-subtle)}
				.company-logo-a{background-color:#f7f7f7;color:#000;font-size:1.5rem}
				.company-logo-p{background-color:#e0f2fe;color:#0ea5e9;font-size:1.5rem}
				.company-logo-o{background-color:#fff7ed;color:#f97316;font-size:1.5rem}
				.company-logo-a-red{background-color:#fee2e2;color:#ef4444;font-size:1.5rem}
				.company-logo-d{background-color:#f0fdf4;color:#22c55e;font-size:1.5rem}
				.job-title{font-weight:600;color:var(--color-secondary)}
				.job-meta{font-size:.85rem;color:var(--color-text-subtle)}
			`}</style>

            <div>
                <main className="main-content">
                    <header className="top-header">
                        <nav className="nav-links">
                            <a>Home</a>
                            <a>Job</a>
                            <a>Explore</a>
                            <a>Contact</a>
                            <a>Pages</a>
                        </nav>
                        <div className="search-area">
                            <input className="search-input" placeholder="🔍 Search here..." />
                            <Link href="/notifications">
                                <button className="notification-bell" title="Notifications">
                                    🔔
                                    {unreadCount > 0 && (
                                        <span className="notification-badge">{unreadCount}</span>
                                    )}
                                </button>
                            </Link>
                            <button className="post-job-btn">Post a Job</button>
                        </div>
                    </header>

                    <div className="dashboard-body">
                        <h2>Dashboard</h2>

                        {!manualFetch ? (
                            <div style={{ padding: 20, background: "#fff", borderRadius: 8, border: "1px solid var(--color-gray-border)", marginBottom: 20 }}>
                                <strong>Data is not loaded.</strong>
                                <div style={{ marginTop: 8, color: "var(--color-text-subtle)" }}>Click the <em>Refresh</em> button in Posted Job to load stats and jobs.</div>
                            </div>
                        ) : (
                            <div className="stats-grid">
                                <div className="stat-card">
                                    <div className="stat-content">
                                        <div className="stat-number">{stats.postedJobs}</div>
                                        Posted Job
                                    </div>
                                    <span className="icon stat-icon">👨‍💻</span>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-content">
                                        <div className="stat-number">{stats.shortlisted}</div>
                                        Shortlisted
                                    </div>
                                    <span className="icon stat-icon" style={{ backgroundColor: "var(--color-stat-2)", color: "var(--color-stat-icon-2)" }}>✉️</span>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-content">
                                        <div className="stat-number">{stats.application}</div>
                                        Application
                                    </div>
                                    <span className="icon stat-icon" style={{ backgroundColor: "var(--color-stat-4)", color: "var(--color-stat-icon-4)" }}>👀</span>
                                </div>
                                <div className="stat-card">
                                    <div className="stat-content">
                                        <div className="stat-number">{stats.savedCandidates}</div>
                                        Save Candidate
                                    </div>
                                    <span className="icon stat-icon" style={{ backgroundColor: "var(--color-stat-4)", color: "var(--color-stat-icon-4)" }}>✏️</span>
                                </div>
                            </div>
                        )}

                        <div className="panels-grid">
                            <div className="job-views-panel">
                                <h3 style={{ marginBottom: 10 }}>Job Views</h3>
                                <div className="job-views-header">
                                    <select>
                                        <option>Web & Mobile Prototype designer...</option>
                                    </select>
                                </div>

                                <div className="time-tabs">
                                    <button>1h</button>
                                    <button className="active">Day</button>
                                    <button>Week</button>
                                    <button>Month</button>
                                    <button>Year</button>
                                </div>

                                <div className="chart-area">
                                    <div className="chart-y-axis">
                                        <div>300</div>
                                        <div>200</div>
                                        <div>100</div>
                                        <div>0</div>
                                    </div>

                                    {/* Simple visual representation of jobViews */}
                                    <div style={{ position: "absolute", left: "5%", right: "5%", bottom: 20, height: 150 }}>
                                        <div style={{ display: "flex", alignItems: "flex-end", height: "100%", gap: 6 }}>
                                            {jobViews.map((v, i) => (
                                                <div key={i} style={{ flex: 1, height: `${Math.max(6, Math.min(140, v))}px`, background: "rgba(52,211,153,0.45)", borderTopLeftRadius: 4, borderTopRightRadius: 4 }} />
                                            ))}
                                        </div>
                                    </div>

                                    <div className="chart-x-axis">
                                        <span>Sun</span>
                                        <span>Sat</span>
                                        <span>Mon</span>
                                        <span>Tue</span>
                                        <span>Wed</span>
                                        <span>Thu</span>
                                        <span>Fri</span>
                                        <span>Sat</span>
                                    </div>
                                </div>
                            </div>

                            <div className="posted-job-panel">
                                <h3 style={{ marginBottom: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span>Posted Job</span>
                                    <button onClick={() => {
                                        setManualFetch(true);
                                        if (!ENABLE_DASHBOARD_API) {
                                            setError('Dashboard API is disabled. Enable API using the toggle first.');
                                            return;
                                        }
                                        fetchAll();
                                    }} disabled={loading} style={{ marginLeft: 12, padding: '6px 10px', borderRadius: 6, border: '1px solid var(--color-gray-border)', background: loading ? '#f1f5f9' : 'transparent', cursor: loading ? 'default' : 'pointer' }}>
                                        {loading ? 'Refreshing...' : 'Refresh'}
                                    </button>

                                    <button onClick={() => setAllowApi((s) => !s)} style={{ marginLeft: 8, padding: '6px 8px', borderRadius: 6, border: '1px solid var(--color-gray-border)', background: allowApi ? '#dcfce7' : 'transparent', cursor: 'pointer' }}>
                                        {allowApi ? 'API Enabled' : 'Enable API'}
                                    </button>
                                </h3>

                                {manualFetch && loading && <div>Loading jobs...</div>}
                                {manualFetch && error && <div style={{ color: "red" }}>{error}</div>}

                                {jobs.map((job) => (
                                    <div className="job-item" key={job.id}>
                                        <div className="job-details">
                                            <span className={`company-logo ${job.logoClass || "company-logo-a"}`}>{job.logoChar || "A"}</span>
                                            <div>
                                                <div className="job-title">{job.title}</div>
                                                <div className="job-meta">{job.meta}</div>
                                            </div>
                                        </div>
                                        <span className="more-options">...</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </main>
            </div>
        </div>
    );
}