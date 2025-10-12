import React, { useState } from 'react';
import type { Job } from './types';

interface JobDetailsProps {
  job: Job;
}

const JobDetails: React.FC<JobDetailsProps> = ({ job }) => {
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadSuccess, setUploadSuccess] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    setSelectedFile(file);
    setUploadError(null); // Clear any previous errors
  };

  const handleUpload = async () => {
    if (!selectedFile) {
      setUploadError('Please select a file first');
      return;
    }

    // Validate file type on frontend
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

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);
      // console.log(formData)
      // console.log(job._id)
      // formData.append('job_id', job._id); 

      const token = localStorage.getItem('access_token'); // Adjust based on how you store your token
      
      if (!token) {
        throw new Error('No authentication token found. Please log in again.');
      }

      const response = await fetch(`http://127.0.0.1:8000/upload-resume?job_id=${job._id}`, {
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
      console.log('Upload successful:', result);
      setUploadSuccess(true);
      
      // Close modal after 2 seconds
      setTimeout(() => {
        setIsUploadModalOpen(false);
        setUploadSuccess(false);
        setSelectedFile(null);
      }, 2000);

    } catch (error: any) {
      console.error('Upload error:', error);
      setUploadError(error.message || 'Failed to upload resume');
    } finally {
      setIsUploading(false);
    }
  };

  const closeModal = () => {
    setIsUploadModalOpen(false);
    setSelectedFile(null);
    setUploadError(null);
    setUploadSuccess(false);
    setIsUploading(false);
  };

  return (
    <div className="bg-white rounded-lg border border-gray-200 p-6 h-fit">
      <div className="flex items-start justify-between mb-6">
        <div className="flex items-start space-x-4">
          <div className="w-12 h-12 bg-blue-600 rounded-lg flex items-center justify-center">
            <span className="text-white text-xl">▶</span>
          </div>
          <div>
            <h2 className="text-xl font-semibold flex items-center">
              {job.title}
            </h2>
            <p className="text-gray-600 mt-1">
              {job.company}
            </p>
          </div>
        </div>
        <div className="flex space-x-2">
          <button 
            className="bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 text-sm font-medium"
            onClick={() => setIsUploadModalOpen(true)}
          >
            Upload Resume
          </button>
        </div>
      </div>

      {/* Upload Modal */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 bg-white/15 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md mx-4 shadow-lg border-1 border-blue-500">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold">Upload Resume</h3>
              <button 
                onClick={closeModal}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4">
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
                    <div className="text-blue-600">
                      Selected: {selectedFile.name}
                    </div>
                  ) : (
                    <div>
                      <p className="text-gray-600 mb-2">Click to select a file</p>
                      <p className="text-sm text-gray-500">PDF or Word document</p>
                    </div>
                  )}
                </label>
              </div>

              {uploadError && (
                <div className="text-red-500 text-sm">{uploadError}</div>
              )}

              {uploadSuccess && (
                <div className="text-green-500 text-sm">
                  Resume uploaded successfully!
                </div>
              )}

              <div className="flex justify-end space-x-3">
                <button
                  onClick={closeModal}
                  className="px-4 py-2 text-gray-600 hover:text-gray-800"
                >
                  Cancel
                </button>
                <button
                  onClick={handleUpload}
                  disabled={!selectedFile || isUploading || uploadSuccess}
                  className={`px-4 py-2 rounded-md text-white ${
                    isUploading || uploadSuccess
                      ? 'bg-gray-400 cursor-not-allowed'
                      : 'bg-blue-600 hover:bg-blue-700'
                  }`}
                >
                  {isUploading ? 'Uploading...' : uploadSuccess ? 'Uploaded!' : 'Upload'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}


      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-gray-900 mb-3">Job Overview:</h3>
          <p className="text-gray-600 text-sm leading-relaxed">
            {job.description}
          </p>
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
          <h3 className="font-semibold text-gray-900 mb-3">
            Responsiblities:
          </h3>
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