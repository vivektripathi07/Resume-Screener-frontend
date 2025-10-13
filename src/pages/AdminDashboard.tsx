import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, Download, Eye, Check, X, Star, TrendingUp, Clock, Users } from 'lucide-react';

export interface Job {
  _id: string;
  title: string;
  company: string;
  logo: string;
  description: string;
  overview: string;
  requiredSkills: string[];
  compensation: string;
  responsibilities: string[];
  requirements: string[];
  location: string;
  type: string;
  experience: string;
  applicants: number;
  isVerified: boolean;
  isTrusted: boolean;
  isSaved: boolean;
  status?: 'Active' | 'Closed' | 'Paused';
  postedDate?: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  appliedDate: string;
  experience: string;
  resumeUrl: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected';
  jobId: string;
  skills: string[];
  education: string;
  aiScore: number;
  fileSize: number;
  filename: string;
}

const AdminDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('score');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);

  // Fetch Jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/jobs');
        if (!res.ok) throw new Error(`Failed to load jobs (${res.status})`);
        const data: Job[] = await res.json();

        // Add default status if not present
        const enhancedJobs = data.map(job => ({
          ...job,
          status: job.status || 'Active',
          postedDate: job.postedDate || new Date().toISOString()
        }));

        setJobs(enhancedJobs);
        if (enhancedJobs.length > 0) setSelectedJob(enhancedJobs[0]);
      } catch (err: any) {
        console.error(err);
        setError(err.message || 'Error loading jobs');
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, []);

  // Fetch Applicants for the selected job
  useEffect(() => {
    const fetchApplicants = async () => {
      if (!selectedJob) return;
      try {
        const res = await fetch(`http://localhost:8000/api/applicants?jobId=${selectedJob._id}`);
        if (!res.ok) throw new Error('Failed to load applicants');

        const data = await res.json();
        // console.log('API Response:', data);

        const mappedApplicants: Applicant[] = data.map((app: any) => ({
          id: app._id.toString(),
          name: extractNameFromEmail(app.user_email),
          email: app.user_email,
          appliedDate: new Date(app.uploaded_at).toLocaleDateString(),
          experience: parseExperienceFromSkills(app.skills),
          resumeUrl: `http://localhost:8000/api/applicant/file?applicantId=${app._id.toString()}`,
          status: determineInitialStatus(app.ai_score),
          jobId: app.job_id,
          skills: parseSkills(app.skills),
          education: 'Extracted from resume',
          aiScore: parseInt(app.ai_score) || 0,
          fileSize: app.size,
          filename: app.filename
        }));
        

        // Sort by AI score by default
        const sortedApplicants = mappedApplicants.sort((a, b) => b.aiScore - a.aiScore);
        setApplicants(sortedApplicants);
      } catch (err: any) {
        console.error(err);
        setApplicants([]);
      }
    };

    fetchApplicants();
  }, [selectedJob]);


  // Helper functions
  const extractNameFromEmail = (email: string): string => {
    const username = email.split('@')[0];
    return username
      .split(/[._-]/)
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  const parseSkills = (skillsString: string): string[] => {
    if (!skillsString) return [];
    return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
  };

  const parseExperienceFromSkills = (skills: string): string => {
    const skillsList = parseSkills(skills);
    if (skillsList.length > 10) return '5+ years';
    if (skillsList.length > 5) return '2-5 years';
    return '0-2 years';
  };

  const determineInitialStatus = (score: string | number): Applicant['status'] => {
    const numScore = typeof score === 'string' ? parseInt(score) : score;
    if (numScore >= 80) return 'Shortlisted';
    if (numScore >= 60) return 'Reviewed';
    return 'Pending';
  };

  // Filtered and sorted applicants
  const filteredApplicants = applicants
    .filter(app => {
      if (statusFilter === 'all') return true;
      return app.status.toLowerCase() === statusFilter.toLowerCase();
    })
    .sort((a, b) => {
      if (sortBy === 'score') return b.aiScore - a.aiScore;
      return new Date(b.appliedDate).getTime() - new Date(a.appliedDate).getTime();
    });

  // Badge colors
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-green-100 text-green-800';
      case 'Closed': return 'bg-red-100 text-red-800';
      case 'Paused': return 'bg-yellow-100 text-yellow-800';
      case 'Pending': return 'bg-blue-100 text-blue-800';
      case 'Reviewed': return 'bg-purple-100 text-purple-800';
      case 'Shortlisted': return 'bg-green-100 text-green-800';
      case 'Rejected': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600 bg-green-50';
    if (score >= 60) return 'text-yellow-600 bg-yellow-50';
    if (score >= 40) return 'text-orange-600 bg-orange-50';
    return 'text-red-600 bg-red-50';
  };

  // Update applicant status
  const updateApplicantStatus = async (applicantId: string, newStatus: Applicant['status']) => {
    setApplicants(prev =>
      prev.map(app => (app.id === applicantId ? { ...app, status: newStatus } : app))
    );

    // Optional: Send update to backend
    try {
      await fetch(`http://localhost:8000/api/applicants/${applicantId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
    } catch (err) {
      console.error('Failed to update status on server:', err);
    }
  };

  // Calculate statistics
  const getJobStats = () => {
    const activeJobs = jobs.filter(j => j.status === 'Active').length;
    const totalApplicants = jobs.reduce((sum, job) => sum + (job.applicants || 0), 0);
    const avgScore = applicants.length > 0 
      ? Math.round(applicants.reduce((sum, app) => sum + app.aiScore, 0) / applicants.length)
      : 0;

    return { activeJobs, totalApplicants, avgScore };
  };

  const stats = getJobStats();

  if (loading) return (
    <div className="flex flex-col items-center justify-center min-h-screen">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      <p className="mt-4 text-gray-500">Loading dashboard...</p>
    </div>
  );

  if (error) return (
    <div className="flex items-center justify-center min-h-screen">
      <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
        {error}
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <div className="flex items-center gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">{stats.activeJobs}</div>
                <div className="text-xs text-gray-600">Active Jobs</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">{stats.totalApplicants}</div>
                <div className="text-xs text-gray-600">Total Applicants</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">{applicants.filter(a => a.status === 'Pending').length}</div>
                <div className="text-xs text-gray-600">Pending Review</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-yellow-600">{stats.avgScore}%</div>
                <div className="text-xs text-gray-600">Avg ATS Score</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Panel: Job list */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Job Openings ({jobs.length})</h2>
              <button className="text-blue-600 hover:text-blue-800">
                <Filter className="w-5 h-5" />
              </button>
            </div>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                placeholder="Search jobs..."
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={searchTerm}
                onChange={e => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          <div className="p-4">
            {jobs.filter(j => j.title.toLowerCase().includes(searchTerm.toLowerCase())).map(job => (
              <div
                key={job._id}
                onClick={() => setSelectedJob(job)}
                className={`mb-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
                  selectedJob?._id === job._id 
                    ? 'border-blue-500 bg-blue-50' 
                    : 'border-gray-200 hover:border-gray-300 bg-white'
                }`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status || 'Active')}`}>
                    {job.status || 'Active'}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{job.company}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {job.location}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-3 h-3" /> {job.type}
                  </span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 flex items-center gap-1">
                    <Clock className="w-3 h-3" /> {job.experience}
                  </span>
                  <span className="text-sm font-semibold text-blue-600">
                    <Users className="w-3 h-3 inline mr-1" />
                    {job.applicants} applicants
                  </span>
                </div>
                {job.isVerified && (
                  <div className="mt-2 flex items-center gap-2">
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">✓ Verified</span>
                    {job.isTrusted && (
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">★ Trusted</span>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Applicants */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {selectedJob ? (
            <div className="p-6">
              {/* Header with filters */}
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-4">
                  Applicants for {selectedJob.title}
                </h2>
                <div className="flex gap-4 items-center">
                  <select
                    value={statusFilter}
                    onChange={e => setStatusFilter(e.target.value)}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="all">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="reviewed">Reviewed</option>
                    <option value="shortlisted">Shortlisted</option>
                    <option value="rejected">Rejected</option>
                  </select>
                  <select
                    value={sortBy}
                    onChange={e => setSortBy(e.target.value as 'date' | 'score')}
                    className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <option value="score">Sort by ATS Score</option>
                    <option value="date">Sort by Date</option>
                  </select>
                  <div className="ml-auto text-sm text-gray-600">
                    Showing {filteredApplicants.length} of {applicants.length} applicants
                  </div>
                </div>
              </div>

              {/* Applicants list */}
              {filteredApplicants.length === 0 ? (
                <div className="bg-white rounded-lg p-8 text-center text-gray-500">
                  <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                  No applicants found for the selected filters.
                </div>
              ) : (
                filteredApplicants.map(applicant => (
                  <div 
                    key={applicant.id} 
                    className={`bg-white rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-all ${
                      selectedApplicant === applicant.id ? 'ring-2 ring-blue-500' : ''
                    }`}
                    onClick={() => setSelectedApplicant(applicant.id)}
                  >
                    <div className="flex justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="font-semibold text-lg">{applicant.name}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(applicant.status)}`}>
                            {applicant.status}
                          </span>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{applicant.email}</p>
                        <p className="text-xs text-gray-500 mb-3">Applied on {applicant.appliedDate}</p>
                        
                        {/* AI Score Display */}
                        <div className="flex items-center gap-4 mb-3">
                          <div className={`flex items-center gap-2 px-3 py-1 rounded-lg ${getScoreColor(applicant.aiScore)}`}>
                            <TrendingUp className="w-4 h-4" />
                            <span className="font-semibold">ATS Score: {applicant.aiScore}%</span>
                          </div>
                          <span className="text-sm text-gray-600">Experience: {applicant.experience}</span>
                        </div>

                        {/* Skills */}
                        <div className="mb-3">
                          <p className="text-xs text-gray-500 mb-1">Key Skills:</p>
                          <div className="flex flex-wrap gap-1">
                            {applicant.skills.slice(0, 5).map((skill, idx) => (
                              <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                                {skill}
                              </span>
                            ))}
                            {applicant.skills.length > 5 && (
                              <span className="px-2 py-1 bg-gray-100 text-xs rounded text-gray-500">
                                +{applicant.skills.length - 5} more
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Resume info */}
                        <p className="text-xs text-gray-400">
                          Resume: {applicant.filename} ({(applicant.fileSize / 1024).toFixed(1)} KB)
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex flex-col gap-2 ml-4">
                        <a
                          href={applicant.resumeUrl}
                          download={applicant.filename}
                          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50 transition"
                        >
                          <Download className="w-4 h-4" /> Download Resume
                        </a>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateApplicantStatus(applicant.id, 'Shortlisted');
                            }}
                            disabled={applicant.status === 'Shortlisted'}
                            className={`flex-1 p-2 rounded-lg transition ${
                              applicant.status === 'Shortlisted'
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-green-500 text-white hover:bg-green-600'
                            }`}
                            title="Shortlist"
                          >
                            <Check className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              updateApplicantStatus(applicant.id, 'Rejected');
                            }}
                            disabled={applicant.status === 'Rejected'}
                            className={`flex-1 p-2 rounded-lg transition ${
                              applicant.status === 'Rejected'
                                ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
                                : 'bg-red-500 text-white hover:bg-red-600'
                            }`}
                            title="Reject"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* AI Score Breakdown (optional expansion) */}
                    {selectedApplicant === applicant.id && (
                      <div className="mt-4 pt-4 border-t border-gray-200">
                        <p className="text-sm font-semibold text-gray-700 mb-2">AI Analysis Details:</p>
                        <div className="grid grid-cols-3 gap-3 text-xs">
                          <div>
                            <span className="text-gray-500">Skill Match:</span>
                            <div className="mt-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-blue-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(applicant.aiScore + 10, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Experience:</span>
                            <div className="mt-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-green-600 h-2 rounded-full" 
                                style={{ width: `${Math.min(applicant.aiScore - 5, 100)}%` }}
                              />
                            </div>
                          </div>
                          <div>
                            <span className="text-gray-500">Overall Fit:</span>
                            <div className="mt-1 bg-gray-200 rounded-full h-2">
                              <div 
                                className="bg-purple-600 h-2 rounded-full" 
                                style={{ width: `${applicant.aiScore}%` }}
                              />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-gray-500">
              <Briefcase className="w-16 h-16 mb-4 text-gray-300" />
              <p className="text-lg">Select a job to view applicants</p>
              <p className="text-sm mt-2">Choose from the list on the left</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;