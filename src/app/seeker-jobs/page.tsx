"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { auth, db } from "../../lib/firebase";
import { collection, query, getDocs, orderBy } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import SeekerSidebar from "../../components/SeekerSidebar";
import { MdLocationOn, MdAttachMoney, MdSchedule, MdPeople, MdSearch, MdFilterList } from 'react-icons/md';

type Job = {
    id: string;
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

export default function SeekerJobsPage() {
    const [jobs, setJobs] = useState<Job[]>([]);
    const [filteredJobs, setFilteredJobs] = useState<Job[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchQuery, setSearchQuery] = useState("");
    const [locationFilter, setLocationFilter] = useState("");
    const [shiftFilter, setShiftFilter] = useState("all");
    const [typeFilter, setTypeFilter] = useState("all");

    useEffect(() => {
        loadJobs();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [searchQuery, locationFilter, shiftFilter, typeFilter, jobs]);

    async function loadJobs() {
        try {
            setLoading(true);
            const q = query(
                collection(db, "proffessional"),
                orderBy("createdAt", "desc")
            );

            const querySnapshot = await getDocs(q);
            const jobsList: Job[] = [];

            querySnapshot.forEach((doc) => {
                const data = doc.data();
                jobsList.push({
                    id: doc.id,
                    searchJob: data.searchJob || "",
                    numJobs: data.numJobs || "",
                    minIncome: data.minIncome,
                    maxIncome: data.maxIncome,
                    shift: data.shift || "any",
                    jobType: data.jobType || "field",
                    useCurrentLocation: data.useCurrentLocation || false,
                    cityTown: data.cityTown || "",
                    locality: data.locality || "",
                    createdAt: data.createdAt || "",
                    createdBy: data.createdBy || "",
                });
            });

            setJobs(jobsList);
            setFilteredJobs(jobsList);
        } catch (error) {
            console.error("Error loading jobs:", error);
        } finally {
            setLoading(false);
        }
    }

    function applyFilters() {
        let filtered = [...jobs];

        // Search filter
        if (searchQuery) {
            const search = searchQuery.toLowerCase();
            filtered = filtered.filter(job =>
                job.searchJob.toLowerCase().includes(search) ||
                job.cityTown.toLowerCase().includes(search) ||
                job.locality.toLowerCase().includes(search)
            );
        }

        // Location filter
        if (locationFilter) {
            const location = locationFilter.toLowerCase();
            filtered = filtered.filter(job =>
                job.cityTown.toLowerCase().includes(location) ||
                job.locality.toLowerCase().includes(location)
            );
        }

        // Shift filter
        if (shiftFilter !== 'all') {
            filtered = filtered.filter(job => job.shift === shiftFilter);
        }

        // Type filter
        if (typeFilter !== 'all') {
            filtered = filtered.filter(job => job.jobType === typeFilter);
        }

        setFilteredJobs(filtered);
    }

    function resetFilters() {
        setSearchQuery("");
        setLocationFilter("");
        setShiftFilter("all");
        setTypeFilter("all");
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
        const now = new Date();
        const diffTime = Math.abs(now.getTime() - date.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) return "Today";
        if (diffDays === 1) return "Yesterday";
        if (diffDays < 7) return `${diffDays} days ago`;
        if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
        return date.toLocaleDateString();
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

                .page-header {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 30px;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .page-header h1 {
                    font-size: 2rem;
                    font-weight: 700;
                    color: var(--color-secondary);
                    margin-bottom: 8px;
                }

                .page-header p {
                    color: var(--color-text-subtle);
                    font-size: 1rem;
                }

                .stats-bar {
                    display: flex;
                    gap: 15px;
                    margin-top: 20px;
                    padding: 15px;
                    background-color: var(--color-bg-light);
                    border-radius: 8px;
                }

                .stat-item {
                    flex: 1;
                    text-align: center;
                }

                .stat-number {
                    font-size: 1.8rem;
                    font-weight: 700;
                    color: var(--color-primary);
                }

                .stat-label {
                    font-size: 0.85rem;
                    color: var(--color-text-subtle);
                    margin-top: 5px;
                }

                .filters-section {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 20px;
                    margin-bottom: 25px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .filters-grid {
                    display: grid;
                    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
                    gap: 15px;
                    margin-bottom: 15px;
                }

                .filter-group label {
                    display: block;
                    font-size: 0.9rem;
                    font-weight: 500;
                    color: var(--color-secondary);
                    margin-bottom: 5px;
                }

                .filter-group input,
                .filter-group select {
                    width: 100%;
                    padding: 10px 12px;
                    border: 1px solid var(--color-gray-border);
                    border-radius: 8px;
                    font-size: 0.9rem;
                    color: var(--color-secondary);
                    transition: border-color 0.2s;
                }

                .filter-group input:focus,
                .filter-group select:focus {
                    outline: none;
                    border-color: var(--color-primary);
                }

                .filter-actions {
                    display: flex;
                    gap: 10px;
                    justify-content: flex-end;
                }

                .btn {
                    padding: 10px 20px;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 500;
                    cursor: pointer;
                    transition: all 0.2s;
                }

                .btn-primary {
                    background-color: var(--color-primary);
                    color: white;
                }

                .btn-primary:hover {
                    background-color: #2ec589;
                }

                .btn-secondary {
                    background-color: var(--color-gray-border);
                    color: var(--color-secondary);
                }

                .btn-secondary:hover {
                    background-color: #cbd5e1;
                }

                .jobs-grid {
                    display: grid;
                    gap: 20px;
                }

                .job-card {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 25px;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                    transition: transform 0.2s, box-shadow 0.2s;
                    border-left: 4px solid var(--color-primary);
                }

                .job-card:hover {
                    transform: translateY(-2px);
                    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
                }

                .job-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: flex-start;
                    margin-bottom: 15px;
                }

                .job-title {
                    font-size: 1.4rem;
                    font-weight: 600;
                    color: var(--color-secondary);
                    margin-bottom: 8px;
                    transition: color 0.2s;
                }

                .job-title:hover {
                    color: var(--color-primary);
                }

                .job-type-badge {
                    padding: 6px 12px;
                    border-radius: 20px;
                    font-size: 0.8rem;
                    font-weight: 500;
                    background-color: var(--color-bg-light);
                    color: var(--color-secondary);
                }

                .job-type-badge.field {
                    background-color: #dbeafe;
                    color: #1e40af;
                }

                .job-type-badge.industry {
                    background-color: #fef3c7;
                    color: #92400e;
                }

                .job-details {
                    display: flex;
                    flex-wrap: wrap;
                    gap: 20px;
                    margin-bottom: 15px;
                    font-size: 0.9rem;
                    color: var(--color-text-subtle);
                }

                .detail-item {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                }

                .detail-icon {
                    font-size: 1.1rem;
                }

                .job-footer {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    margin-top: 20px;
                    padding-top: 15px;
                    border-top: 1px solid var(--color-gray-border);
                }

                .posted-date {
                    font-size: 0.85rem;
                    color: var(--color-text-subtle);
                }

                .apply-btn {
                    padding: 10px 24px;
                    background-color: var(--color-primary);
                    color: white;
                    border: none;
                    border-radius: 8px;
                    font-size: 0.9rem;
                    font-weight: 600;
                    cursor: pointer;
                    transition: background-color 0.2s;
                }

                .apply-btn:hover {
                    background-color: #2ec589;
                }

                .shift-badge {
                    padding: 4px 10px;
                    border-radius: 12px;
                    font-size: 0.8rem;
                    font-weight: 500;
                }

                .shift-badge.day {
                    background-color: #fef9c3;
                    color: #854d0e;
                }

                .shift-badge.night {
                    background-color: #e0e7ff;
                    color: #3730a3;
                }

                .shift-badge.any {
                    background-color: #f3f4f6;
                    color: #374151;
                }

                .empty-state {
                    background-color: var(--color-card-bg);
                    border-radius: 12px;
                    padding: 60px 30px;
                    text-align: center;
                    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
                }

                .empty-state h3 {
                    font-size: 1.5rem;
                    color: var(--color-text-subtle);
                    margin-bottom: 10px;
                }

                .empty-state p {
                    color: var(--color-text-subtle);
                    margin-bottom: 20px;
                }

                .loading-state {
                    text-align: center;
                    padding: 40px;
                    color: var(--color-text-subtle);
                    font-size: 1.1rem;
                }

                @media (max-width: 768px) {
                    .dashboard-container {
                        grid-template-columns: 1fr;
                    }

                    .filters-grid {
                        grid-template-columns: 1fr;
                    }

                    .job-header {
                        flex-direction: column;
                        gap: 10px;
                    }

                    .job-footer {
                        flex-direction: column;
                        align-items: flex-start;
                        gap: 10px;
                    }

                    .stats-bar {
                        flex-direction: column;
                    }
                }
            `}</style>

            <div className="dashboard-container">
                <SeekerSidebar activePage="find-jobs" />

                <div className="main-content">
                    {/* Page Header */}
                    <div className="page-header">
                        <h1>Available Jobs</h1>
                        <p>Browse and apply for jobs that match your skills and preferences</p>

                        <div className="stats-bar">
                            <div className="stat-item">
                                <div className="stat-number">{jobs.length}</div>
                                <div className="stat-label">Total Jobs</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{filteredJobs.length}</div>
                                <div className="stat-label">Filtered Results</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{jobs.filter(j => j.jobType === 'field').length}</div>
                                <div className="stat-label">Field Jobs</div>
                            </div>
                            <div className="stat-item">
                                <div className="stat-number">{jobs.filter(j => j.jobType === 'industry').length}</div>
                                <div className="stat-label">Industry Jobs</div>
                            </div>
                        </div>
                    </div>

                    {/* Filters Section */}
                    <div className="filters-section">
                        <div className="filters-grid">
                            <div className="filter-group">
                                <label htmlFor="searchQuery">Search Jobs</label>
                                <input
                                    id="searchQuery"
                                    type="text"
                                    placeholder="Job title or keywords..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label htmlFor="locationFilter">Location</label>
                                <input
                                    id="locationFilter"
                                    type="text"
                                    placeholder="City or locality..."
                                    value={locationFilter}
                                    onChange={(e) => setLocationFilter(e.target.value)}
                                />
                            </div>
                            <div className="filter-group">
                                <label htmlFor="shiftFilter">Job Shift</label>
                                <select
                                    id="shiftFilter"
                                    value={shiftFilter}
                                    onChange={(e) => setShiftFilter(e.target.value)}
                                >
                                    <option value="all">All Shifts</option>
                                    <option value="any">Any</option>
                                    <option value="day">Day</option>
                                    <option value="night">Night</option>
                                </select>
                            </div>
                            <div className="filter-group">
                                <label htmlFor="typeFilter">Job Type</label>
                                <select
                                    id="typeFilter"
                                    value={typeFilter}
                                    onChange={(e) => setTypeFilter(e.target.value)}
                                >
                                    <option value="all">All Types</option>
                                    <option value="field">Field</option>
                                    <option value="industry">Industry</option>
                                </select>
                            </div>
                        </div>
                        <div className="filter-actions">
                            <button className="btn btn-secondary" onClick={resetFilters}>
                                Reset Filters
                            </button>
                        </div>
                    </div>

                    {/* Jobs List */}
                    <div className="jobs-grid">
                        {loading ? (
                            <div className="loading-state">
                                <p>Loading available jobs...</p>
                            </div>
                        ) : filteredJobs.length === 0 ? (
                            <div className="empty-state">
                                <h3>No Jobs Found</h3>
                                <p>Try adjusting your filters or check back later for new opportunities.</p>
                                <button className="btn btn-primary" onClick={resetFilters}>
                                    Clear Filters
                                </button>
                            </div>
                        ) : (
                            filteredJobs.map((job) => (
                                <div key={job.id} className="job-card">
                                    <div className="job-header">
                                        <div>
                                            <Link href={`/job-details/${job.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                                                <h2 className="job-title" style={{ cursor: 'pointer' }}>
                                                    {job.searchJob || "Job Position"}
                                                </h2>
                                            </Link>
                                            <div className="job-details">
                                                <div className="detail-item">
                                                    <MdLocationOn className="detail-icon" />
                                                    <span>{job.cityTown || "Location not specified"}</span>
                                                </div>
                                                {job.locality && (
                                                    <div className="detail-item">
                                                        <MdLocationOn className="detail-icon" style={{ opacity: 0.7 }} />
                                                        <span>{job.locality}</span>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                        <span className={`job-type-badge ${job.jobType}`}>
                                            {job.jobType === 'field' ? '🏞️ Field' : '🏭 Industry'}
                                        </span>
                                    </div>

                                    <div className="job-details">
                                        <div className="detail-item">
                                            <MdAttachMoney className="detail-icon" />
                                            <span>{formatIncome(job.minIncome, job.maxIncome)}</span>
                                        </div>
                                        <div className="detail-item">
                                            <MdSchedule className="detail-icon" />
                                            <span className={`shift-badge ${job.shift}`}>
                                                {job.shift.charAt(0).toUpperCase() + job.shift.slice(1)} Shift
                                            </span>
                                        </div>
                                        {job.numJobs && (
                                            <div className="detail-item">
                                                <MdPeople className="detail-icon" />
                                                <span>{job.numJobs} {job.numJobs === "1" ? "position" : "positions"}</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="job-footer">
                                        <span className="posted-date">Posted {formatDate(job.createdAt)}</span>
                                        <button className="apply-btn">Apply Now</button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
