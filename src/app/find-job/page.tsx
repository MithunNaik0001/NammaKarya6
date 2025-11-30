'use client';

import React, { useState, useEffect } from 'react';
import { db, auth } from '@/lib/firebase';
import { collection, getDocs } from 'firebase/firestore';
import { onAuthStateChanged, User } from 'firebase/auth';
import {
    MdPerson,
    MdWork,
    MdLocationOn,
    MdPhone,
    MdEmail,
    MdStar,
    MdSchedule,
    MdAttachMoney,
    MdSearch,
    MdFilterList,
    MdRefresh,
    MdError,
    MdCheckCircle
} from 'react-icons/md';

// Types for job seeker data
interface SeekerProfessional {
    id: string;
    createdBy?: string;
    createdAt?: any;
    selectedJobs?: string[]; // Array of job types like ["Plumber", "Carpenter"]
    cityTown?: string; // City name
    locality?: string; // Local area
    minIncome?: number;
    maxIncome?: number;
    shift?: string; // "day", "night", etc.
    jobType?: string; // "field", "office", etc.
    numJobs?: string;
    useCurrentLocation?: boolean;
    // Legacy fields for backward compatibility
    name?: string;
    profession?: string;
    experience?: string;
    city?: string;
    monthlyIncome?: {
        min: number;
        max: number;
    };
    jobShift?: string;
    phoneNumber?: string;
    email?: string;
    description?: string;
    skills?: string[];
    availability?: string;
}

interface SeekerRequirement {
    id: string;
    userId?: string; // Link to professional profile
    createdBy?: string;
    createdAt?: any;
    experience?: string[]; // Array like ["Less than 1 year"]
    minimumEducation?: string[]; // Array like ["12th"]
    preferredGender?: string; // "Male", "Female", etc.
    upiId?: string;
    // Legacy fields for backward compatibility
    seekerName?: string;
    desiredJobTitle?: string;
    preferredJobType?: string;
    preferredJobShift?: string;
    expectedSalary?: {
        min: number;
        max: number;
    };
    preferredLocation?: string;
    skills?: string[];
    additionalInfo?: string;
    contactPhone?: string;
    contactEmail?: string;
}

// Combined seeker data type - now includes both profile and requirement
interface JobSeekerData {
    userId: string; // The user's ID (from professional profile)
    professional?: SeekerProfessional; // Professional profile data
    requirement?: SeekerRequirement; // Job requirement data
    hasRequirement: boolean; // Whether this user has submitted job requirements
}

export default function FindJobPage() {
    const [user, setUser] = useState<User | null>(null);
    const [professionals, setProfessionals] = useState<SeekerProfessional[]>([]);
    const [requirements, setRequirements] = useState<SeekerRequirement[]>([]);
    const [combinedSeekers, setCombinedSeekers] = useState<JobSeekerData[]>([]);
    const [filteredSeekers, setFilteredSeekers] = useState<JobSeekerData[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string>('');
    const [searchTerm, setSearchTerm] = useState('');
    const [locationFilter, setLocationFilter] = useState('');
    const [professionFilter, setProfessionFilter] = useState('');
    const [filterHasRequirement, setFilterHasRequirement] = useState<'all' | 'with-requirement' | 'without-requirement'>('all');
    const [showDebug, setShowDebug] = useState(false);
    const [expandedCards, setExpandedCards] = useState<Set<string>>(new Set());

    const toggleCardExpansion = (userId: string) => {
        const newExpanded = new Set(expandedCards);
        if (newExpanded.has(userId)) {
            newExpanded.delete(userId);
        } else {
            newExpanded.add(userId);
        }
        setExpandedCards(newExpanded);
    };

    // Helper functions to get values from different field names
    const getName = (prof?: SeekerProfessional) => {
        if (!prof) return 'Unknown';
        return prof.name || prof.createdBy || 'Unknown';
    };

    const getProfession = (prof?: SeekerProfessional) => {
        if (!prof) return 'Not specified';
        return prof.profession || (prof.selectedJobs && prof.selectedJobs.length > 0 ? prof.selectedJobs.join(', ') : 'Not specified');
    };

    const getCity = (prof?: SeekerProfessional) => {
        if (!prof) return 'Not specified';
        return prof.city || prof.cityTown || 'Not specified';
    };

    const getIncome = (prof?: SeekerProfessional) => {
        if (!prof) return null;
        if (prof.monthlyIncome) {
            return { min: prof.monthlyIncome.min, max: prof.monthlyIncome.max };
        }
        if (prof.minIncome && prof.maxIncome) {
            return { min: prof.minIncome, max: prof.maxIncome };
        }
        return null;
    };

    const getJobShift = (prof?: SeekerProfessional) => {
        if (!prof) return 'Not specified';
        return prof.jobShift || prof.shift || 'Not specified';
    };

    const getExperience = (data?: SeekerProfessional | SeekerRequirement) => {
        if (!data) return 'Not specified';
        if ('experience' in data && data.experience) {
            if (Array.isArray(data.experience)) {
                return data.experience.join(', ');
            }
            return data.experience;
        }
        return 'Not specified';
    };

    // Auth state listener
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            setUser(currentUser);
        });
        return () => unsubscribe();
    }, []);

    // Fetch job seeker data from Firestore
    const fetchJobSeekers = async () => {
        console.log('🔍 Starting to fetch job seekers...');
        setLoading(true);
        setError('');

        try {
            const professionalsData: SeekerProfessional[] = [];
            const requirementsData: SeekerRequirement[] = [];

            // Fetch from seeker-proffessian collection
            try {
                console.log('📥 Fetching from seeker-proffessian collection...');
                const professionalsRef = collection(db, 'seeker-proffessian');
                const professionalsSnapshot = await getDocs(professionalsRef);
                console.log('✅ Professional profiles found:', professionalsSnapshot.size);

                professionalsSnapshot.forEach((doc) => {
                    const data = { id: doc.id, ...doc.data() } as SeekerProfessional;
                    console.log('👤 Professional:', data.name, '| Profession:', data.profession);
                    professionalsData.push(data);
                });
            } catch (error) {
                console.error('❌ Error fetching seeker-proffessian:', error);
                setError(prev => prev + 'Failed to load professional profiles. ');
            }

            // Fetch from seeker-requirement collection
            try {
                console.log('📥 Fetching from seeker-requirement collection...');
                const requirementsRef = collection(db, 'seeker-requirement');
                const requirementsSnapshot = await getDocs(requirementsRef);
                console.log('✅ Job requirements found:', requirementsSnapshot.size);

                requirementsSnapshot.forEach((doc) => {
                    const data = { id: doc.id, ...doc.data() } as SeekerRequirement;
                    console.log('💼 Requirement:', data.desiredJobTitle, '| User ID:', data.userId);
                    requirementsData.push(data);
                });
            } catch (error) {
                console.error('❌ Error fetching seeker-requirement:', error);
                setError(prev => prev + 'Failed to load job requirements. ');
            }

            console.log('📊 Total professionals:', professionalsData.length);
            console.log('📊 Total requirements:', requirementsData.length);

            setProfessionals(professionalsData);
            setRequirements(requirementsData);

            // Combine data
            const combined = combineJobSeekerData(professionalsData, requirementsData);
            console.log('🔗 Combined seekers:', combined.length);
            setCombinedSeekers(combined);
            setFilteredSeekers(combined);

        } catch (error) {
            console.error('Error fetching job seekers:', error);
            setError('Failed to load job seeker data. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // Combine professional and requirement data by matching user IDs
    const combineJobSeekerData = (
        professionalsData: SeekerProfessional[],
        requirementsData: SeekerRequirement[]
    ): JobSeekerData[] => {
        // Create a map of requirements by userId for quick lookup
        const requirementsByUserId = new Map<string, SeekerRequirement>();
        requirementsData.forEach(req => {
            // Match by createdBy field first (most common), then userId, then document ID
            const userId = req.createdBy || req.userId || req.id;
            console.log('📋 Mapping requirement - ID:', req.id, '| createdBy:', req.createdBy, '| userId:', req.userId, '| Using:', userId);
            requirementsByUserId.set(userId, req);
        });

        // Map professionals and attach their requirements if they exist
        const combined: JobSeekerData[] = professionalsData.map(prof => {
            // Try matching with createdBy first (most common), then document ID
            const userId = prof.createdBy || prof.id;
            const requirement = requirementsByUserId.get(userId);

            console.log('🔗 Matching professional - ID:', prof.id, '| createdBy:', prof.createdBy, '| Has requirement:', !!requirement);

            return {
                userId: userId,
                professional: prof,
                requirement: requirement,
                hasRequirement: !!requirement
            };
        });

        // Sort by creation date (most recent first)
        return combined.sort((a, b) => {
            const aTime = a.professional?.createdAt?.seconds || 0;
            const bTime = b.professional?.createdAt?.seconds || 0;
            return bTime - aTime;
        });
    };

    // Filter functionality
    useEffect(() => {
        let filtered = combinedSeekers;

        // Filter by requirement status
        if (filterHasRequirement === 'with-requirement') {
            filtered = filtered.filter(seeker => seeker.hasRequirement);
        } else if (filterHasRequirement === 'without-requirement') {
            filtered = filtered.filter(seeker => !seeker.hasRequirement);
        }

        // Search filter
        if (searchTerm) {
            filtered = filtered.filter(seeker => {
                const prof = seeker.professional;
                const req = seeker.requirement;
                const searchLower = searchTerm.toLowerCase();

                return (
                    getName(prof).toLowerCase().includes(searchLower) ||
                    getProfession(prof).toLowerCase().includes(searchLower) ||
                    (prof?.selectedJobs?.some(job => job.toLowerCase().includes(searchLower))) ||
                    (prof?.description?.toLowerCase().includes(searchLower)) ||
                    (prof?.skills?.some(skill => skill.toLowerCase().includes(searchLower))) ||
                    (req?.desiredJobTitle?.toLowerCase().includes(searchLower)) ||
                    (req?.additionalInfo?.toLowerCase().includes(searchLower))
                );
            });
        }

        // Location filter
        if (locationFilter) {
            filtered = filtered.filter(seeker => {
                const prof = seeker.professional;
                const req = seeker.requirement;
                const locationLower = locationFilter.toLowerCase();

                return (
                    getCity(prof).toLowerCase().includes(locationLower) ||
                    (prof?.locality?.toLowerCase().includes(locationLower)) ||
                    (req?.preferredLocation?.toLowerCase().includes(locationLower))
                );
            });
        }

        // Profession filter
        if (professionFilter) {
            filtered = filtered.filter(seeker => {
                const prof = seeker.professional;
                const req = seeker.requirement;
                const professionLower = professionFilter.toLowerCase();

                return (
                    getProfession(prof).toLowerCase().includes(professionLower) ||
                    (prof?.selectedJobs?.some(job => job.toLowerCase().includes(professionLower))) ||
                    (req?.desiredJobTitle?.toLowerCase().includes(professionLower))
                );
            });
        }

        setFilteredSeekers(filtered);
    }, [combinedSeekers, filterHasRequirement, searchTerm, locationFilter, professionFilter]);

    // Initial data fetch
    useEffect(() => {
        fetchJobSeekers();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    // Render combined seeker card (Professional Profile + Job Requirements)
    const renderSeekerCard = (seeker: JobSeekerData) => {
        const prof = seeker.professional;
        const req = seeker.requirement;
        const isExpanded = expandedCards.has(seeker.userId);

        if (!prof) return null; // Skip if no professional profile

        // Use a composite key to ensure uniqueness
        const uniqueKey = `${seeker.userId}-${prof.id || seeker.requirement?.id || 'unknown'}`;
        return (
            <div key={uniqueKey} className="bg-white rounded-2xl shadow-lg hover:shadow-xl transition-shadow border-2 border-[#F1B902] overflow-hidden">
                {/* Top Banner with Jobs */}
                <div className="bg-gradient-to-r from-[#F1B902] to-[#E7AD01] px-6 py-4">
                    <div className="flex items-center justify-center text-white">
                        <div className="text-center">
                            <p className="text-xs font-medium opacity-90 uppercase tracking-wide mb-1">Available for Jobs</p>
                            <h3 className="text-3xl font-bold drop-shadow-sm">{getProfession(prof)}</h3>
                        </div>
                    </div>
                    {isExpanded && seeker.hasRequirement && req && req.desiredJobTitle && (
                        <div className="mt-3 pt-3 border-t border-white border-opacity-30">
                            <p className="text-xs font-medium opacity-90 uppercase tracking-wide mb-1">Seeking Position</p>
                            <h3 className="text-xl font-bold drop-shadow-sm">{req.desiredJobTitle}</h3>
                        </div>
                    )}
                </div>

                {/* Card Content */}
                <div className="p-6">
                    {/* Seeker-Requirement Info - Always visible when collapsed */}
                    {!isExpanded && seeker.hasRequirement && req && (
                        <div className="mb-4">
                            <div className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-300 rounded-xl p-5 shadow-md">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-2">
                                        <MdWork className="text-blue-600 text-2xl" />
                                        <span className="text-base font-bold text-blue-900">
                                            Seeker-Requirement Data
                                        </span>
                                    </div>
                                    <span className="bg-blue-600 text-white px-3 py-1.5 rounded-full text-xs font-bold shadow-sm">
                                        ✓ Available
                                    </span>
                                </div>

                                <div className="space-y-3">
                                    {req.desiredJobTitle && (
                                        <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                            <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Seeking Position:</p>
                                            <p className="text-sm font-bold text-blue-900">{req.desiredJobTitle}</p>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-2 gap-3">
                                        {req.experience && req.experience.length > 0 && (
                                            <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Experience:</p>
                                                <p className="text-sm font-medium text-blue-900">{getExperience(req)}</p>
                                            </div>
                                        )}

                                        {req.minimumEducation && req.minimumEducation.length > 0 && (
                                            <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Education:</p>
                                                <p className="text-sm font-medium text-blue-900">{req.minimumEducation.join(', ')}</p>
                                            </div>
                                        )}

                                        {req.preferredGender && (
                                            <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Gender:</p>
                                                <p className="text-sm font-medium text-blue-900">{req.preferredGender}</p>
                                            </div>
                                        )}

                                        {req.upiId && (
                                            <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                                <p className="text-xs text-blue-600 font-semibold uppercase mb-1">UPI ID:</p>
                                                <p className="text-sm font-medium text-blue-900 truncate">{req.upiId}</p>
                                            </div>
                                        )}
                                    </div>

                                    {req.preferredLocation && (
                                        <div className="bg-white bg-opacity-70 p-3 rounded-lg">
                                            <p className="text-xs text-blue-600 font-semibold uppercase mb-1">Preferred Location:</p>
                                            <p className="text-sm font-medium text-blue-900">{req.preferredLocation}</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* View Full Button - Always visible */}
                    <div className="mb-4">
                        <button
                            onClick={() => toggleCardExpansion(seeker.userId)}
                            className="w-full bg-gradient-to-r from-[#F1B902] to-[#E7AD01] text-white py-3 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm flex items-center justify-center gap-2"
                        >
                            {isExpanded ? '▲ Hide Details' : '▼ View Full Details'}
                        </button>
                    </div>

                    {/* Expanded Content - Only show when expanded */}
                    {isExpanded && (
                        <>
                            {/* Header with Jobs */}
                            <div className="flex justify-between items-start mb-4">
                                <div className="flex gap-4 items-center">
                                    <div className="w-16 h-16 bg-gradient-to-r from-[#F1B902] to-[#E7AD01] rounded-full flex items-center justify-center shadow-lg">
                                        <MdWork className="text-white text-3xl" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-[#F1B902]">{getProfession(prof)}</p>
                                    </div>
                                </div>
                                <div className="flex flex-col gap-2 items-end">
                                    <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium">
                                        Seeker-Proffessian
                                    </span>
                                    {seeker.hasRequirement && (
                                        <span className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium">
                                            + Seeker-Requirement
                                        </span>
                                    )}
                                </div>
                            </div>

                            {/* Professional Profile Section */}
                            <div className="border-l-4 border-[#F1B902] pl-4 mb-4 bg-gray-50 -ml-6 pl-10 pr-6 py-4">
                                <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                    <MdWork className="text-[#F1B902]" />
                                    Seeker-Proffessian Data
                                </h4>

                                {/* Selected Jobs/Profession */}
                                <div className="mb-4 bg-[#F1B902] bg-opacity-10 p-4 rounded-lg border-l-4 border-[#F1B902]">
                                    <p className="text-xs text-gray-600 mb-1 font-semibold uppercase">Selected Jobs:</p>
                                    <p className="text-lg font-bold text-[#F1B902]">{getProfession(prof)}</p>
                                    {prof.numJobs && (
                                        <p className="text-xs text-gray-500 mt-1">Number of jobs: {prof.numJobs}</p>
                                    )}
                                </div>

                                {/* Basic Info Grid - Show all fields */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <MdLocationOn className="text-[#F1B902]" />
                                            <span className="text-xs font-semibold uppercase">City/Town</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{getCity(prof)}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <MdLocationOn className="text-[#F1B902]" />
                                            <span className="text-xs font-semibold uppercase">Locality</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{prof.locality || 'Not specified'}</span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <MdAttachMoney className="text-[#F1B902]" />
                                            <span className="text-xs font-semibold uppercase">Income Range</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">
                                            {getIncome(prof) ? `₹${getIncome(prof)!.min} - ₹${getIncome(prof)!.max}` : 'Not specified'}
                                        </span>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm">
                                        <div className="flex items-center gap-2 text-gray-500 mb-1">
                                            <MdSchedule className="text-[#F1B902]" />
                                            <span className="text-xs font-semibold uppercase">Shift</span>
                                        </div>
                                        <span className="text-sm font-medium text-gray-800">{getJobShift(prof)}</span>
                                    </div>
                                </div>

                                {/* Job Type */}
                                <div className="grid grid-cols-2 gap-4 mb-4">
                                    <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-[#F1B902]">
                                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Job Type</p>
                                        <p className="text-sm font-bold text-[#F1B902]">{prof.jobType || 'Not specified'}</p>
                                    </div>
                                    <div className="bg-white p-3 rounded-lg shadow-sm border-l-4 border-blue-500">
                                        <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Use Current Location</p>
                                        <p className="text-sm font-bold text-blue-600">{prof.useCurrentLocation ? 'Yes' : 'No'}</p>
                                    </div>
                                </div>

                                {/* Skills - if available */}
                                {prof.skills && prof.skills.length > 0 && (
                                    <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                        <p className="text-xs text-gray-500 font-semibold uppercase mb-3">Skills</p>
                                        <div className="flex flex-wrap gap-2">
                                            {prof.skills.map((skill, idx) => (
                                                <span key={idx} className="bg-[#F1B902] bg-opacity-10 text-[#F1B902] px-3 py-1.5 rounded-full text-sm font-medium border border-[#F1B902] border-opacity-20">
                                                    {skill}
                                                </span>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>

                            {/* Job Requirements Section (if exists) */}
                            {seeker.hasRequirement && req && (
                                <div className="border-l-4 border-blue-500 pl-4 mb-4 bg-blue-50 bg-opacity-30 py-3 -ml-0 pl-4">
                                    <h4 className="text-lg font-bold text-gray-800 mb-4 flex items-center gap-2">
                                        <MdWork className="text-blue-600" />
                                        Seeker-Requirement Data
                                    </h4>

                                    {/* Experience */}
                                    {req.experience && req.experience.length > 0 && (
                                        <div className="mb-4 bg-blue-100 p-4 rounded-lg border-l-4 border-blue-500">
                                            <p className="text-xs text-gray-600 mb-1 font-semibold uppercase">Experience Required:</p>
                                            <p className="text-lg font-bold text-blue-700">{getExperience(req)}</p>
                                        </div>
                                    )}

                                    {/* Education & Gender */}
                                    <div className="grid grid-cols-2 gap-4 mb-4">
                                        {req.minimumEducation && req.minimumEducation.length > 0 && (
                                            <div className="bg-white p-3 rounded-lg shadow-sm">
                                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Minimum Education</p>
                                                <p className="text-sm font-medium text-gray-800">{req.minimumEducation.join(', ')}</p>
                                            </div>
                                        )}
                                        {req.preferredGender && (
                                            <div className="bg-white p-3 rounded-lg shadow-sm">
                                                <p className="text-xs text-gray-500 font-semibold uppercase mb-1">Preferred Gender</p>
                                                <p className="text-sm font-medium text-gray-800">{req.preferredGender}</p>
                                            </div>
                                        )}
                                    </div>

                                    {/* UPI ID */}
                                    {req.upiId && (
                                        <div className="bg-white p-4 rounded-lg shadow-sm mb-4">
                                            <p className="text-xs text-gray-500 font-semibold uppercase mb-2">UPI ID</p>
                                            <p className="text-sm font-medium text-gray-800">{req.upiId}</p>
                                        </div>
                                    )}

                                    {/* Legacy fields if available */}
                                    {(req.desiredJobTitle || req.preferredLocation || req.preferredJobType || req.preferredJobShift) && (
                                        <div className="bg-white p-4 rounded-lg shadow-sm">
                                            <p className="text-xs text-gray-500 font-semibold uppercase mb-3">Additional Requirements</p>
                                            <div className="space-y-2">
                                                {req.desiredJobTitle && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">Desired Job:</span>
                                                        <span className="text-sm font-medium text-gray-800 ml-2">{req.desiredJobTitle}</span>
                                                    </div>
                                                )}
                                                {req.preferredLocation && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">Preferred Location:</span>
                                                        <span className="text-sm font-medium text-gray-800 ml-2">{req.preferredLocation}</span>
                                                    </div>
                                                )}
                                                {req.preferredJobType && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">Job Type:</span>
                                                        <span className="text-sm font-medium text-gray-800 ml-2">{req.preferredJobType}</span>
                                                    </div>
                                                )}
                                                {req.preferredJobShift && (
                                                    <div>
                                                        <span className="text-xs text-gray-500">Job Shift:</span>
                                                        <span className="text-sm font-medium text-gray-800 ml-2">{req.preferredJobShift}</span>
                                                    </div>
                                                )}
                                                {req.additionalInfo && (
                                                    <div className="mt-2 pt-2 border-t border-gray-200">
                                                        <p className="text-gray-600 text-sm italic">{req.additionalInfo}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            )}

                            {/* Contact Actions */}
                            <div className="flex gap-3 mt-4">
                                {prof.phoneNumber && (
                                    <a
                                        href={`tel:${prof.phoneNumber}`}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <MdPhone />
                                        <span className="text-sm">Call</span>
                                    </a>
                                )}
                                {prof.email && (
                                    <a
                                        href={`mailto:${prof.email}`}
                                        className="flex items-center gap-2 px-4 py-2 border border-gray-200 rounded-xl text-gray-600 hover:bg-gray-50 transition-colors"
                                    >
                                        <MdEmail />
                                        <span className="text-sm">Email</span>
                                    </a>
                                )}
                                <button className="flex-1 bg-gradient-to-r from-[#F1B902] to-[#E7AD01] text-white py-2 px-4 rounded-xl font-semibold hover:opacity-90 transition-opacity text-sm">
                                    Candidate Requirement
                                </button>
                            </div>
                        </>
                    )}
                </div> {/* Close card content wrapper */}
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header hidden from frontend, code preserved for future use */}
            {false && (
                <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                        <div className="flex justify-between items-center py-6">
                            <div>
                                <h1 className="text-3xl font-bold text-gray-900">Job Seekers Database</h1>
                                <p className="text-gray-600 mt-1">
                                    Browse seeker-proffessian and seeker-requirement data
                                </p>
                            </div>
                            <button
                                onClick={fetchJobSeekers}
                                className="flex items-center gap-2 px-4 py-2 bg-[#F1B902] text-white rounded-lg hover:bg-[#E7AD01] transition-colors"
                                disabled={loading}
                            >
                                <MdRefresh className={loading ? 'animate-spin' : ''} />
                                Refresh
                            </button>
                            <button
                                onClick={() => setShowDebug(!showDebug)}
                                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                {showDebug ? '👁️ Hide' : '🔍 Debug'}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Debug Data Display */}
            {showDebug && (
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-6">
                    <div className="bg-gray-900 text-green-400 rounded-2xl p-6 font-mono text-sm overflow-auto max-h-96">
                        <h3 className="text-xl font-bold mb-4 text-white">🔍 Raw Database Data</h3>
                        <div className="space-y-4">
                            <div>
                                <p className="text-yellow-400 font-bold">Seeker-Proffessian Collection ({professionals.length}):</p>
                                <pre className="mt-2 text-xs">{JSON.stringify(professionals, null, 2)}</pre>
                            </div>
                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <p className="text-yellow-400 font-bold">Seeker-Requirement Collection ({requirements.length}):</p>
                                <pre className="mt-2 text-xs">{JSON.stringify(requirements, null, 2)}</pre>
                            </div>
                            <div className="border-t border-gray-700 pt-4 mt-4">
                                <p className="text-yellow-400 font-bold">Combined Seekers ({combinedSeekers.length}):</p>
                                <pre className="mt-2 text-xs">{JSON.stringify(combinedSeekers, null, 2)}</pre>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border-l-4 border-red-500 p-4 mx-4 mt-4 rounded-r-lg">
                    <div className="flex items-center">
                        <MdError className="text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Search and Filter Controls */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        {/* Search */}
                        <div className="md:col-span-2">
                            <label className="block text-sm font-medium mb-2 text-gray-700">Search</label>
                            <div className="relative">
                                <MdSearch className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-xl" />
                                <input
                                    type="text"
                                    placeholder="Name, profession, skills..."
                                    className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F1B902] focus:border-transparent"
                                    value={searchTerm}
                                    onChange={(e) => setSearchTerm(e.target.value)}
                                />
                            </div>
                        </div>

                        {/* Location Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Location</label>
                            <input
                                type="text"
                                placeholder="City..."
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F1B902] focus:border-transparent"
                                value={locationFilter}
                                onChange={(e) => setLocationFilter(e.target.value)}
                            />
                        </div>

                        {/* Type Filter */}
                        <div>
                            <label className="block text-sm font-medium mb-2 text-gray-700">Filter</label>
                            <select
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#F1B902] focus:border-transparent bg-white"
                                value={filterHasRequirement}
                                onChange={(e) => setFilterHasRequirement(e.target.value as 'all' | 'with-requirement' | 'without-requirement')}
                            >
                                <option value="all">All Seekers ({combinedSeekers.length})</option>
                                <option value="with-requirement">With Job Requirements ({combinedSeekers.filter(s => s.hasRequirement).length})</option>
                                <option value="without-requirement">Profile Only ({combinedSeekers.filter(s => !s.hasRequirement).length})</option>
                            </select>
                        </div>
                    </div>

                    {(searchTerm || locationFilter || professionFilter || filterHasRequirement !== 'all') && (
                        <div className="mt-4 flex justify-end">
                            <button
                                onClick={() => {
                                    setSearchTerm('');
                                    setLocationFilter('');
                                    setProfessionFilter('');
                                    setFilterHasRequirement('all');
                                }}
                                className="text-sm text-gray-600 hover:text-gray-800"
                            >
                                Clear all filters
                            </button>
                        </div>
                    )}
                </div>

                {/* Summary Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="bg-gradient-to-r from-[#F1B902] to-[#E7AD01] rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3">
                            <MdPerson className="text-3xl" />
                            <div>
                                <h3 className="text-2xl font-bold">{professionals.length}</h3>
                                <p className="opacity-90">Seeker-Proffessian</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3">
                            <MdWork className="text-3xl" />
                            <div>
                                <h3 className="text-2xl font-bold">{combinedSeekers.filter(s => s.hasRequirement).length}</h3>
                                <p className="opacity-90">Seeker-Requirement</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-green-500 to-green-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3">
                            <MdCheckCircle className="text-3xl" />
                            <div>
                                <h3 className="text-2xl font-bold">{filteredSeekers.length}</h3>
                                <p className="opacity-90">Displayed Results</p>
                            </div>
                        </div>
                    </div>
                    <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-2xl p-6 text-white">
                        <div className="flex items-center gap-3">
                            <MdPerson className="text-3xl" />
                            <div>
                                <h3 className="text-2xl font-bold">{combinedSeekers.filter(s => !s.hasRequirement).length}</h3>
                                <p className="opacity-90">Proffessian Only</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Content */}
                {loading ? (
                    <div className="text-center py-12">
                        <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-[#F1B902]"></div>
                        <p className="mt-4 text-gray-600">Loading job seekers...</p>
                    </div>
                ) : filteredSeekers.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-2xl shadow-lg p-8">
                        <MdError className="mx-auto text-6xl text-gray-400 mb-4" />
                        <h3 className="text-xl font-semibold text-gray-700 mb-2">No job seekers found</h3>
                        <p className="text-gray-600 mb-4">
                            {searchTerm || locationFilter || filterHasRequirement !== 'all'
                                ? 'Try adjusting your search or filter criteria.'
                                : 'No data available in the database.'}
                        </p>
                        <div className="mt-6 p-4 bg-gray-50 rounded-lg text-left max-w-md mx-auto">
                            <p className="text-sm font-semibold text-gray-700 mb-2">Debug Info:</p>
                            <ul className="text-xs text-gray-600 space-y-1">
                                <li>• Seeker-Proffessian: {professionals.length}</li>
                                <li>• Seeker-Requirement: {requirements.length}</li>
                                <li>• Combined Seekers: {combinedSeekers.length}</li>
                                <li>• Filtered Results: {filteredSeekers.length}</li>
                                {error && <li className="text-red-600">• Error: {error}</li>}
                            </ul>
                            <p className="text-xs text-gray-500 mt-3">Check browser console for detailed logs.</p>
                        </div>
                        <button
                            onClick={() => fetchJobSeekers()}
                            className="mt-6 px-6 py-3 bg-gradient-to-r from-[#F1B902] to-[#E7AD01] text-white rounded-xl font-semibold hover:opacity-90 transition-opacity"
                        >
                            Retry Loading Data
                        </button>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        {filteredSeekers.map(seeker => renderSeekerCard(seeker))}
                    </div>
                )}
            </div>
        </div>
    );
}