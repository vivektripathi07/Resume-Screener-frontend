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