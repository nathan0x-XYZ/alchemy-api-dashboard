import React from 'react';

interface ErrorModalProps {
  isOpen: boolean;
  onClose: () => void;
  errors: {
    type: 'error' | 'warning';
    message: string;
    endpoint: string;
    timestamp: number;
    details?: string;
  }[];
}

export function ErrorModal({ isOpen, onClose, errors }: ErrorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
      <div className="bg-zinc-900 border border-zinc-800 rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden flex flex-col">
        <div className="p-4 border-b border-zinc-800 flex justify-between items-center">
          <h2 className="font-semibold text-white">All API Errors</h2>
          <button 
            onClick={onClose}
            className="text-zinc-400 hover:text-white"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        
        <div className="p-4 overflow-y-auto flex-1">
          {errors.length > 0 ? (
            <div className="space-y-3">
              {errors.map((error, index) => (
                <div key={index} className="card p-4">
                  <div className="flex items-start">
                    <div className={`mt-1 flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center ${error.type === 'error' ? 'bg-red-900/50 text-red-500' : 'bg-yellow-900/50 text-yellow-500'}`}>
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        {error.type === 'error' ? (
                          <circle cx="12" cy="12" r="10"></circle>
                        ) : (
                          <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
                        )}
                        <line x1="12" y1="8" x2="12" y2="12"></line>
                        <line x1="12" y1="16" x2="12.01" y2="16"></line>
                      </svg>
                    </div>
                    <div className="ml-3 flex-1">
                      <div className="flex justify-between">
                        <h4 className="text-sm font-medium text-white">{error.message}</h4>
                        <span className="text-xs text-zinc-500">{formatTimestamp(error.timestamp)}</span>
                      </div>
                      <p className="text-xs text-zinc-400 mt-1">
                        {error.details ? `Details: ${error.details}` : `Error on ${error.endpoint} endpoint`}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-zinc-400">No errors to display</p>
            </div>
          )}
        </div>
        
        <div className="p-4 border-t border-zinc-800 flex justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 text-white rounded-md text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

// Format timestamp as relative time
function formatTimestamp(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const diffMin = Math.round(diffSec / 60);
  const diffHour = Math.round(diffMin / 60);
  
  if (diffSec < 60) {
    return `${diffSec} seconds ago`;
  } else if (diffMin < 60) {
    return `${diffMin} minutes ago`;
  } else if (diffHour < 24) {
    return `${diffHour} hours ago`;
  } else {
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString();
  }
}
