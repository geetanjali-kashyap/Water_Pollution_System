
import React from 'react';

const Footer: React.FC = () => {
  return (
    <footer className="bg-white border-t border-gray-200">
      <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-gray-500">&copy; {new Date().getFullYear()} Water Quality Prediction. All rights reserved.</p>
        <p className="text-sm text-gray-400 mt-1">
          {/* A demonstration app using React and Gemini API. */}
        </p>
      </div>
    </footer>
  );
};

export default Footer;
