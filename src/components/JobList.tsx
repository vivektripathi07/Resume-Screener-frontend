import React from 'react';
import JobCard from './JobCard';
import type { Job } from './types';

interface JobListProps {
  jobs: Job[];
  selectedJob: Job | null;
  onSelectJob: (job: Job) => void;
  onToggleSave: (jobId: string) => void;
}

const JobList: React.FC<JobListProps> = ({ jobs, selectedJob, onSelectJob, onToggleSave }) => {
  return (
    <div className="space-y-4">
      {jobs.map((job) => (
        <JobCard
          key={job.id}
          job={job}
          isSelected={selectedJob?.id === job.id}
          onSelect={() => onSelectJob(job)}
          onToggleSave={() => onToggleSave(job.id)}
        />
      ))}
    </div>
  );
};

export default JobList;