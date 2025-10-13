// src/components/admin/ApplicantCard.tsx
import React from 'react';
import { Download, Check, X, TrendingUp } from 'lucide-react';
import type { Applicant } from '../types';
import { getStatusColor, getScoreColor } from './utils';

interface Props {
  applicant: Applicant;
  selected: boolean;
  onSelect: () => void;
  onUpdateStatus: (id: string, newStatus: Applicant['status']) => void;
}

const ApplicantCard: React.FC<Props> = ({ applicant, selected, onSelect, onUpdateStatus }) => (
  <div
    className={`bg-white rounded-lg p-6 mb-4 shadow-sm hover:shadow-md transition-all ${
      selected ? 'ring-2 ring-blue-500' : ''
    }`}
    onClick={onSelect}
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

        <div className={`flex items-center gap-2 px-3 py-1 rounded-lg mb-3 ${getScoreColor(applicant.aiScore)}`}>
          <TrendingUp className="w-4 h-4" />
          <span className="font-semibold">ATS Score: {applicant.aiScore}%</span>
        </div>

        <p className="text-xs text-gray-400">
          Resume: {applicant.filename} ({(applicant.fileSize / 1024).toFixed(1)} KB)
        </p>
      </div>

      <div className="flex flex-col gap-2 ml-4">
        <a
          href={applicant.resumeUrl}
          download={applicant.filename}
          className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 text-sm rounded-lg hover:bg-gray-50"
        >
          <Download className="w-4 h-4" /> Download
        </a>
        <div className="flex gap-2 mt-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(applicant.id, 'Shortlisted');
            }}
            disabled={applicant.status === 'Shortlisted'}
            className={`flex-1 p-2 rounded-lg ${
              applicant.status === 'Shortlisted'
                ? 'bg-gray-200 text-gray-400'
                : 'bg-green-500 text-white hover:bg-green-600'
            }`}
          >
            <Check className="w-4 h-4 mx-auto" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onUpdateStatus(applicant.id, 'Rejected');
            }}
            disabled={applicant.status === 'Rejected'}
            className={`flex-1 p-2 rounded-lg ${
              applicant.status === 'Rejected'
                ? 'bg-gray-200 text-gray-400'
                : 'bg-red-500 text-white hover:bg-red-600'
            }`}
          >
            <X className="w-4 h-4 mx-auto" />
          </button>
        </div>
      </div>
    </div>

    {selected && (
      <div className="mt-4 pt-4 border-t border-gray-200">
        <p className="text-sm font-semibold text-gray-700 mb-2">AI Analysis:</p>
        <div className="grid grid-cols-3 gap-3 text-xs">
          {['Skill Match', 'Experience', 'Overall Fit'].map((label, i) => (
            <div key={i}>
              <span className="text-gray-500">{label}:</span>
              <div className="mt-1 bg-gray-200 rounded-full h-2">
                <div
                  className={`${['bg-blue-600', 'bg-green-600', 'bg-purple-600'][i]} h-2 rounded-full`}
                  style={{ width: `${Math.min(applicant.aiScore + i * 5, 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    )}
  </div>
);

export default ApplicantCard;
