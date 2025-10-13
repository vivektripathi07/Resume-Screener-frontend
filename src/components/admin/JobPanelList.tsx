// src/components/admin/JobListPanel.tsx
import React from 'react';
import { Search, Filter, MapPin, Briefcase, Clock } from 'lucide-react';
import type { Job } from '../types';
import { getStatusColor } from './utils';

interface Props {
  jobs: Job[];
  selectedJob: Job | null;
  onSelect: (job: Job) => void;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

const JobListPanel: React.FC<Props> = ({ jobs, selectedJob, onSelect, searchTerm, setSearchTerm }) => (
  <div className="w-1/3 bg-white border-r border-gray-200 overflow-y-auto">
    <div className="sticky top-0 bg-white z-10 p-4 border-b border-gray-200">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold text-gray-900">Job Openings ({jobs.length})</h2>
        <Filter className="text-blue-600 w-5 h-5 cursor-pointer" />
      </div>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
        <input
          type="text"
          placeholder="Search jobs..."
          className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
        />
      </div>
    </div>

    <div className="p-4">
      {jobs
        .filter((j) => j.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .map((job) => (
          <div
            key={job._id}
            onClick={() => onSelect(job)}
            className={`mb-3 p-4 rounded-lg border-2 cursor-pointer transition-all hover:shadow-md ${
              selectedJob?._id === job._id ? 'border-blue-500 bg-blue-50' : 'border-gray-200 bg-white'
            }`}
          >
            <div className="flex items-start justify-between mb-2">
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              {/* <span className={`px-2 py-1 text-xs rounded-full ${getStatusColor(job.status || 'Active')}`}>
                {job.status}
              </span> */}
            </div>
            <p className="text-sm text-gray-600 mb-3">{job.company}</p>
            <div className="flex items-center gap-4 text-xs text-gray-500">
              <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {job.location}</span>
              <span className="flex items-center gap-1"><Briefcase className="w-3 h-3" /> {job.type}</span>
            </div>
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <Clock className="w-3 h-3" /> {job.experience}
              </span>
            </div>
          </div>
        ))}
    </div>
  </div>
);

export default JobListPanel;
