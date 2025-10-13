// src/components/admin/ApplicantList.tsx
import React, { useEffect, useState } from 'react';
import { Users } from 'lucide-react';
import type { Applicant, Job } from '../types';
import ApplicantCard from './ApplicantCard';
import { extractNameFromEmail, parseSkills, determineInitialStatus } from './utils';

interface Props {
  selectedJob: Job | null;
}

const ApplicantList: React.FC<Props> = ({ selectedJob }) => {
  const [applicants, setApplicants] = useState<Applicant[]>([]);
  const [selectedApplicant, setSelectedApplicant] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState<'date' | 'score'>('score');

  useEffect(() => {
    if (!selectedJob) return;
    const fetchApplicants = async () => {
      const res = await fetch(`http://localhost:8000/api/applicants?jobId=${selectedJob._id}`);
      const data = await res.json();

      const mapped: Applicant[] = data.map((app: any) => ({
        id: app._id.toString(),
        name: extractNameFromEmail(app.user_email),
        email: app.user_email,
        appliedDate: new Date(app.uploaded_at).toLocaleDateString(),
        experience: '2-5 years',
        resumeUrl: `http://localhost:8000/api/applicant/file?applicantId=${app._id.toString()}`,
        status: determineInitialStatus(app.ai_score),
        jobId: app.job_id,
        skills: parseSkills(app.skills),
        education: 'N/A',
        aiScore: parseInt(app.ai_score) || 0,
        fileSize: app.size,
        filename: app.filename,
      }));

      setApplicants(mapped.sort((a, b) => b.aiScore - a.aiScore));
    };
    fetchApplicants();
  }, [selectedJob]);

  const updateApplicantStatus = async (id: string, status: Applicant['status']) => {
    setApplicants((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)));
    await fetch(`http://localhost:8000/api/applicants/${id}/status`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ status }),
    });
  };

  const filtered = applicants
    .filter((a) => (statusFilter === 'all' ? true : a.status.toLowerCase() === statusFilter))
    .sort((a, b) => (sortBy === 'score' ? b.aiScore - a.aiScore : b.appliedDate.localeCompare(a.appliedDate)));

  if (!selectedJob)
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500">
        <Users className="w-12 h-12 mb-4 text-gray-300" />
        <p className="text-lg">Select a job to view applicants</p>
      </div>
    );

  return (
    <div className="flex-1 bg-gray-50 overflow-y-auto p-6">
      <div className="mb-6 flex gap-4 items-center">
        <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="px-4 py-2 border rounded-lg">
          <option value="all">All Status</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="shortlisted">Shortlisted</option>
          <option value="rejected">Rejected</option>
        </select>

        <select value={sortBy} onChange={(e) => setSortBy(e.target.value as 'date' | 'score')} className="px-4 py-2 border rounded-lg">
          <option value="score">Sort by ATS Score</option>
          <option value="date">Sort by Date</option>
        </select>

        <div className="ml-auto text-sm text-gray-600">
          Showing {filtered.length} of {applicants.length} applicants
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center text-gray-500 shadow">
          <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
          No applicants found.
        </div>
      ) : (
        filtered.map((a) => (
          <ApplicantCard
            key={a.id}
            applicant={a}
            selected={selectedApplicant === a.id}
            onSelect={() => setSelectedApplicant(a.id)}
            onUpdateStatus={updateApplicantStatus}
          />
        ))
      )}
    </div>
  );
};

export default ApplicantList;
