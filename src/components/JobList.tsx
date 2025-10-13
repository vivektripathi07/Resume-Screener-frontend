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
          key={job._id}
          job={job}
          isSelected={selectedJob?._id === job._id}
          onSelect={() => onSelectJob(job)}
          onToggleSave={() => onToggleSave(job._id)}
        />
      ))}
    </div>
  );
};

export default JobList;