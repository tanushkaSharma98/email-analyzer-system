import React from 'react';
import { AlertCircle, X } from 'lucide-react';

const ErrorAlert = ({ message, onClose, className = '' }) => {
  return (
    <div className={`bg-danger-50 border border-danger-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <AlertCircle className="w-5 h-5 text-danger-400" />
        </div>
        <div className="ml-3 flex-1">
          <p className="text-sm text-danger-800">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex text-danger-400 hover:text-danger-600 focus:outline-none"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default ErrorAlert;
