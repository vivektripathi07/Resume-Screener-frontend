import React, { useState, useEffect } from 'react';
import type { Job } from './types';

interface JobDetailsProps {
  job: Job;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [_uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('Just a minute...');
  const [progress, setProgress] = useState<number>(0);

  // Track if user has applied to this job
  const [hasApplied, setHasApplied] = useState<boolean>(() => {
    const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
    return appliedJobs.includes(job._id);
  });

  // Save applied status to localStorage whenever it changes
  useEffect(() => {
    if (hasApplied) {
      const appliedJobs = JSON.parse(localStorage.getItem('appliedJobs') || '[]');
      if (!appliedJobs.includes(job._id)) {
        localStorage.setItem('appliedJobs', JSON.stringify([...appliedJobs, job._id]));
      }
    }
  }, [hasApplied, job._id]);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    ];

    if (!allowedTypes.includes(selectedFile.type)) {
      setUploadError('Only PDF and Word documents are allowed');
      return;
    }

    setIsUploading(true);
    setUploadError(null);
    setUploadSuccess(false);
    setCurrentStep('Just a minute...');
    setProgress(0);

    const totalSteps = 5;
    const stepDuration = 8000; // ms
    const totalDuration = totalSteps * stepDuration; // 4000 ms

    // Simulate progress steps
    let stepIndex = 0;
    const stepInterval = setInterval(() => {
      stepIndex++;
      if (stepIndex <= totalSteps) {
        const steps = [
          'Just a minute...',
          'Parsing resume...',
          'Calculating ATS score...',
          'Matching similarity...',
          'Uploading resume...'
        ];
        setCurrentStep(steps[stepIndex - 1]);
        setProgress((stepIndex / totalSteps) * 100);
      }
    }, stepDuration);

    // Promise to resolve after full duration
    const waitForFullDuration = new Promise<void>((resolve) => {
      setTimeout(() => {
        clearInterval(stepInterval);
        resolve();
      }, totalDuration);
    });

    let uploadResult: { success: boolean; message?: string; error?: string } = {
      success: false,
    };

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const token = localStorage.getItem('access_token');
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`https://resume-screener-backend.vercel.app/upload-resume?job_id=${job._id}`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || 'Failed to upload resume');
      }

      const result = await response.json();
      console.log('Upload successful (early):', result);
      uploadResult = { success: true, message: 'Resume uploaded successfully!' };
    } catch (error: any) {
      console.error('Upload error:', error);
      uploadResult = { success: false, error: error.message || 'Failed to upload resume' };
    }

    // Wait for both: upload done AND full duration elapsed
    await waitForFullDuration;

    if (uploadResult.success) {
      setCurrentStep('Resume uploaded successfully!');
      setProgress(100);
      setHasApplied(true); // ✅ Mark as applied

      setTimeout(() => {
        closeModal();
      }, 2000);
    } else {
      setUploadError(uploadResult.error!);
      setCurrentStep('Upload failed.');
      setIsUploading(false);
      setProgress(0);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(false);
    setCurrentStep('Just a minute...');
    setProgress(0);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">▶</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold flex items-center">{job.title}</h2>
            <p className="text-gray-600 mt-1">{job.company}</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button
            className={`px-6 py-2 rounded-md text-sm font-medium text-white ${
              hasApplied
                ? 'bg-green-600 cursor-not-allowed'
                : 'bg-blue-600 hover:bg-blue-700'
            }`}
            onClick={() => !hasApplied && setIsUploadModalOpen(true)}
            disabled={hasApplied}
          >
            {hasApplied ? 'Applied' : 'Upload Resume'}
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-black/10 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg border border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Resume</h3>
              <button onClick={closeModal} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            <div className="space-y-4">
              {!isUploading && (
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={handleFileChange}
                    className="hidden"
                    id="resume-upload"
                  />
                  <label htmlFor="resume-upload" className="cursor-pointer">
                    {selectedFile ? (
                      <div className="text-blue-600">Selected: {selectedFile.name}</div>
                    ) : (
                      <div>
                        <p className="text-gray-600 mb-2">Click to select a file</p>
                        <p className="text-sm text-gray-500">PDF or Word document</p>
                      </div>
                    )}
                  </label>
                </div>
              )}

              {uploadError && <div className="text-red-500 text-sm">{uploadError}</div>}

              {isUploading ? (
                <div className="flex flex-col items-center justify-center py-4">
                  {/* Spinner */}
                  <div className="w-10 h-10 border-t-4 border-blue-600 border-solid rounded-full animate-spin mb-4"></div>

                  {/* Progress Bar */}
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                    <div
                      className="bg-blue-600 h-2 rounded-full transition-all duration-300 ease-in-out"
                      style={{ width: `${progress}%` }}
                    ></div>
                  </div>

                  {/* Status Message */}
                  <p className="text-gray-700 font-medium text-center px-2">{currentStep}</p>
                </div>
              ) : (
                <div className="flex justify-end space-x-3">
                  <button onClick={closeModal} className="px-4 py-2 text-gray-600 hover:text-gray-800">
                    Cancel
                  </button>
                  <button
                    onClick={handleUpload}
                    disabled={!selectedFile}
                    className={`px-4 py-2 rounded-md text-white ${
                      !selectedFile
                        ? 'bg-gray-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                  >
                    Upload
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Job Overview:</h3>
          <p className="text-gray-600 text-sm leading-relaxed">{job.description}</p>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Required Skills:</h3>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {job.requiredSkills.map((item, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Responsibilities:</h3>
          <ul className="space-y-2">
            {job.responsibilities.map((item, index) => (
              <li key={index} className="flex items-start text-sm text-gray-600">
                <span className="text-green-500 mr-2">✓</span>
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 flex flex-wrap gap-4 text-sm text-gray-600">
          <div className="flex items-center">
            <span className="font-medium mr-1">Compensation:</span>
            <span>{job.compensation}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-1">Location:</span>
            <span>{job.location}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-1">Type:</span>
            <span>{job.type}</span>
          </div>
          <div className="flex items-center">
            <span className="font-medium mr-1">Experience:</span>
            <span>{job.experience}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobDetails;