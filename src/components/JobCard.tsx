import React from 'react';
import { Bookmark, BookmarkCheck } from 'lucide-react';
import type { Job } from './types';

interface JobCardProps {
  job: Job;
  isSelected: boolean;
  onSelect: () => void;
  onToggleSave: () => void;
}

const JobCard: React.FC<JobCardProps> = ({ job, isSelected, onSelect, onToggleSave }) => {
  return (
    <div
      className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'border-blue-500 shadow-md' : 'border-gray-200'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <img
            src={job.logo}
            alt={job.company}
            className="w-10 h-10 rounded-lg"
          />
          <div className="flex-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold text-gray-900">{job.title}</h3>
              <span className="text-2xl text-blue-500">+</span>
            </div>
            <p className="text-sm text-gray-600 mt-1">
              {job.description?.substring(0, 68)}.....
            </p>
            <div className="flex items-center space-x-4 mt-3">
              {job.isTrusted && (
                <span className="flex items-center text-xs text-orange-600">
                  <span className="mr-1">⭐</span> 4.3 Trusted
                </span>
              )}
              <span className="text-xs text-gray-500">{job.applicants} Applicants</span>
              {job.isVerified && (
                <span className="flex items-center text-xs text-blue-600">
                  <span className="mr-1">✓</span> Company Verified
                </span>
              )}
            </div>
          </div>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onToggleSave();
          }}
          className="p-1 hover:bg-gray-100 rounded"
        >
          {job.isSaved ? (
            <BookmarkCheck className="w-5 h-5 text-blue-600 fill-current" />
          ) : (
            <Bookmark className="w-5 h-5 text-gray-400" />
          )}
        </button>
      </div>
    </div>
  );
};

export default JobCard;