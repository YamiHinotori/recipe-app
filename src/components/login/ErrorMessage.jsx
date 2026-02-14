import React from 'react';
import { AlertCircle } from 'lucide-react';

/**
 * ErrorMessage - Fehlermeldungs-Banner
 * 
 * Zeigt Fehler mit Icon an
 * 
 * Props:
 * @param {string} message - Fehler-Text
 */
const ErrorMessage = ({ message }) => {
  return (
    <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
      <AlertCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
      <p className="text-sm text-red-800">
        {message}
      </p>
    </div>
  );
};

export default ErrorMessage;