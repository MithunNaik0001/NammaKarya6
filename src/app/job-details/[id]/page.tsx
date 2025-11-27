"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { db } from "../../../lib/firebase";
import { doc, getDoc, collection, query, where, getDocs } from "firebase/firestore";
import SeekerSidebar from "../../../components/SeekerSidebar";

type JobData = {
    searchJob: string;
    numJobs: string;
    minIncome: number | null;
    maxIncome: number | null;
    shift: string;
    jobType: string;
    useCurrentLocation: boolean;
    cityTown: string;
    locality: string;
    createdAt: string;
    createdBy: string;
};

type RequirementData = {
    minimumEducation: string[];
    experience: string[];
    preferredGender: string | null;
    contact: {
        mobile: string | null;
        whatsapp: string | null;
    };
    createdAt: string;
    createdBy?: string;
};

export default function JobDetailsPage() {
    const params = useParams();
    const router = useRouter();
    const jobId = params.id as string;

    const [jobData, setJobData] = useState<JobData | null>(null);
    const [requirements, setRequirements] = useState<RequirementData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        loadJobDetails();
    }, [jobId]);

    async function loadJobDetails() {
        try {
            setLoading(true);

            // Fetch job data from proffessional collection
            const jobDoc = await getDoc(doc(db, "proffessional", jobId));

            if (!jobDoc.exists()) {
                setError("Job not found");
                setLoading(false);
                return;
            }

            const job = jobDoc.data() as JobData;
            setJobData(job);

            // Fetch related requirements from candidate-requermen collection
            // Assuming they share the same createdBy user
            if (job.createdBy) {
                const reqQuery = query(
                    collection(db, "candidate-requermen"),
                    where("createdBy", "==", job.createdBy)
                );

                const reqSnapshot = await getDocs(reqQuery);
                const reqs: RequirementData[] = [];

                reqSnapshot.forEach((doc) => {
                    reqs.push(doc.data() as RequirementData);
                });

                setRequirements(reqs);
            }
        } catch (err) {
            console.error("Error loading job details:", err);
            setError("Failed to load job details");
        } finally {
            setLoading(false);
        }
    }

    function formatIncome(minIncome: number | null, maxIncome: number | null): string {
        if (minIncome && maxIncome) {
            return `₹${minIncome.toLocaleString()} - ₹${maxIncome.toLocaleString()}`;
        } else if (minIncome) {
            return `₹${minIncome.toLocaleString()}+`;
        } else if (maxIncome) {
            return `Up to ₹${maxIncome.toLocaleString()}`;
        }
        return "Negotiable";
    }

    function formatDate(dateString: string): string {
        if (!dateString) return "Recently";
        const date = new Date(dateString);
        return date.toLocaleDateString('en-IN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    if (loading) {
        return (
            <div>
                <style>{`
                    :root{--color-primary:#34d399;--color-secondary:#0f172a;--color-bg-light:#f8fafc;--color-card-bg:#ffffff;--color-text-subtle:#64748b;--color-gray-border:#e2e8f0}
                    .dashboard-container {display: grid;grid-template-columns: 250px 1fr;min-height: 100vh;}
                    .main-content {padding: 30px;background-color: var(--color-bg-light);}
                    .loading-state {text-align: center;padding: 100px 20px;color: var(--color-text-subtle);font-size: 1.2rem;}
                `}</style>
                <div className="dashboard-container">
                    <SeekerSidebar activePage="find-jobs" />
                    <div className="main-content">
                        <div className="loading-state">Loading job details...</div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !jobData) {
        return (
            <div>
                <style>{`
                    :root{--color-primary:#34d399;--color-secondary:#0f172a;--color-bg-light:#f8fafc;--color-card-bg:#ffffff;--color-text-subtle:#64748b;--color-gray-border:#e2e8f0}
                    .dashboard-container {display: grid;grid-template-columns: 250px 1fr;min-height: 100vh;}
                    .main-content {padding: 30px;background-color: var(--color-bg-light);}
                    .error-state {text-align: center;padding: 100px 20px;color: #dc2626;}
                `}</style>
                <div className="dashboard-container">
                    <SeekerSidebar activePage="find-jobs" />
                    <div className="main-content">
                        <div className="error-state">
                            <h2>{error || "Job not found"}</h2>
                            <Link href="/seeker-jobs" style={{ color: 'var(--color-primary)', marginTop: '20px', display: 'inline-block' }}>
                                ← Back to Jobs
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div>
            <style>{`
                :root{--color-primary:#34d399;--color-secondary:#0f172a;--color-bg-light:#f8fafc;--color-card-bg:#ffffff;--color-text-subtle:#64748b;--color-gray-border:#e2e8f0}
                *{box-sizing:border-box;margin:0;padding:0}
                body{font-family:Arial,sans-serif;background-color:var(--color-bg-light);color:var(--color-secondary)}
                
                .dashboard-container {
                    display: grid;
                    grid-template-columns: 250px 1fr;
                    min-height: 100vh;
                }
                
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

                .main-content {
                    padding: 30px;
                    background-color: var(--color-bg-light);
                }

                .back-link {
                    display: inline-flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--color-primary);
                    text-decoration: none;
                    font-size: 0.95rem;
                    margin-bottom: 20px;
                    font-weight: 500;
                }

                .back-link:hover {
                    text-decoration: underline;
                }

                .job-header-card {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    border-left: 4px solid var(--color-primary);
                }

                .job-title {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-secondary);
                    margin-bottom: 15px;
                }

                .job-meta {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 20px;
                }

                .meta-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    color: var(--color-text-subtle);
                    font-size: 0.95rem;
                }

                .meta-icon {
                    font-size: 1.2rem;
                }

                .badge {
                    padding: 6px 14px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                }

                .badge-field {
                    background-color: #dbeafe;
                    color: #1e40af;
                }

                .badge-industry {
                    background-color: #fef3c7;
                    color: #92400e;
                }

                .badge-shift {
                    background-color: #f3f4f6;
                    color: #374151;
                }

                .badge-shift.day {
                    background-color: #fef9c3;
                    color: #854d0e;
                }

                .badge-shift.night {
                    background-color: #e0e7ff;
                    color: #3730a3;
                }

                .section-card {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 25px;
                    margin-bottom: 20px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .section-title {
                    font-size: 1.3rem;
                    font-weight: 600;
                    color: var(--color-secondary);
                    margin-bottom: 15px;
                    display: flex;
                    align-items: center;
                    gap: 10px;
                }

                .info-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
                    gap: 20px;
                }

                .info-item {
                    padding: 15px;
                    background-color: var(--color-bg-light);
                    border-radius: 8px;
                }

                .info-label {
                    font-size: 0.85rem;
                    color: var(--color-text-subtle);
                    margin-bottom: 5px;
                    font-weight: 500;
                }

                .info-value {
                    font-size: 1.1rem;
                    color: var(--color-secondary);
                    font-weight: 600;
                }

                .tags-list {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 10px;
                    margin-top: 10px;
                }

                .tag {
                    padding: 8px 16px;
                    background-color: var(--color-bg-light);
                    border: 1px solid var(--color-gray-border);
                    border-radius: 20px;
                    font-size: 0.9rem;
                    color: var(--color-secondary);
                }

                .contact-info {
                    display: flex;
                    flex-direction: column;
                    gap: 12px;
                }

                .contact-item {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 12px;
                    background-color: var(--color-bg-light);
                    border-radius: 8px;
                }

                .contact-icon {
                    font-size: 1.5rem;
                }

                .contact-link {
                    color: var(--color-primary);
                    text-decoration: none;
                    font-weight: 500;
                }

                .contact-link:hover {
                    text-decoration: underline;
                }

                .apply-section {
                    background: linear-gradient(135deg, var(--color-primary) 0%, #2ec589 100%);
                    border-radius: 12px;
                    padding: 30px;
                    text-align: center;
                    color: white;
                    box-shadow: 0 4px 12px rgba(52, 211, 153, 0.3);
                }

                .apply-section h3 {
                    font-size: 1.5rem;
                    margin-bottom: 10px;
                }

                .apply-section p {
                    margin-bottom: 20px;
                    opacity: 0.95;
                }

                .apply-btn {
                    padding: 14px 32px;
                    background-color: white;
                    color: var(--color-primary);
                    border: none;
                    border-radius: 8px;
                    font-size: 1rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: all 0.2s;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
                }

                .apply-btn:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
                }

                .no-requirements {
                    padding: 20px;
                    background-color: var(--color-bg-light);
                    border-radius: 8px;
                    text-align: center;
                    color: var(--color-text-subtle);
                }

                @media (max-width: 768px) {
                    .dashboard-container {
                        grid-template-columns: 1fr;
                    }

                    .job-meta {
                        flex-direction: column;
                    }

                    .info-grid {
                        grid-template-columns: 1fr;
                    }
                }
            `}</style>

            <div className="dashboard-container">
                <SeekerSidebar activePage="find-jobs" />

                <div className="main-content">
                    <Link href="/seeker-jobs" className="back-link">
                        ← Back to Jobs
                    </Link>

                    {/* Job Header */}
                    <div className="job-header-card">
                        <h1 className="job-title">{jobData.searchJob || "Job Position"}</h1>

                        <div className="job-meta">
                            <div className="meta-item">
                                <span className="meta-icon">📍</span>
                                <span>{jobData.cityTown || "Location not specified"}</span>
                            </div>
                            {jobData.locality && (
                                <div className="meta-item">
                                    <span className="meta-icon">📌</span>
                                    <span>{jobData.locality}</span>
                                </div>
                            )}
                            <div className="meta-item">
                                <span className="meta-icon">💰</span>
                                <span>{formatIncome(jobData.minIncome, jobData.maxIncome)}</span>
                            </div>
                            <div className="meta-item">
                                <span className="meta-icon">📅</span>
                                <span>Posted on {formatDate(jobData.createdAt)}</span>
                            </div>
                        </div>

                        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                            <span className={`badge badge-${jobData.jobType}`}>
                                {jobData.jobType === 'field' ? '🏞️ Field Job' : '🏭 Industry Job'}
                            </span>
                            <span className={`badge badge-shift ${jobData.shift}`}>
                                ⏰ {jobData.shift.charAt(0).toUpperCase() + jobData.shift.slice(1)} Shift
                            </span>
                            {jobData.numJobs && (
                                <span className="badge" style={{ backgroundColor: '#f0fdf4', color: '#166534' }}>
                                    👥 {jobData.numJobs} {jobData.numJobs === "1" ? "Position" : "Positions"}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Job Details */}
                    <div className="section-card">
                        <h2 className="section-title">
                            <span>📋</span>
                            Job Details
                        </h2>
                        <div className="info-grid">
                            <div className="info-item">
                                <div className="info-label">Job Type</div>
                                <div className="info-value">{jobData.jobType === 'field' ? 'Field Work' : 'Industry Work'}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Work Shift</div>
                                <div className="info-value">{jobData.shift.charAt(0).toUpperCase() + jobData.shift.slice(1)}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Monthly Salary</div>
                                <div className="info-value">{formatIncome(jobData.minIncome, jobData.maxIncome)}</div>
                            </div>
                            <div className="info-item">
                                <div className="info-label">Vacancies</div>
                                <div className="info-value">{jobData.numJobs || 'Multiple'} Position(s)</div>
                            </div>
                        </div>
                    </div>

                    {/* Candidate Requirements */}
                    {requirements.length > 0 ? (
                        requirements.map((req, index) => (
                            <div key={index} className="section-card">
                                <h2 className="section-title">
                                    <span>✅</span>
                                    Candidate Requirements
                                </h2>

                                {req.minimumEducation && req.minimumEducation.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div className="info-label">Minimum Education</div>
                                        <div className="tags-list">
                                            {req.minimumEducation.map((edu, i) => (
                                                <span key={i} className="tag">🎓 {edu}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {req.experience && req.experience.length > 0 && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div className="info-label">Experience Required</div>
                                        <div className="tags-list">
                                            {req.experience.map((exp, i) => (
                                                <span key={i} className="tag">💼 {exp}</span>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {req.preferredGender && (
                                    <div style={{ marginBottom: '20px' }}>
                                        <div className="info-label">Preferred Gender</div>
                                        <div className="info-value" style={{ marginTop: '8px' }}>
                                            {req.preferredGender === 'male' ? '👨 Male' :
                                                req.preferredGender === 'female' ? '👩 Female' :
                                                    '👥 Any'}
                                        </div>
                                    </div>
                                )}

                                {req.contact && (req.contact.mobile || req.contact.whatsapp) && (
                                    <div>
                                        <div className="info-label" style={{ marginBottom: '12px' }}>Contact Information</div>
                                        <div className="contact-info">
                                            {req.contact.mobile && (
                                                <div className="contact-item">
                                                    <span className="contact-icon">📱</span>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>Mobile</div>
                                                        <a href={`tel:${req.contact.mobile}`} className="contact-link">
                                                            {req.contact.mobile}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                            {req.contact.whatsapp && (
                                                <div className="contact-item">
                                                    <span className="contact-icon">💬</span>
                                                    <div>
                                                        <div style={{ fontSize: '0.85rem', color: 'var(--color-text-subtle)' }}>WhatsApp</div>
                                                        <a href={`https://wa.me/91${req.contact.whatsapp}`} target="_blank" rel="noopener noreferrer" className="contact-link">
                                                            {req.contact.whatsapp}
                                                        </a>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="section-card">
                            <h2 className="section-title">
                                <span>✅</span>
                                Candidate Requirements
                            </h2>
                            <div className="no-requirements">
                                No specific requirements specified for this position
                            </div>
                        </div>
                    )}

                    {/* Apply Section */}
                    <div className="apply-section">
                        <h3>Interested in this position?</h3>
                        <p>Contact the employer to apply for this job opportunity</p>
                        <button className="apply-btn">Apply Now</button>
                    </div>
                </div>
            </div>
        </div>
    );
}
