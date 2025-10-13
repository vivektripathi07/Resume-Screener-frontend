// src/components/admin/utils.ts
import type { Applicant } from "../types";

export const getStatusColor = (status: string) => {
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

export const getScoreColor = (score: number) => {
  if (score >= 80) return 'text-green-600 bg-green-50';
  if (score >= 60) return 'text-yellow-600 bg-yellow-50';
  if (score >= 40) return 'text-orange-600 bg-orange-50';
  return 'text-red-600 bg-red-50';
};

export const extractNameFromEmail = (email: string): string => {
  const username = email.split('@')[0];
  return username
    .split(/[._-]/)
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ');
};

export const parseSkills = (skillsString: string): string[] => {
  if (!skillsString) return [];
  return skillsString.split(',').map(skill => skill.trim()).filter(skill => skill.length > 0);
};

export const determineInitialStatus = (score: string | number): Applicant['status'] => {
  const numScore = typeof score === 'string' ? parseInt(score) : score;
  if (numScore >= 80) return 'Shortlisted';
  if (numScore >= 60) return 'Reviewed';
  return 'Pending';
};
