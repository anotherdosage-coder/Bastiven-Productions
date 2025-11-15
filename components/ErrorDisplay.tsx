import React, { useState } from 'react';

interface ErrorDisplayProps {
  message: string;
  details?: string;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ message, details }) => {
  const [showDetails, setShowDetails] = useState(false);

  return (
    <div className="mt-6 p-4 bg-red-900/30 border border-red-800 text-red-200">
      <div className="flex justify-between items-center">
        <div className="flex items-center">
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-3 flex-shrink-0" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.21 3.03-1.742 3.03H4.42c-1.532 0-2.492-1.696-1.742-3.03l5.58-9.92zM10 13a1 1 0 110-2 1 1 0 010 2zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
          <p>{message}</p>
        </div>
        {details && (
          <button
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs bg-red-800/70 hover:bg-red-700 border border-red-600 px-2 py-1 transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        )}
      </div>
      {showDetails && details && (
        <pre className="mt-4 p-3 bg-black/50 text-xs text-gray-300 font-mono whitespace-pre-wrap overflow-auto max-h-48 border border-red-900">
          {details}
        </pre>
      )}
    </div>
  );
};

export default ErrorDisplay;