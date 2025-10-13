// src/pages/AdminDashboard.tsx
import React, { useState, useEffect } from 'react';
import JobListPanel from '../components/admin/JobPanelList';
import ApplicantList from '../components/admin/ApplicantList';
import type { Job } from '../components/types';

const AdminDashboard: React.FC = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchJobs = async () => {
      const res = await fetch('http://localhost:8000/api/jobs');
      const data: Job[] = await res.json();
      setJobs(
        data.map((j) => ({
          ...j,
          // status: j.status || 'Active',
          // postedDate: j.appliedDate|| new Date().toISOString(),
        }))
      );
      setSelectedJob(data[0] || null);
    };
    fetchJobs();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex">
      <JobListPanel jobs={jobs} selectedJob={selectedJob} onSelect={setSelectedJob} searchTerm={searchTerm} setSearchTerm={setSearchTerm} />
      <ApplicantList selectedJob={selectedJob} />
    </div>
  );
};

export default AdminDashboard;
