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
}

export interface Applicant {
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
