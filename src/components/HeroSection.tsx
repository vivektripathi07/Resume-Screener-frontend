// components/HeroSection.tsx
import React from 'react';

const HeroSection: React.FC = ({
}) => {
  return (
    <div className="bg-gradient-to-r from-blue-500 to-blue-600 relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-black rounded-full transform translate-x-1/2 -translate-y-1/2"></div>
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black rounded-full transform -translate-x-1/2 translate-y-1/2"></div>
      </div>
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-4xl font-bold text-white mb-2">Find your dream job</h1>
        <p className="text-blue-100 mb-8">Looking for jobs? Browse our latest job opening to view</p>
        
      </div>
    </div>
  );
};

export default HeroSection;