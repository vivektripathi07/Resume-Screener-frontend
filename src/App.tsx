// App.tsx
import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import Header from './components/Header';
import HeroSection from './components/HeroSection';
import JobList from './components/JobList';
import JobDetails from './components/JobDetails';
import SignupForm from './components/SignUp';
import LoginForm from './components/Login';
import type { Job } from './components/types';
import { AuthProvider } from './components/AuthContext'; 
import { createContext, useContext } from 'react';
import AdminDashboard from './pages/AdminDashboard';
import AdminRoute from './components/AdminRoute';

type UserType = {
  name: string
  email: string
  role: string
}

type AuthContextType = {
  user: UserType | null
  login: (email: string, password: string) => Promise<void>
  signup: (email: string, password: string, name: string) => Promise<void>
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

const JobBoard: React.FC = () => {
  const [selectedJob, setSelectedJob] = useState<Job | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [_loading, setLoading] = useState(true);
  const [_error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const response = await fetch('https://resume-screener-backend.vercel.app/api/jobs');
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data: Job[] = await response.json();

        // Optional: Ensure logo URLs use hex color (defensive fix)
        const fixedJobs = data.map(job => ({
          ...job,
          logo: job.logo?.replace('color=white', 'color=ffffff') || job.logo,
        }));

        setJobs(fixedJobs);
        if (fixedJobs.length > 0 && !selectedJob) {
          setSelectedJob(fixedJobs[0]);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load jobs');
        console.error('Fetch error:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [selectedJob]);

  const toggleSaveJob = (jobId: string) => {
    // You can enhance this later with context or API call
    console.log('Toggle save:', jobId);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <HeroSection/>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold">Available Jobs</h2>
          </div>
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <JobList
            jobs={jobs}
            selectedJob={selectedJob}
            onSelectJob={setSelectedJob}
            onToggleSave={toggleSaveJob}
          />
          {selectedJob && <JobDetails job={selectedJob} />}
        </div>
      </div>
    </div>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public auth pages */}
          <Route path="/login" element={<LoginForm />} />
          <Route path="/signup" element={<SignupForm />} />
          <Route
            path="/admin-dashboard"
            element={
              <AdminRoute>
                <AdminDashboard />
              </AdminRoute>
            }
          />

          {/* Main job board */}
          <Route path="/" element={<JobBoard />} />

          {/* Catch-all redirect */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App;