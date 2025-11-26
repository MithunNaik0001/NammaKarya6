"use client";

import React, { useState } from 'react';
import Link from 'next/link';

type Job = {
    id: string;
    title: string;
    company: string;
    location: string;
    salary: string;
    type: string;
    category: string;
    description: string;
    postedDate: string;
};

// Sample job data - replace with API call later
const sampleJobs: Job[] = [
    { id: '1', title: 'Plumber', company: 'Home Services Ltd', location: 'Bangalore', salary: '₹25,000 - ₹35,000', type: 'Full-time', category: 'Skilled Trades', description: 'Experienced plumber needed for residential and commercial projects', postedDate: '2 days ago' },
    { id: '2', title: 'Electrician', company: 'Power Solutions', location: 'Mumbai', salary: '₹30,000 - ₹45,000', type: 'Full-time', category: 'Skilled Trades', description: 'Certified electrician for installation and maintenance work', postedDate: '3 days ago' },
    { id: '3', title: 'Carpenter', company: 'Wood Works Inc', location: 'Delhi', salary: '₹20,000 - ₹30,000', type: 'Contract', category: 'Skilled Trades', description: 'Skilled carpenter for furniture making and repairs', postedDate: '5 days ago' },
    { id: '4', title: 'Painter', company: 'Color Masters', location: 'Bangalore', salary: '₹18,000 - ₹28,000', type: 'Part-time', category: 'Skilled Trades', description: 'Interior and exterior painting specialist', postedDate: '1 week ago' },
    { id: '5', title: 'Mason', company: 'Build Right', location: 'Hyderabad', salary: '₹22,000 - ₹32,000', type: 'Full-time', category: 'Skilled Trades', description: 'Experienced mason for construction projects', postedDate: '1 week ago' },
    { id: '6', title: 'Welding Specialist', company: 'Metal Works', location: 'Pune', salary: '₹28,000 - ₹40,000', type: 'Full-time', category: 'Machine Operation', description: 'Certified welder for industrial projects', postedDate: '2 weeks ago' },
    { id: '7', title: 'Office Administrator', company: 'Tech Solutions Pvt Ltd', location: 'Bangalore', salary: '₹20,000 - ₹30,000', type: 'Full-time', category: 'Admin/Office', description: 'Managing office operations, scheduling, and administrative tasks', postedDate: '3 days ago' },
    { id: '8', title: 'Sales Executive', company: 'Global Marketing Inc', location: 'Mumbai', salary: '₹18,000 - ₹35,000', type: 'Full-time', category: 'Marketing/Sales', description: 'Field sales position with performance-based incentives', postedDate: '4 days ago' },
    { id: '9', title: 'Machine Operator', company: 'Manufacturing Hub', location: 'Chennai', salary: '₹22,000 - ₹28,000', type: 'Full-time', category: 'Machine Operation', description: 'Operating CNC machines and production equipment', postedDate: '5 days ago' },
    { id: '10', title: 'Data Entry Clerk', company: 'InfoSystems Ltd', location: 'Delhi', salary: '₹15,000 - ₹22,000', type: 'Full-time', category: 'Admin/Office', description: 'Accurate data entry and record maintenance', postedDate: '1 week ago' },
    { id: '11', title: 'Marketing Coordinator', company: 'Brand Builders', location: 'Pune', salary: '₹25,000 - ₹38,000', type: 'Full-time', category: 'Marketing/Sales', description: 'Coordinate marketing campaigns and social media', postedDate: '1 week ago' },
    { id: '12', title: 'Assembly Line Worker', company: 'Auto Parts Manufacturing', location: 'Hyderabad', salary: '₹18,000 - ₹25,000', type: 'Full-time', category: 'Machine Operation', description: 'Assembly and quality control on production line', postedDate: '2 weeks ago' },
];

export default function Page() {
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [typeFilter, setTypeFilter] = useState('');
    const [categoryFilter, setCategoryFilter] = useState('');

    const filteredJobs = sampleJobs.filter(job => {
        const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.description.toLowerCase().includes(searchTerm.toLowerCase());
        const matchesLocation = !locationFilter || job.location === locationFilter;
        const matchesType = !typeFilter || job.type === typeFilter;
        const matchesCategory = !categoryFilter || job.category === categoryFilter;
        return matchesSearch && matchesLocation && matchesType && matchesCategory;
    });

    const locations = Array.from(new Set(sampleJobs.map(j => j.location)));
    const jobTypes = Array.from(new Set(sampleJobs.map(j => j.type)));
    const categories = Array.from(new Set(sampleJobs.map(j => j.category)));

    return (
        <div className="min-h-screen p-8 bg-gray-50">
            <div className="mx-auto max-w-6xl">
                <div className="bg-white rounded-xl p-6 shadow border mb-6">
                    <h1 className="text-2xl font-semibold mb-6">Find Job</h1>

                    {/* Search and Filter Section */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        <div>
                            <label className="block text-sm font-medium mb-2">Search Jobs</label>
                            <input
                                type="text"
                                placeholder="Job title, company, keywords..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Category</label>
                            <select
                                value={categoryFilter}
                                onChange={(e) => setCategoryFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Categories</option>
                                {categories.map(cat => (
                                    <option key={cat} value={cat}>{cat}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Location</label>
                            <select
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Locations</option>
                                {locations.map(loc => (
                                    <option key={loc} value={loc}>{loc}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium mb-2">Job Type</label>
                            <select
                                value={typeFilter}
                                onChange={(e) => setTypeFilter(e.target.value)}
                                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                            >
                                <option value="">All Types</option>
                                {jobTypes.map(type => (
                                    <option key={type} value={type}>{type}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Found {filteredJobs.length} {filteredJobs.length === 1 ? 'job' : 'jobs'}
                        </p>
                        {(searchTerm || locationFilter || typeFilter || categoryFilter) && (
                            <button
                                onClick={() => { setSearchTerm(''); setLocationFilter(''); setTypeFilter(''); setCategoryFilter(''); }}
                                className="text-sm text-blue-600 hover:underline"
                            >
                                Clear filters
                            </button>
                        )}
                    </div>
                </div>

                {/* Job Listings */}
                <div className="space-y-4">
                    {filteredJobs.length === 0 ? (
                        <div className="bg-white rounded-xl p-8 shadow border text-center">
                            <p className="text-gray-500">No jobs found matching your criteria</p>
                        </div>
                    ) : (
                        filteredJobs.map(job => (
                            <div key={job.id} className="bg-white rounded-xl p-6 shadow border hover:shadow-lg transition-shadow">
                                <div className="flex justify-between items-start mb-3">
                                    <div>
                                        <h2 className="text-xl font-semibold text-gray-800">{job.title}</h2>
                                        <p className="text-gray-600">{job.company}</p>
                                    </div>
                                    <div className="flex gap-2">
                                        <span className="px-3 py-1 bg-green-100 text-green-700 text-sm rounded-full">{job.category}</span>
                                        <span className="px-3 py-1 bg-blue-100 text-blue-700 text-sm rounded-full">{job.type}</span>
                                    </div>
                                </div>
                                <p className="text-gray-700 mb-4">{job.description}</p>
                                <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        {job.location}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {job.salary}
                                    </div>
                                    <div className="flex items-center gap-1">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                        </svg>
                                        {job.postedDate}
                                    </div>
                                </div>
                                <div className="flex gap-3">
                                    <button className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors">
                                        Apply Now
                                    </button>
                                    <button className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors">
                                        Save Job
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
}
