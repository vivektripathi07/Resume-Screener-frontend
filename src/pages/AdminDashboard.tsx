import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Briefcase, Clock, Download, Eye, Check, X } from 'lucide-react';

// Type definitions
interface Job {
  id: string;
  title: string;
  company: string;
  location: string;
  type: 'Full-time' | 'Part-time' | 'Contract' | 'Internship';
  posted: string;
  applicants: number;
  status: 'Active' | 'Closed' | 'Paused';
  department: string;
  logo?: string;
}

interface Applicant {
  id: string;
  name: string;
  email: string;
  phone: string;
  appliedDate: string;
  experience: string;
  resumeUrl: string;
  status: 'Pending' | 'Reviewed' | 'Shortlisted' | 'Rejected';
  jobId: string;
  skills: string[];
  education: string;
}

const AdminDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch Jobs from API
  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await fetch('http://localhost:8000/api/jobs');
        if (!res.ok) throw new Error(`Failed to load jobs (${res.status})`);
        const data: Job[] = await res.json();

        setJobs(data);
        if (data.length > 0) setSelectedJob(data[0]);
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

        const mappedApplicants: Applicant[] = data.map((app: any) => ({
          id: app._id,
          name: app.user_email.split('@')[0], // placeholder name
          email: app.user_email,
          phone: 'N/A', // placeholder
          appliedDate: new Date(app.uploaded_at).toLocaleDateString(),
          experience: 'N/A', // placeholder
          resumeUrl: `http://localhost:8000/api/resume/download/${app._id}`, // download endpoint
          status: 'Pending', // default status
          jobId: app.job_id,
          skills: [],
          education: 'N/A',
        }));

        setApplicants(mappedApplicants);
      } catch (err: any) {
        console.error(err);
        setApplicants([]);
      }
    };

    fetchApplicants();
  }, [selectedJob]);

  // Filtered applicants by status
  const filteredApplicants = applicants.filter(app => {
    if (statusFilter === 'all') return true;
    return app.status.toLowerCase() === statusFilter.toLowerCase();
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

  // Update applicant status (local only)
  const updateApplicantStatus = (applicantId: string, newStatus: Applicant['status']) => {
    setApplicants(prev =>
      prev.map(app => (app.id === applicantId ? { ...app, status: newStatus } : app))
    );
  };

  if (loading) return <div className="flex items-center justify-center min-h-screen text-gray-500">Loading jobs...</div>;
  if (error) return <div className="flex items-center justify-center min-h-screen text-red-500">{error}</div>;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      {/* Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="px-6 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
          <div className="flex items-center gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{jobs.filter(j => j.status === 'Active').length}</div>
              <div className="text-xs text-gray-600">Active Jobs</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{applicants.length}</div>
              <div className="text-xs text-gray-600">Total Applicants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{applicants.filter(a => a.status === 'Pending').length}</div>
              <div className="text-xs text-gray-600">Pending Review</div>
            </div>
          </div>
        </div>
      </div>

      <div className="flex h-[calc(100vh-88px)]">
        {/* Left Panel: Job list */}
        <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
          <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-gray-900">Job Openings</h2>
              <button className="text-blue-600 hover:text-blue-800"><Filter className="w-5 h-5" /></button>
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
                key={job.id}
                onClick={() => setSelectedJob(job)}
                className={`mb-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${selectedJob?.id === job.id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 hover:border-gray-300 bg-white'}`}
              >
                <div className="flex items-start justify-between mb-2">
                  <h3 className="font-semibold text-gray-900">{job.title}</h3>
                  <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status)}`}>{job.status}</span>
                </div>
                <p className="text-sm text-gray-600 mb-3">{job.company}</p>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
                  <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>
                </div>
                <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-500 flex items-center gap-1"><Clock className="w-3 h-3" /> {job.posted}</span>
                  <span className="text-sm font-semibold text-blue-600">{job.applicants} applicants</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Panel: Applicants */}
        <div className="flex-1 bg-gray-50 overflow-y-auto">
          {selectedJob ? (
            <div className="p-6">
              <h2 className="text-xl font-semibold text-gray-900 mb-4">Applicants for {selectedJob.title}</h2>
              {filteredApplicants.length === 0 ? (
                <div className="text-gray-500">No applicants found.</div>
              ) : (
                filteredApplicants.map(applicant => (
                  <div key={applicant.id} className="bg-white rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-shadow">
                    <div className="flex justify-between">
                      <div>
                        <h3 className="font-semibold text-lg">{applicant.name}</h3>
                        <p className="text-sm text-gray-600">{applicant.email}</p>
                        <p className="text-sm text-gray-600">{applicant.phone}</p>
                        <p className="text-sm text-gray-600 mt-2">
                          <strong>Status:</strong>{' '}
                          <span className={`px-2 py-1 rounded-full text-xs ${getStatusColor(applicant.status)}`}>
                            {applicant.status}
                          </span>
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <a
                          href={applicant.resumeUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 px-3 py-2 bg-blue-600 text-white text-sm rounded-lg hover:bg-blue-700"
                        >
                          <Eye className="w-4 h-4" /> View Resume
                        </a>
                        <a
                          href={applicant.resumeUrl}
                          download
                          className="flex items-center gap-2 px-3 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
                        >
                          <Download className="w-4 h-4" /> Download
                        </a>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => updateApplicantStatus(applicant.id, 'Shortlisted')}
                            className="flex-1 p-2 bg-green-500 text-white rounded-lg hover:bg-green-600"
                          >
                            <Check className="w-4 h-4 mx-auto" />
                          </button>
                          <button
                            onClick={() => updateApplicantStatus(applicant.id, 'Rejected')}
                            className="flex-1 p-2 bg-red-500 text-white rounded-lg hover:bg-red-600"
                          >
                            <X className="w-4 h-4 mx-auto" />
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">Select a job to view applicants</div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
