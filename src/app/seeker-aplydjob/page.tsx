"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../../lib/firebase";
import { collection, query, where, getDocs, doc, deleteDoc, onSnapshot, addDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SeekerSidebar from "../../components/SeekerSidebar";

type JobStatus = 'pending' | 'reviewing' | 'interview' | 'rejected';

type AppliedJob = {
    id: string;
    title: string;
    company: string;
    location: string;
    type: string;
    salary: string;
    description: string;
    skills: string[];
    status: JobStatus;
    appliedDate: string;
};

export default function SeekerAppliedJobsPage() {
    const [appliedJobs, setAppliedJobs] = useState<AppliedJob[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<AppliedJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [dateFilter, setDateFilter] = useState<string>("all");
    const [searchInput, setSearchInput] = useState<string>("");

    // Stats
    const [totalApplied, setTotalApplied] = useState(0);
    const [underReview, setUnderReview] = useState(0);
    const [interviews, setInterviews] = useState(0);
    const [thisWeek, setThisWeek] = useState(0);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            if (user) {
                await loadAppliedJobs(user.uid);
            } else {
                setLoading(false);
            }
        });

        return () => unsubscribe();
    }, []);

    useEffect(() => {
        // Update stats whenever jobs change
        setTotalApplied(appliedJobs.length);
        setUnderReview(appliedJobs.filter(j => j.status === 'reviewing').length);
        setInterviews(appliedJobs.filter(j => j.status === 'interview').length);

        // Calculate this week
        const oneWeekAgo = new Date();
        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
        setThisWeek(appliedJobs.filter(j => new Date(j.appliedDate) >= oneWeekAgo).length);
    }, [appliedJobs]);

    useEffect(() => {
        // Apply filters whenever filter values or appliedJobs change
        applyFilters();
    }, [statusFilter, dateFilter, searchInput, appliedJobs]);

    async function loadAppliedJobs(userId: string) {
        try {
            setLoading(true);
            const q = query(
                collection(db, "appliedJobs"),
                where("userId", "==", userId)
            );

            const querySnapshot = await getDocs(q);
            const jobs: AppliedJob[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                jobs.push({
                    id: doc.id,
                    title: data.title || "",
                    company: data.company || "",
                    location: data.location || "",
                    type: data.type || "",
                    salary: data.salary || "",
                    description: data.description || "",
                    skills: data.skills || [],
                    status: data.status || 'pending',
                    appliedDate: data.appliedDate || new Date().toISOString().split('T')[0],
                });
            });

            setAppliedJobs(jobs);
            setFilteredJobs(jobs);
        } catch (error) {
            console.error("Error loading applied jobs:", error);
        } finally {
            setLoading(false);
        }
    }

    function applyFilters() {
        let filtered = [...appliedJobs];

        // Status filter
        if (statusFilter !== 'all') {
            filtered = filtered.filter(job => job.status === statusFilter);
        }

        // Search filter
        if (searchInput) {
            const search = searchInput.toLowerCase();
            filtered = filtered.filter(job =>
                job.title.toLowerCase().includes(search) ||
                job.company.toLowerCase().includes(search)
            );
        }

        // Date filter
        if (dateFilter !== 'all') {
            const now = new Date();
            filtered = filtered.filter(job => {
                const appliedDate = new Date(job.appliedDate);
                switch (dateFilter) {
                    case 'today':
                        return appliedDate.toDateString() === now.toDateString();
                    case 'week':
                        const oneWeekAgo = new Date();
                        oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
                        return appliedDate >= oneWeekAgo;
                    case 'month':
                        const oneMonthAgo = new Date();
                        oneMonthAgo.setMonth(oneMonthAgo.getMonth() - 1);
                        return appliedDate >= oneMonthAgo;
                    default:
                        return true;
                }
            });
        }

        setFilteredJobs(filtered);
    }

    function resetFilters() {
        setStatusFilter('all');
        setDateFilter('all');
        setSearchInput('');
    }

    function getStatusText(status: JobStatus): string {
        const statusMap: Record<JobStatus, string> = {
            'pending': 'Application Submitted',
            'reviewing': 'Under Review',
            'interview': 'Interview Scheduled',
            'rejected': 'Not Selected'
        };
        return statusMap[status] || status;
    }

    async function withdrawApplication(jobId: string) {
        if (!confirm('Are you sure you want to withdraw your application?')) {
            return;
        }

        try {
            await deleteDoc(doc(db, "appliedJobs", jobId));
            setAppliedJobs(prev => prev.filter(job => job.id !== jobId));
            alert('Application withdrawn successfully');
        } catch (error) {
            console.error("Error withdrawing application:", error);
            alert('Failed to withdraw application. Please try again.');
        }
    }

    function viewDetails(jobId: string) {
        // Navigate to job details page
        window.location.href = `/job-details/${jobId}`;
    }

    async function handleApply(jobId: string) {
        const user = auth.currentUser;
        if (!user) {
            alert('You must be logged in to apply for jobs.');
            return;
        }

        const appliedAt = new Date().toISOString();

        try {
            await addDoc(collection(db, 'appliedJobs'), {
                userId: user.uid,
                jobId,
                appliedAt,
                status: 'pending',
            });
            alert('Application submitted successfully!');
        } catch (error) {
            console.error("Error applying for job:", error);
            alert('Failed to submit application. Please try again.');
        }
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

                .container {
                    max-width: 1200px;
                    margin: 0 auto;
                }

                .page-header {
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    padding: 30px;
                    margin-bottom: 25px;
                }

                .page-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: #333;
                    margin-bottom: 10px;
                }

                .page-header p {
                    color: #666;
                    font-size: 1rem;
                }

                .stats-row {
                    display: flex;
                    gap: 20px;
                    margin-top: 20px;
                    flex-wrap: wrap;
                }

                .stat-card {
                    flex: 1;
                    min-width: 150px;
                    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                    padding: 20px;
                    border-radius: 8px;
                    color: white;
                    text-align: center;
                }

                .stat-card:nth-child(2) {
                    background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
                }

                .stat-card:nth-child(3) {
                    background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                }

                .stat-card:nth-child(4) {
                    background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);
                }

                .stat-card h3 {
                    font-size: 0.9rem;
                    font-weight: 400;
                    margin-bottom: 8px;
                    opacity: 0.95;
                }

                .stat-card .number {
                    font-size: 2rem;
                    font-weight: 700;
                }

                .filter-section {
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    padding: 20px 30px;
                    margin-bottom: 25px;
                    display: flex;
                    gap: 15px;
                    flex-wrap: wrap;
                    align-items: center;
                }

                .filter-section label {
                    font-weight: 500;
                    color: #555;
                    margin-right: 5px;
                }

                .filter-section select,
                .filter-section input {
                    padding: 8px 12px;
                    border: 1px solid #ddd;
                    border-radius: 5px;
                    font-size: 0.9rem;
                    color: #333;
                }

                .filter-section button {
                    padding: 8px 20px;
                    background-color: #007bff;
                    color: white;
                    border: none;
                    border-radius: 5px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .filter-section button:hover {
                    background-color: #0056b3;
                }

                .filter-section button.reset-btn {
                    background-color: #6c757d;
                }

                .filter-section button.reset-btn:hover {
                    background-color: #545b62;
                }

                .jobs-list {
                    display: flex;
                    flex-direction: column;
                    gap: 20px;
                }

                .job-card {
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    padding: 25px;
                    transition: transform 0.2s, box-shadow 0.2s;
                    border-left: 4px solid transparent;
                }

                .job-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
                }

                .job-card.status-pending {
                    border-left-color: #ffc107;
                }

                .job-card.status-reviewing {
                    border-left-color: #17a2b8;
                }

                .job-card.status-interview {
                    border-left-color: #28a745;
                }

                .job-card.status-rejected {
                    border-left-color: #dc3545;
                }

                .job-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                    flex-wrap: wrap;
                    gap: 15px;
                }

                .job-title-section {
                    flex: 1;
                }

                .job-title {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: #333;
                    margin-bottom: 5px;
                }

                .company-name {
                    font-size: 1rem;
                    color: #666;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .company-logo {
                    width: 24px;
                    height: 24px;
                    border-radius: 4px;
                    background-color: #e9ecef;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 0.8rem;
                    font-weight: 600;
                    color: #495057;
                }

                .status-badge {
                    padding: 6px 16px;
                    border-radius: 20px;
                    font-size: 0.85rem;
                    font-weight: 500;
                    white-space: nowrap;
                }

                .status-badge.status-pending {
                    background-color: #fff3cd;
                    color: #856404;
                }

                .status-badge.status-reviewing {
                    background-color: #d1ecf1;
                    color: #0c5460;
                }

                .status-badge.status-interview {
                    background-color: #d4edda;
                    color: #155724;
                }

                .status-badge.status-rejected {
                    background-color: #f8d7da;
                    color: #721c24;
                }

                .job-details {
                    display: flex;
                    gap: 20px;
                    margin-bottom: 15px;
                    flex-wrap: wrap;
                    font-size: 0.9rem;
                    color: #666;
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 5px;
                }

                .job-description {
                    color: #555;
                    line-height: 1.6;
                    margin-bottom: 15px;
                    font-size: 0.95rem;
                }

                .job-tags {
                    display: flex;
                    gap: 8px;
                    flex-wrap: wrap;
                    margin-bottom: 15px;
                }

                .tag {
                    background-color: #e9ecef;
                    color: #495057;
                    padding: 5px 12px;
                    border-radius: 15px;
                    font-size: 0.85rem;
                }

                .job-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding-top: 15px;
                    border-top: 1px solid #eee;
                    flex-wrap: wrap;
                    gap: 10px;
                }

                .applied-date {
                    color: #999;
                    font-size: 0.85rem;
                }

                .action-buttons {
                    display: flex;
                    gap: 10px;
                }

                .btn {
                    padding: 8px 16px;
                    border: none;
                    border-radius: 5px;
                    font-size: 0.9rem;
                    cursor: pointer;
                    transition: all 0.2s;
                    font-weight: 500;
                }

                .btn-primary {
                    background-color: #007bff;
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #0056b3;
                }

                .btn-outline {
                    background-color: transparent;
                    border: 1px solid #007bff;
                    color: #007bff;
                }

                .btn-outline:hover {
                    background-color: #007bff;
                    color: white;
                }

                .empty-state {
                    background-color: #ffffff;
                    border-radius: 10px;
                    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
                    padding: 60px 30px;
                    text-align: center;
                }

                .empty-state svg {
                    width: 80px;
                    height: 80px;
                    margin-bottom: 20px;
                    opacity: 0.3;
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    color: #666;
                    margin-bottom: 10px;
                }

                .empty-state p {
                    color: #999;
                    margin-bottom: 20px;
                }

                .loading-state {
                    text-align: center;
                    padding: 40px;
                    color: #666;
                }

                @media (max-width: 768px) {
                    .dashboard-container {
                        grid-template-columns: 1fr;
                    }

                    .page-header h1 {
                        font-size: 1.5rem;
                    }

                    .filter-section {
                        flex-direction: column;
                        align-items: stretch;
                    }

                    .job-header {
                        flex-direction: column;
                    }

                    .job-footer {
                        flex-direction: column;
                        align-items: flex-start;
                    }
                }
            `}</style>

            <div className="dashboard-container">
                <SeekerSidebar activePage="requirements" />

                <div className="main-content">
                    <div className="container">
                        {/* Page Header */}
                        <div className="page-header">
                            <h1>My Applied Jobs</h1>
                            <p>Track the status of all your job applications in one place</p>

                            <div className="stats-row">
                                <div className="stat-card">
                                    <h3>Total Applied</h3>
                                    <div className="number">{totalApplied}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Under Review</h3>
                                    <div className="number">{underReview}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>Interviews</h3>
                                    <div className="number">{interviews}</div>
                                </div>
                                <div className="stat-card">
                                    <h3>This Week</h3>
                                    <div className="number">{thisWeek}</div>
                                </div>
                            </div>
                        </div>

                        {/* Filter Section */}
                        <div className="filter-section">
                            <div>
                                <label htmlFor="statusFilter">Status:</label>
                                <select
                                    id="statusFilter"
                                    value={statusFilter}
                                    onChange={(e) => setStatusFilter(e.target.value)}
                                >
                                    <option value="all">All Status</option>
                                    <option value="pending">Pending</option>
                                    <option value="reviewing">Under Review</option>
                                    <option value="interview">Interview Scheduled</option>
                                    <option value="rejected">Rejected</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="dateFilter">Applied Date:</label>
                                <select
                                    id="dateFilter"
                                    value={dateFilter}
                                    onChange={(e) => setDateFilter(e.target.value)}
                                >
                                    <option value="all">All Time</option>
                                    <option value="today">Today</option>
                                    <option value="week">This Week</option>
                                    <option value="month">This Month</option>
                                </select>
                            </div>
                            <div>
                                <label htmlFor="searchInput">Search:</label>
                                <input
                                    type="text"
                                    id="searchInput"
                                    placeholder="Job title or company..."
                                    value={searchInput}
                                    onChange={(e) => setSearchInput(e.target.value)}
                                />
                            </div>
                            <button onClick={resetFilters} className="reset-btn">Reset</button>
                        </div>

                        {/* Jobs List */}
                        <div className="jobs-list">
                            {loading ? (
                                <div className="loading-state">
                                    <p>Loading your applied jobs...</p>
                                </div>
                            ) : filteredJobs.length === 0 ? (
                                <div className="empty-state">
                                    <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg" fill="currentColor">
                                        <path d="M20 6h-4V4c0-1.11-.89-2-2-2h-4c-1.11 0-2 .89-2 2v2H4c-1.11 0-1.99.89-1.99 2L2 19c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V8c0-1.11-.89-2-2-2zm-6 0h-4V4h4v2z" />
                                    </svg>
                                    <h3>No Applications Yet</h3>
                                    <p>You haven't applied to any jobs yet. Start exploring opportunities!</p>
                                    <Link href="/seeker-jobs">
                                        <button className="btn btn-primary">Browse Jobs</button>
                                    </Link>
                                </div>
                            ) : (
                                filteredJobs.map(job => (
                                    <div key={job.id} className={`job-card status-${job.status}`}>
                                        <div className="job-header">
                                            <div className="job-title-section">
                                                <h2 className="job-title">{job.title}</h2>
                                                <div className="company-name">
                                                    <div className="company-logo">{job.company.charAt(0)}</div>
                                                    <span>{job.company}</span>
                                                </div>
                                            </div>
                                            <span className={`status-badge status-${job.status}`}>
                                                {getStatusText(job.status)}
                                            </span>
                                        </div>

                                        <div className="job-details">
                                            <div className="detail-item">
                                                📍 {job.location}
                                            </div>
                                            <div className="detail-item">
                                                💼 {job.type}
                                            </div>
                                            <div className="detail-item">
                                                💰 {job.salary}
                                            </div>
                                        </div>

                                        <p className="job-description">{job.description}</p>

                                        <div className="job-tags">
                                            {job.skills.map((skill, index) => (
                                                <span key={index} className="tag">{skill}</span>
                                            ))}
                                        </div>

                                        <div className="job-footer">
                                            <span className="applied-date">Applied on {job.appliedDate}</span>
                                            <div className="action-buttons">
                                                <button
                                                    className="btn btn-outline"
                                                    onClick={() => viewDetails(job.id)}
                                                >
                                                    View Details
                                                </button>
                                                <button
                                                    className="btn btn-primary"
                                                    onClick={() => withdrawApplication(job.id)}
                                                >
                                                    Withdraw
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
